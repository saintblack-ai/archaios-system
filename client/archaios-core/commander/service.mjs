import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { buildOperatingSnapshot } from "../runtime/runtime-health.mjs";

const STATUS = {
  green: "green",
  amber: "amber",
  red: "red"
};

const REVENUE_WEIGHT = 4;
const SECURITY_WEIGHT = 4;
const PRODUCTION_WEIGHT = 3;
const OPERATIONS_WEIGHT = 2;

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function readText(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function listFiles(dirPath, predicate = () => true) {
  try {
    return fs.readdirSync(dirPath).filter(predicate);
  } catch {
    return [];
  }
}

function countFiles(dirPath, predicate = () => true) {
  return listFiles(dirPath, predicate).length;
}

function runGit(rootDir, args, fallback = "") {
  try {
    return execFileSync("git", args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"]
    }).trim();
  } catch {
    return fallback;
  }
}

function statusFromScore(score) {
  if (score >= 8) return STATUS.red;
  if (score >= 3) return STATUS.amber;
  return STATUS.green;
}

function createMonitor({
  key,
  label,
  status,
  priority,
  summary,
  findings = [],
  actions = [],
  metrics = {},
  risks = []
}) {
  return {
    key,
    label,
    status,
    priority,
    summary,
    findings,
    actions,
    metrics,
    risks
  };
}

function monitorUnfinishedWork(rootDir, operatingSnapshot) {
  const gitStatus = runGit(rootDir, ["status", "--short"]);
  const dirtyLines = gitStatus ? gitStatus.split("\n").filter(Boolean) : [];
  const taskQueues = operatingSnapshot.taskQueues;
  const score = taskQueues.blocked * 2 + taskQueues.inProgress + Math.min(dirtyLines.length, 6);

  return createMonitor({
    key: "unfinished-work",
    label: "Unfinished Work",
    status: statusFromScore(score),
    priority: OPERATIONS_WEIGHT,
    summary: `${taskQueues.inProgress} in progress, ${taskQueues.blocked} blocked, ${dirtyLines.length} unstaged/untracked git entries.`,
    findings: dirtyLines.slice(0, 5),
    actions: [
      "Review blocked and in-progress tasks before accepting new work.",
      "Keep release branches clean before deployment.",
      "Classify untracked files as commit-ready, work-in-progress, experimental, or disposable."
    ],
    metrics: {
      queued: taskQueues.queue,
      prioritized: taskQueues.prioritized,
      inProgress: taskQueues.inProgress,
      completed: taskQueues.completed,
      blocked: taskQueues.blocked,
      dirtyGitEntries: dirtyLines.length
    },
    risks: dirtyLines.length ? ["Dirty worktree can hide release drift."] : []
  });
}

function monitorRevenue(rootDir) {
  const kpis = readJson(path.join(rootDir, "client", "data", "kpis.json"), {});
  const readiness = readJson(path.join(rootDir, "client", "revenue", "revenue-readiness.json"), {});
  const systems = Array.isArray(readiness.systems) ? readiness.systems : [];
  const highReadiness = systems.filter((system) => system.readinessState === "high").length;
  const blocked = systems.filter((system) => /waiting|blocked|missing/i.test(String(system.readinessState || ""))).length;

  return createMonitor({
    key: "revenue",
    label: "Revenue Priority",
    status: highReadiness ? STATUS.green : STATUS.amber,
    priority: REVENUE_WEIGHT,
    summary: `${systems.length} revenue systems tracked; ${highReadiness} high-readiness paths; projected monthly revenue $${Number(kpis.estimatedMonthlyRevenue || 0).toLocaleString()}.`,
    findings: systems.slice(0, 4).map((system) => `${system.name}: ${system.nextLocalAction}`),
    actions: [
      "Advance the highest-readiness revenue system first.",
      "Keep self-serve billing gated until Stripe, Supabase, legal, and support checks pass.",
      "Replace projections with verified Stripe/Supabase metrics when live data is available."
    ],
    metrics: {
      estimatedMonthlyRevenue: kpis.estimatedMonthlyRevenue || 0,
      annualRevenueTarget: kpis.annualRevenueTarget || 0,
      conversionScore: kpis.conversionScore || 0,
      trackedSystems: systems.length,
      highReadiness,
      blocked
    },
    risks: ["Revenue dashboard still contains projections until live billing metrics are verified."]
  });
}

function monitorSecurity(rootDir, operatingSnapshot) {
  const secretInventory = exists(path.join(rootDir, "SECRET_INVENTORY.md"));
  const envExample = exists(path.join(rootDir, ".env.example"));
  const gitignore = readText(path.join(rootDir, ".gitignore"));
  const ignoresEnv = /\.env/.test(gitignore) && /secrets\//.test(gitignore);
  const missing = [];
  if (!secretInventory) missing.push("SECRET_INVENTORY.md");
  if (!envExample) missing.push(".env.example");
  if (!ignoresEnv) missing.push(".gitignore secret/env coverage");

  return createMonitor({
    key: "security",
    label: "Security Priority",
    status: missing.length || !operatingSnapshot.security.ready ? STATUS.amber : STATUS.green,
    priority: SECURITY_WEIGHT,
    summary: `${operatingSnapshot.security.implemented}/${operatingSnapshot.security.controls} local security control signals present.`,
    findings: Object.entries(operatingSnapshot.security.signals).map(([name, present]) => `${name}: ${present ? "present" : "missing"}`),
    actions: [
      "Block production deploys until secrets, billing, and Supabase service-role paths are verified.",
      "Keep service-role keys server-side only.",
      "Record approval before any deployment, billing, or destructive operation."
    ],
    metrics: {
      implementedControls: operatingSnapshot.security.implemented,
      requiredControls: operatingSnapshot.security.controls,
      missingLocalArtifacts: missing.length
    },
    risks: missing
  });
}

function monitorDeployments(rootDir) {
  const githubPagesWorkflow = exists(path.join(rootDir, ".github", "workflows", "deploy.yml"));
  const heartbeatWorkflow = exists(path.join(rootDir, ".github", "workflows", "worker_heartbeat.yml"));
  const vercelProject = readJson(path.join(rootDir, "client", ".vercel", "project.json"), null);
  const clientVercelConfig = exists(path.join(rootDir, "client", "vercel.json"));
  const rootWrangler = exists(path.join(rootDir, "wrangler.toml"));
  const clientWrangler = exists(path.join(rootDir, "client", "wrangler.jsonc"));
  const readiness = [githubPagesWorkflow, heartbeatWorkflow, clientVercelConfig, rootWrangler || clientWrangler].filter(Boolean).length;

  return createMonitor({
    key: "deployments",
    label: "Deployment Tracking",
    status: readiness >= 4 ? STATUS.green : STATUS.amber,
    priority: PRODUCTION_WEIGHT,
    summary: `Deployment evidence: GitHub Pages workflow ${githubPagesWorkflow ? "present" : "missing"}, heartbeat ${heartbeatWorkflow ? "present" : "missing"}, Vercel ${vercelProject ? "linked" : "not linked"}, Cloudflare config ${rootWrangler || clientWrangler ? "present" : "missing"}.`,
    findings: [
      `GitHub Pages workflow: ${githubPagesWorkflow ? "present" : "missing"}`,
      `Worker heartbeat workflow: ${heartbeatWorkflow ? "present" : "missing"}`,
      `Vercel project: ${vercelProject?.projectName || "not linked"}`,
      `Cloudflare config: ${clientWrangler ? "client worker config present" : rootWrangler ? "root worker config present" : "missing"}`
    ],
    actions: [
      "Choose canonical frontend host before production release.",
      "Align root and client Cloudflare Worker identities.",
      "Require tests and build before deployment promotion."
    ],
    metrics: {
      deploymentSignals: readiness,
      vercelLinked: Boolean(vercelProject),
      githubPagesWorkflow,
      cloudflareConfig: rootWrangler || clientWrangler
    },
    risks: rootWrangler && clientWrangler ? ["Two Cloudflare config surfaces can drift."] : []
  });
}

function monitorGithub(rootDir) {
  const remote = runGit(rootDir, ["remote", "get-url", "origin"], "not-configured");
  const branch = runGit(rootDir, ["branch", "--show-current"], "unknown");
  const head = runGit(rootDir, ["log", "-1", "--oneline"], "unknown");
  const workflows = listFiles(path.join(rootDir, ".github", "workflows"), (file) => file.endsWith(".yml") || file.endsWith(".yaml"));
  const status = remote !== "not-configured" && workflows.length ? STATUS.green : STATUS.amber;

  return createMonitor({
    key: "github",
    label: "GitHub Monitor",
    status,
    priority: PRODUCTION_WEIGHT,
    summary: `Branch ${branch}; remote ${remote}; ${workflows.length} workflow files present.`,
    findings: [`HEAD: ${head}`, ...workflows.map((workflow) => `.github/workflows/${workflow}`)],
    actions: [
      "Push logical commits only after local validation passes.",
      "Review GitHub Actions status for the pushed commit before deploy.",
      "Keep release branches free of temp files."
    ],
    metrics: {
      workflows: workflows.length,
      branch,
      remoteConfigured: remote !== "not-configured"
    },
    risks: branch !== "main" ? [`Current branch is ${branch}, not main.`] : []
  });
}

function monitorSupabase(rootDir) {
  const migrationDir = path.join(rootDir, "client", "supabase", "sql");
  const migrations = listFiles(migrationDir, (file) => file.endsWith(".sql"));
  const memoryMigration = migrations.includes("2026-06-28_archaios_semantic_memory.sql");
  const commandMigration = migrations.includes("2026-06-17_archaios_command_center_v1.sql");
  const archivistMigration = migrations.includes("2026-06-20_archivist_mvp.sql");
  const subscriptionMigration = migrations.includes("2026-06-20_subscription_upsert_contract.sql");

  return createMonitor({
    key: "supabase",
    label: "Supabase Monitor",
    status: memoryMigration && commandMigration && archivistMigration && subscriptionMigration ? STATUS.green : STATUS.amber,
    priority: PRODUCTION_WEIGHT,
    summary: `${migrations.length} client Supabase migrations tracked; semantic memory, command center, Archivist, and subscription contracts are ${memoryMigration && commandMigration && archivistMigration && subscriptionMigration ? "present" : "incomplete"}.`,
    findings: [
      `Semantic memory migration: ${memoryMigration ? "present" : "missing"}`,
      `Command center migration: ${commandMigration ? "present" : "missing"}`,
      `Archivist migration: ${archivistMigration ? "present" : "missing"}`,
      `Subscription upsert migration: ${subscriptionMigration ? "present" : "missing"}`
    ],
    actions: [
      "Verify migrations are applied to the live Supabase project.",
      "Confirm RLS policies for profiles, subscriptions, Archivist, and semantic memory.",
      "Validate service-role key only in server/Worker runtime."
    ],
    metrics: {
      migrations: migrations.length,
      semanticMemoryReady: memoryMigration,
      commandCenterReady: commandMigration,
      archivistReady: archivistMigration,
      subscriptionContractReady: subscriptionMigration
    },
    risks: ["Local migration presence does not prove live Supabase application."]
  });
}

function monitorStripe(rootDir) {
  const workerText = readText(path.join(rootDir, "client", "worker", "index.js"));
  const rootWorkerText = readText(path.join(rootDir, "worker.js"));
  const envExample = readText(path.join(rootDir, ".env.example"));
  const hasCheckout = /api\/stripe\/checkout|createStripeCheckoutSession/.test(workerText + rootWorkerText);
  const hasWebhook = /STRIPE_WEBHOOK_SECRET|verifyStripeSignature/.test(workerText + rootWorkerText);
  const hasPrices = /STRIPE_PRICE_PRO/.test(envExample) && /STRIPE_PRICE_ELITE/.test(envExample);
  const score = [hasCheckout, hasWebhook, hasPrices].filter(Boolean).length;

  return createMonitor({
    key: "stripe",
    label: "Stripe Monitor",
    status: score === 3 ? STATUS.amber : STATUS.red,
    priority: REVENUE_WEIGHT,
    summary: `Stripe code paths ${hasCheckout ? "include checkout" : "missing checkout"}, ${hasWebhook ? "include webhook signature checks" : "missing webhook checks"}, and ${hasPrices ? "document Pro/Elite prices" : "lack price docs"}.`,
    findings: [
      `Checkout handler: ${hasCheckout ? "present" : "missing"}`,
      `Webhook signature verification: ${hasWebhook ? "present" : "missing"}`,
      `Pro/Elite env placeholders: ${hasPrices ? "present" : "missing"}`
    ],
    actions: [
      "Verify Stripe test/live price IDs before paid launch.",
      "Confirm webhook endpoint and required subscription events.",
      "Run test-mode checkout and subscription sync before production promotion."
    ],
    metrics: {
      checkoutPathPresent: hasCheckout,
      webhookVerificationPresent: hasWebhook,
      pricePlaceholdersPresent: hasPrices
    },
    risks: ["Stripe live readiness cannot be inferred from local code alone."]
  });
}

function monitorCloudflare(rootDir) {
  const rootWrangler = readText(path.join(rootDir, "wrangler.toml"));
  const clientWrangler = readText(path.join(rootDir, "client", "wrangler.jsonc"));
  const hasRootWorker = exists(path.join(rootDir, "worker.js"));
  const hasClientWorker = exists(path.join(rootDir, "client", "worker", "index.js"));
  const rootName = rootWrangler.match(/name\s*=\s*"([^"]+)"/)?.[1] || "";
  const clientName = clientWrangler.match(/"name"\s*:\s*"([^"]+)"/)?.[1] || "";

  return createMonitor({
    key: "cloudflare",
    label: "Cloudflare Monitor",
    status: rootName && clientName && rootName !== clientName ? STATUS.amber : STATUS.green,
    priority: PRODUCTION_WEIGHT,
    summary: `Cloudflare configs detected: root ${rootName || "missing"}, client ${clientName || "missing"}.`,
    findings: [
      `Root Worker source: ${hasRootWorker ? "worker.js present" : "missing"}`,
      `Client Worker source: ${hasClientWorker ? "client/worker/index.js present" : "missing"}`,
      `Root wrangler name: ${rootName || "missing"}`,
      `Client wrangler name: ${clientName || "missing"}`
    ],
    actions: [
      "Align Worker identity and health response.",
      "Document which Worker is canonical for SaaS API, cron, and daily automation.",
      "Run Wrangler deploy validation before release."
    ],
    metrics: {
      rootWorkerPresent: hasRootWorker,
      clientWorkerPresent: hasClientWorker,
      rootName,
      clientName
    },
    risks: rootName && clientName && rootName !== clientName ? ["Cloudflare Worker naming drift detected."] : []
  });
}

function monitorDocumentation(rootDir) {
  const docsCount = countFiles(path.join(rootDir, "docs"), (file) => file.endsWith(".md"));
  const reportsCount = countFiles(path.join(rootDir, "reports"), (file) => file.endsWith(".md"));
  const commandDoc = exists(path.join(rootDir, "client", "docs", "DAILY_COMMAND_CENTER.md"));
  const secretInventory = exists(path.join(rootDir, "SECRET_INVENTORY.md"));
  const systemArchitecture = exists(path.join(rootDir, "SYSTEM_ARCHITECTURE.md"));

  return createMonitor({
    key: "documentation",
    label: "Documentation Monitor",
    status: commandDoc && secretInventory && systemArchitecture ? STATUS.green : STATUS.amber,
    priority: OPERATIONS_WEIGHT,
    summary: `${docsCount} docs and ${reportsCount} reports tracked; Daily Command Center docs ${commandDoc ? "present" : "missing"}.`,
    findings: [
      `docs/*.md: ${docsCount}`,
      `reports/*.md: ${reportsCount}`,
      `Daily Command Center doc: ${commandDoc ? "present" : "missing"}`,
      `Secret inventory: ${secretInventory ? "present" : "missing"}`,
      `System architecture: ${systemArchitecture ? "present" : "missing"}`
    ],
    actions: [
      "Keep one canonical production release checklist.",
      "Mark outdated host/deploy docs as archived or superseded.",
      "Promote Executive Brief outputs into operator records."
    ],
    metrics: { docsCount, reportsCount, commandDoc, secretInventory, systemArchitecture },
    risks: docsCount > 20 ? ["Documentation volume may obscure canonical instructions."] : []
  });
}

function monitorTests(rootDir) {
  const testFiles = listFiles(path.join(rootDir, "tests"), (file) => file.endsWith(".mjs"));
  const packageJson = readJson(path.join(rootDir, "package.json"), {});
  const clientPackageJson = readJson(path.join(rootDir, "client", "package.json"), {});
  const hasClientBuild = Boolean(clientPackageJson.scripts?.build);
  const hasServerCheck = Boolean(packageJson.scripts?.["check:server"]);

  return createMonitor({
    key: "tests",
    label: "Test Monitor",
    status: testFiles.length >= 4 && hasClientBuild ? STATUS.green : STATUS.amber,
    priority: PRODUCTION_WEIGHT,
    summary: `${testFiles.length} Node test files tracked; client build script ${hasClientBuild ? "present" : "missing"}; server check script ${hasServerCheck ? "present" : "missing"}.`,
    findings: testFiles.map((file) => `tests/${file}`),
    actions: [
      "Run Node tests before commits.",
      "Run client build before deploy.",
      "Add Worker-specific deploy validation beyond Wrangler help output."
    ],
    metrics: {
      testFiles: testFiles.length,
      hasClientBuild,
      hasServerCheck
    },
    risks: ["Current Worker check script does not prove deployment readiness."]
  });
}

function sortMonitorActions(monitors) {
  return monitors
    .flatMap((monitor) => monitor.actions.map((action, index) => ({
      action,
      source: monitor.key,
      status: monitor.status,
      score: monitor.priority * (monitor.status === STATUS.red ? 3 : monitor.status === STATUS.amber ? 2 : 1) - index
    })))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ action, source, status }) => ({ action, source, status }));
}

function buildExecutiveBrief(monitors) {
  const red = monitors.filter((monitor) => monitor.status === STATUS.red).length;
  const amber = monitors.filter((monitor) => monitor.status === STATUS.amber).length;
  const green = monitors.filter((monitor) => monitor.status === STATUS.green).length;
  const status = red ? STATUS.red : amber ? STATUS.amber : STATUS.green;
  const revenue = monitors.find((monitor) => monitor.key === "revenue");
  const security = monitors.find((monitor) => monitor.key === "security");
  const unfinished = monitors.find((monitor) => monitor.key === "unfinished-work");
  const deployments = monitors.find((monitor) => monitor.key === "deployments");

  return {
    title: "ARCHAIOS Executive Officer Morning Brief",
    status,
    summary: `XO reviewed ${monitors.length} command sectors: ${green} green, ${amber} watch, ${red} critical.`,
    commandIntent: [
      "Protect revenue path without bypassing legal, Stripe, Supabase, or security gates.",
      "Clear unfinished work before expanding scope.",
      "Keep deployment promotion evidence-based and reversible."
    ],
    topPriorities: [
      {
        area: "Revenue",
        status: revenue?.status || STATUS.amber,
        order: 1,
        directive: revenue?.actions?.[0] || "Advance the highest-readiness revenue path."
      },
      {
        area: "Security",
        status: security?.status || STATUS.amber,
        order: 2,
        directive: security?.actions?.[0] || "Keep production gates closed until verified."
      },
      {
        area: "Unfinished Work",
        status: unfinished?.status || STATUS.amber,
        order: 3,
        directive: unfinished?.actions?.[0] || "Review blocked and in-progress work."
      },
      {
        area: "Deployment",
        status: deployments?.status || STATUS.amber,
        order: 4,
        directive: deployments?.actions?.[0] || "Validate deployment path."
      }
    ],
    actionQueue: sortMonitorActions(monitors),
    watchlist: monitors
      .filter((monitor) => monitor.status !== STATUS.green || monitor.risks.length)
      .map((monitor) => ({
        area: monitor.label,
        status: monitor.status,
        risks: monitor.risks.slice(0, 3)
      }))
  };
}

export function buildCommanderExecutiveService(rootDir = process.cwd(), options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const operatingSnapshot = buildOperatingSnapshot(rootDir);
  const monitors = [
    monitorUnfinishedWork(rootDir, operatingSnapshot),
    monitorRevenue(rootDir),
    monitorSecurity(rootDir, operatingSnapshot),
    monitorDeployments(rootDir),
    monitorGithub(rootDir),
    monitorSupabase(rootDir),
    monitorStripe(rootDir),
    monitorCloudflare(rootDir),
    monitorDocumentation(rootDir),
    monitorTests(rootDir)
  ];

  return {
    generatedAt,
    service: "archaios-commander-executive-officer",
    version: "2026-07-01",
    role: "AI Executive Officer",
    doctrine: {
      revenuePriority: "Revenue work outranks expansion work when launch gates are safe.",
      securityPriority: "Security can block revenue, deployment, and automation.",
      deploymentPriority: "Deployments require clean worktree, tests, env verification, and rollback path.",
      documentationPriority: "Docs must identify canonical commands and avoid conflicting launch authority."
    },
    monitors,
    executiveBrief: buildExecutiveBrief(monitors)
  };
}
