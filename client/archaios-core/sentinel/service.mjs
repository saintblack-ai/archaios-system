import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const STATUS = {
  green: "green",
  amber: "amber",
  red: "red"
};

const SECTORS = [
  "github",
  "dependencies",
  "secrets",
  "authentication",
  "cloudflare",
  "supabase",
  "stripe",
  "api-keys",
  "certificates",
  "broken-links",
  "deployments"
];

const SKIP_DIRS = new Set([
  ".git",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".vercel",
  ".wrangler",
  ".venv",
  "venv",
  "__pycache__"
]);

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".json",
  ".md",
  ".yml",
  ".yaml",
  ".toml",
  ".sql",
  ".sh",
  ".env",
  ".example",
  ".txt"
]);

function exists(filePath) {
  return fs.existsSync(filePath);
}

function readText(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
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

function runCommand(rootDir, command, args, fallback = "") {
  try {
    return execFileSync(command, args, {
      cwd: rootDir,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 1024 * 1024 * 8
    }).trim();
  } catch {
    return fallback;
  }
}

function walkFiles(rootDir, options = {}) {
  const {
    maxFiles = 6000,
    extensions = null,
    includeHidden = false
  } = options;
  const files = [];

  function walk(dirPath) {
    if (files.length >= maxFiles) return;
    let entries = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      if (files.length >= maxFiles) return;
      if (!includeHidden && entry.name.startsWith(".") && entry.name !== ".github") continue;
      const target = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(target);
        continue;
      }
      const ext = path.extname(entry.name);
      if (!extensions || extensions.has(ext) || extensions.has(entry.name)) {
        files.push(target);
      }
    }
  }

  walk(rootDir);
  return files;
}

function trackedFiles(rootDir, options = {}) {
  const { extensions = null, maxFiles = 10000 } = options;
  const output = runGit(rootDir, ["ls-files"], "");
  if (!output) return [];
  return output
    .split("\n")
    .filter(Boolean)
    .filter((file) => {
      if (!extensions) return true;
      const ext = path.extname(file);
      return extensions.has(ext) || extensions.has(path.basename(file));
    })
    .slice(0, maxFiles)
    .map((file) => path.join(rootDir, file));
}

function relative(rootDir, filePath) {
  return path.relative(rootDir, filePath).replaceAll(path.sep, "/");
}

function createFinding({ sector, severity = "medium", title, evidence, action, owner = "security", blockedBy = [] }) {
  return {
    id: `${sector}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 54)}`,
    sector,
    severity,
    title,
    evidence,
    action,
    owner,
    blockedBy
  };
}

function existingScanTargets(rootDir, targets) {
  return targets.filter((target) => exists(path.join(rootDir, target)));
}

function sectorStatus(findings) {
  if (findings.some((finding) => finding.severity === "critical" || finding.severity === "high")) return STATUS.red;
  if (findings.length) return STATUS.amber;
  return STATUS.green;
}

function summarizeSector(key, label, findings, coverage) {
  return {
    key,
    label,
    status: sectorStatus(findings),
    actionableFindings: findings.length,
    coverage
  };
}

function scanGithub(rootDir) {
  const findings = [];
  const deployWorkflow = path.join(rootDir, ".github", "workflows", "deploy.yml");
  const heartbeatWorkflow = path.join(rootDir, ".github", "workflows", "worker_heartbeat.yml");
  const remote = runGit(rootDir, ["remote", "get-url", "origin"], "");

  if (!exists(deployWorkflow)) {
    findings.push(createFinding({
      sector: "github",
      severity: "high",
      title: "Frontend deployment workflow missing",
      evidence: ".github/workflows/deploy.yml is absent.",
      action: "Restore the GitHub Pages deployment workflow before frontend release.",
      owner: "deployment"
    }));
  }

  if (!exists(heartbeatWorkflow)) {
    findings.push(createFinding({
      sector: "github",
      severity: "medium",
      title: "Worker heartbeat workflow missing",
      evidence: ".github/workflows/worker_heartbeat.yml is absent.",
      action: "Add a scheduled Worker health check workflow for deployment failure detection.",
      owner: "deployment"
    }));
  }

  return {
    findings,
    coverage: {
      remoteConfigured: Boolean(remote),
      deployWorkflow: exists(deployWorkflow),
      workerHeartbeatWorkflow: exists(heartbeatWorkflow)
    }
  };
}

function scanDependencies(rootDir) {
  const findings = [];
  const packagePairs = [
    { name: "root", manifest: path.join(rootDir, "package.json"), lockfile: path.join(rootDir, "package-lock.json") },
    { name: "client", manifest: path.join(rootDir, "client", "package.json"), lockfile: path.join(rootDir, "client", "package-lock.json") },
    { name: "server", manifest: path.join(rootDir, "server", "package.json"), lockfile: path.join(rootDir, "server", "package-lock.json") }
  ];

  for (const item of packagePairs) {
    if (exists(item.manifest) && !exists(item.lockfile)) {
      findings.push(createFinding({
        sector: "dependencies",
        severity: "medium",
        title: `${item.name} lockfile missing`,
        evidence: `${relative(rootDir, item.manifest)} exists but ${relative(rootDir, item.lockfile)} is absent.`,
        action: "Generate and commit a lockfile before dependency changes are promoted.",
        owner: "engineer"
      }));
    }
  }

  const rootPackage = readJson(path.join(rootDir, "package.json"), {});
  const clientPackage = readJson(path.join(rootDir, "client", "package.json"), {});
  const hasAuditScript = Boolean(rootPackage.scripts?.audit || clientPackage.scripts?.audit || rootPackage.scripts?.["security:audit"]);
  if (!hasAuditScript) {
    findings.push(createFinding({
      sector: "dependencies",
      severity: "low",
      title: "Dependency audit script missing",
      evidence: "No npm audit/security script is defined in root or client package.json.",
      action: "Add a non-mutating dependency audit command and include it in the pre-release checklist.",
      owner: "security"
    }));
  }

  return {
    findings,
    coverage: {
      packageManifests: packagePairs.filter((item) => exists(item.manifest)).length,
      lockfiles: packagePairs.filter((item) => exists(item.lockfile)).length,
      auditScript: hasAuditScript
    }
  };
}

function scanSecretMaterial(rootDir) {
  const findings = [];
  const patterns = [
    { label: "Stripe live secret key", expression: "sk_live_[A-Za-z0-9]{16,}" },
    { label: "Stripe restricted key", expression: "rk_live_[A-Za-z0-9]{16,}" },
    { label: "GitHub personal access token", expression: "gh[pousr]_[A-Za-z0-9_]{30,}" },
    { label: "OpenAI API key", expression: "sk-[A-Za-z0-9]{32,}" },
    { label: "Private key block", expression: "-----BEGIN (RSA |EC |OPENSSH |)?PRIVATE KEY-----" }
  ];
  const seen = new Set();
  const scanTargets = existingScanTargets(rootDir, [
    ".github",
    ".env.example",
    "AGENTS.md",
    "SECRET_INVENTORY.md",
    "app",
    "client/src",
    "client/worker",
    "client/scripts",
    "server",
    "worker.js",
    "wrangler.toml",
    "docs",
    "client/docs",
    "package.json",
    "client/package.json"
  ]);

  for (const pattern of patterns) {
    const rgOutput = runCommand(rootDir, "rg", [
      "-n",
      "-I",
      "--no-heading",
      "--color",
      "never",
      "--only-matching",
      "--replace",
      "[REDACTED]",
      "--max-count",
      "8",
      "-g",
      "!node_modules/**",
      "-g",
      "!dist/**",
      "-g",
      "!build/**",
      "-g",
      "!.git/**",
      "-g",
      "!**/.venv/**",
      "-g",
      "!**/venv/**",
      "-e",
      pattern.expression,
      ...scanTargets
    ], "");
    const output = rgOutput || runGit(rootDir, ["grep", "-n", "-I", "-E", pattern.expression, "--", "."], "");
    for (const line of output.split("\n").filter(Boolean)) {
      const parts = line.split(":");
      const file = parts[0];
      const lineNumber = parts[1];
      if (!file || !lineNumber) continue;
      const key = `${pattern.label}:${file}:${lineNumber}`;
      if (seen.has(key)) continue;
      seen.add(key);
      findings.push(createFinding({
        sector: "secrets",
        severity: "critical",
        title: `${pattern.label} committed`,
        evidence: `${file}:${lineNumber}`,
        action: "Rotate the exposed credential, remove it from source history if needed, and store it only in the approved secret manager.",
        owner: "security",
        blockedBy: ["production-deploy", "billing-activation"]
      }));
      if (findings.length >= 25) {
        return {
          findings,
          coverage: {
            searchMode: "ripgrep-redacted",
            reportedLimit: 25,
            scanTargets: scanTargets.length,
            patterns: patterns.length
          }
        };
      }
    }
  }

  const inboxPath = path.join(rootDir, "client", "ARCHAIOS_INFRASTRUCTURE", "inbox");
  const inboxPresent = exists(inboxPath);
  const maxContinuousExportBytes = 25 * 1024 * 1024;
  if (inboxPresent) {
    findings.push(createFinding({
      sector: "secrets",
      severity: "medium",
      title: "Raw export inbox requires quarantine scan",
      evidence: "client/ARCHAIOS_INFRASTRUCTURE/inbox exists.",
      action: "Run an offline redaction/secret scan before promoting raw exports into production knowledge or semantic memory.",
      owner: "security",
      blockedBy: ["production-deploy"]
    }));
  }

  return {
    findings,
    coverage: {
      searchMode: "ripgrep-redacted-plus-export-quarantine",
      reportedLimit: 25,
      scanTargets: scanTargets.length,
      rawExportInboxPresent: inboxPresent,
      maxContinuousExportBytes,
      patterns: patterns.length
    }
  };
}

function scanAuthentication(rootDir) {
  const findings = [];
  const pricingPage = readText(path.join(rootDir, "client", "src", "pages", "revenue", "PricingPage.jsx"));
  const worker = readText(path.join(rootDir, "worker.js"));
  const protectedContent = exists(path.join(rootDir, "client", "src", "components", "ProtectedContent.jsx"));
  const signedOutCheckoutBlocked = /Checkout is blocked until sign-in/.test(pricingPage);
  const workerAuth = /getAuthenticatedSupabaseUser/.test(worker);

  if (!signedOutCheckoutBlocked) {
    findings.push(createFinding({
      sector: "authentication",
      severity: "high",
      title: "Signed-out checkout guard missing",
      evidence: "PricingPage.jsx does not contain the signed-out checkout block.",
      action: "Block paid checkout in the UI until a Supabase session is present.",
      owner: "security"
    }));
  }

  if (!workerAuth) {
    findings.push(createFinding({
      sector: "authentication",
      severity: "high",
      title: "Worker bearer-token validation missing",
      evidence: "worker.js does not expose getAuthenticatedSupabaseUser.",
      action: "Require Supabase bearer-token validation on protected Worker routes.",
      owner: "security"
    }));
  }

  return {
    findings,
    coverage: {
      signedOutCheckoutBlocked,
      workerAuth,
      protectedContent
    }
  };
}

function scanCloudflare(rootDir) {
  const findings = [];
  const rootWrangler = readText(path.join(rootDir, "wrangler.toml"));
  const clientWrangler = readText(path.join(rootDir, "client", "wrangler.jsonc"));
  const rootName = rootWrangler.match(/name\s*=\s*"([^"]+)"/)?.[1] || "";
  const clientName = clientWrangler.match(/"name"\s*:\s*"([^"]+)"/)?.[1] || "";
  const hasHealthEndpoint = /\/api\/health/.test(readText(path.join(rootDir, "worker.js"))) || /\/api\/health/.test(readText(path.join(rootDir, "client", "worker", "index.js")));

  if (rootName && clientName && rootName !== clientName) {
    findings.push(createFinding({
      sector: "cloudflare",
      severity: "medium",
      title: "Cloudflare Worker names diverge",
      evidence: `root wrangler=${rootName}; client wrangler=${clientName}`,
      action: "Choose one canonical Worker identity before deploy promotion.",
      owner: "deployment"
    }));
  }

  if (!hasHealthEndpoint) {
    findings.push(createFinding({
      sector: "cloudflare",
      severity: "high",
      title: "Worker health endpoint missing",
      evidence: "No /api/health handler found in Worker sources.",
      action: "Add a public health endpoint used by heartbeat and launch diagnostics.",
      owner: "deployment"
    }));
  }

  return {
    findings,
    coverage: {
      rootName,
      clientName,
      hasHealthEndpoint
    }
  };
}

function scanSupabase(rootDir) {
  const findings = [];
  const migrationDir = path.join(rootDir, "client", "supabase", "sql");
  const migrations = exists(migrationDir)
    ? fs.readdirSync(migrationDir).filter((file) => file.endsWith(".sql"))
    : [];
  const required = [
    "2026-06-28_archaios_semantic_memory.sql",
    "2026-06-17_archaios_command_center_v1.sql",
    "2026-06-20_archivist_mvp.sql",
    "2026-06-20_subscription_upsert_contract.sql"
  ];

  for (const file of required) {
    if (!migrations.includes(file)) {
      findings.push(createFinding({
        sector: "supabase",
        severity: "high",
        title: `Supabase migration missing: ${file}`,
        evidence: `client/supabase/sql/${file} is absent.`,
        action: "Restore or recreate the required migration before database promotion.",
        owner: "engineer"
      }));
    }
  }

  return {
    findings,
    coverage: {
      migrationCount: migrations.length,
      requiredMigrationsPresent: required.filter((file) => migrations.includes(file)).length
    }
  };
}

function scanStripe(rootDir) {
  const findings = [];
  const workerText = `${readText(path.join(rootDir, "worker.js"))}\n${readText(path.join(rootDir, "client", "worker", "index.js"))}`;
  const envExample = readText(path.join(rootDir, ".env.example"));
  const requiredEvents = [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.payment_failed"
  ];
  const hasCheckout = /createStripeCheckoutSession|api\/stripe\/checkout/.test(workerText);
  const hasWebhookVerification = /verifyStripeWebhookSignature|STRIPE_WEBHOOK_SECRET/.test(workerText);
  const missingEvents = requiredEvents.filter((event) => !workerText.includes(event));
  const hasProElitePlaceholders = /STRIPE_(PRO_PRICE_ID|PRICE_PRO)/.test(envExample) && /STRIPE_(ELITE_PRICE_ID|PRICE_ELITE)/.test(envExample);

  if (!hasCheckout) {
    findings.push(createFinding({
      sector: "stripe",
      severity: "high",
      title: "Stripe checkout path missing",
      evidence: "Worker sources do not contain checkout session creation.",
      action: "Restore POST /api/stripe/checkout before paid launch.",
      owner: "engineer"
    }));
  }
  if (!hasWebhookVerification) {
    findings.push(createFinding({
      sector: "stripe",
      severity: "critical",
      title: "Stripe webhook signature verification missing",
      evidence: "Worker sources do not reference webhook signature verification.",
      action: "Block billing activation until webhook signatures are verified server-side.",
      owner: "security",
      blockedBy: ["billing-activation"]
    }));
  }
  if (missingEvents.length) {
    findings.push(createFinding({
      sector: "stripe",
      severity: "medium",
      title: "Stripe webhook event handling incomplete",
      evidence: `Missing events: ${missingEvents.join(", ")}`,
      action: "Handle every required subscription lifecycle event before live payments.",
      owner: "engineer"
    }));
  }
  if (!hasProElitePlaceholders) {
    findings.push(createFinding({
      sector: "stripe",
      severity: "medium",
      title: "Pro/Elite Stripe price placeholders missing",
      evidence: ".env.example does not document both Pro and Elite Stripe price IDs.",
      action: "Document required Stripe price environment variables without committing live values.",
      owner: "security"
    }));
  }

  return {
    findings,
    coverage: {
      hasCheckout,
      hasWebhookVerification,
      requiredEvents: requiredEvents.length,
      missingEvents,
      hasProElitePlaceholders
    }
  };
}

function scanApiKeyBoundaries(rootDir) {
  const findings = [];
  const browserFiles = [
    path.join(rootDir, "client", "src"),
    path.join(rootDir, "client", "index.html")
  ];
  const forbiddenNames = [
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "OPENAI_API_KEY",
    "ANTHROPIC_API_KEY",
    "GEMINI_API_KEY"
  ];

  const files = browserFiles.flatMap((target) => exists(target)
    ? fs.statSync(target).isDirectory()
      ? walkFiles(target, { extensions: TEXT_EXTENSIONS, maxFiles: 2000 })
      : [target]
    : []);

  for (const file of files) {
    const text = readText(file);
    for (const name of forbiddenNames) {
      if (text.includes(name)) {
        findings.push(createFinding({
          sector: "api-keys",
          severity: "high",
          title: `Server-only key referenced in browser bundle: ${name}`,
          evidence: relative(rootDir, file),
          action: "Move server-only key references out of browser code and into Worker/server runtime only.",
          owner: "security",
          blockedBy: ["production-deploy"]
        }));
      }
    }
  }

  return {
    findings,
    coverage: {
      scannedBrowserFiles: files.length,
      forbiddenNames: forbiddenNames.length
    }
  };
}

function scanCertificates(rootDir) {
  const certFiles = walkFiles(rootDir, {
    extensions: new Set([".pem", ".crt", ".cer", ".key"]),
    maxFiles: 5000,
    includeHidden: true
  }).filter((file) => !relative(rootDir, file).includes("site-packages/pip/_vendor/certifi"));

  const findings = certFiles.map((file) => createFinding({
    sector: "certificates",
    severity: path.extname(file) === ".key" ? "high" : "medium",
    title: `Certificate or key file committed: ${path.basename(file)}`,
    evidence: relative(rootDir, file),
    action: "Verify the file is non-sensitive, rotate if private, and move live keys to managed secrets.",
    owner: "security"
  }));

  return {
    findings,
    coverage: {
      certificateFiles: certFiles.length
    }
  };
}

function normalizeLocalLink(link) {
  const cleaned = link.split("#")[0].trim();
  if (!cleaned || cleaned.startsWith("http") || cleaned.startsWith("mailto:") || cleaned.startsWith("app://")) return null;
  if (cleaned.startsWith("/")) return cleaned.slice(1);
  return cleaned;
}

function scanBrokenLinks(rootDir) {
  const findings = [];
  const markdownRoots = [
    path.join(rootDir, "docs"),
    path.join(rootDir, "client", "docs"),
    path.join(rootDir, "reports"),
    path.join(rootDir, "ARCHAIOS_COMMAND_BRIEFING")
  ];
  const rootMarkdown = trackedFiles(rootDir, { extensions: new Set([".md"]), maxFiles: 400 })
    .filter((file) => path.dirname(relative(rootDir, file)) === ".");
  const markdownFiles = [
    ...markdownRoots.flatMap((dirPath) => exists(dirPath) ? walkFiles(dirPath, { extensions: new Set([".md"]), maxFiles: 300 }) : []),
    ...rootMarkdown
  ];
  const linkRegex = /\[[^\]]+\]\(([^)]+)\)/g;
  const seen = new Set();

  for (const file of markdownFiles) {
    const text = readText(file);
    for (const match of text.matchAll(linkRegex)) {
      const target = normalizeLocalLink(match[1]);
      if (!target) continue;
      if (/^[a-z]+:/i.test(target)) continue;
      const decoded = decodeURIComponent(target.replace(/^<|>$/g, ""));
      const resolved = path.resolve(path.dirname(file), decoded);
      const rootResolved = path.resolve(rootDir, decoded);
      const existsRelative = exists(resolved) || exists(rootResolved);
      const key = `${relative(rootDir, file)}->${decoded}`;
      if (!existsRelative && !seen.has(key)) {
        seen.add(key);
        findings.push(createFinding({
          sector: "broken-links",
          severity: "low",
          title: "Broken local documentation link",
          evidence: `${relative(rootDir, file)} -> ${decoded}`,
          action: "Update the link target or archive the stale reference.",
          owner: "writer"
        }));
      }
      if (findings.length >= 12) break;
    }
    if (findings.length >= 12) break;
  }

  return {
    findings,
    coverage: {
      markdownFiles: markdownFiles.length,
      reportedLimit: 12
    }
  };
}

function scanDeployments(rootDir) {
  const findings = [];
  const deployWorkflow = readText(path.join(rootDir, ".github", "workflows", "deploy.yml"));
  const heartbeatWorkflow = readText(path.join(rootDir, ".github", "workflows", "worker_heartbeat.yml"));
  const clientPackage = readJson(path.join(rootDir, "client", "package.json"), {});
  const clientBuild = Boolean(clientPackage.scripts?.build);
  const workerCheck = Boolean(clientPackage.scripts?.["worker:check"]);
  const hasHealthUrl = /archaios-saas-worker\.quandrix357\.workers\.dev\/api\/health/.test(heartbeatWorkflow);

  if (!clientBuild) {
    findings.push(createFinding({
      sector: "deployments",
      severity: "high",
      title: "Client build command missing",
      evidence: "client/package.json has no build script.",
      action: "Restore the production build command before frontend deployment.",
      owner: "deployment"
    }));
  }
  if (!workerCheck) {
    findings.push(createFinding({
      sector: "deployments",
      severity: "medium",
      title: "Worker validation command missing",
      evidence: "client/package.json has no worker:check script.",
      action: "Add or restore a Worker validation command for predeploy checks.",
      owner: "deployment"
    }));
  }
  if (exists(path.join(rootDir, ".github", "workflows", "worker_heartbeat.yml")) && !hasHealthUrl) {
    findings.push(createFinding({
      sector: "deployments",
      severity: "medium",
      title: "Worker heartbeat URL not canonical",
      evidence: ".github/workflows/worker_heartbeat.yml does not target the canonical SaaS Worker health endpoint.",
      action: "Point heartbeat checks at https://archaios-saas-worker.quandrix357.workers.dev/api/health.",
      owner: "deployment"
    }));
  }
  if (deployWorkflow && !/npm run build/.test(deployWorkflow)) {
    findings.push(createFinding({
      sector: "deployments",
      severity: "medium",
      title: "Frontend workflow does not run production build",
      evidence: ".github/workflows/deploy.yml does not contain npm run build.",
      action: "Require frontend build before GitHub Pages deployment.",
      owner: "deployment"
    }));
  }

  return {
    findings,
    coverage: {
      clientBuild,
      workerCheck,
      canonicalHeartbeat: hasHealthUrl,
      deployWorkflowBuildStep: /npm run build/.test(deployWorkflow)
    }
  };
}

function buildSectors(rootDir) {
  const scanners = {
    github: ["GitHub", scanGithub],
    dependencies: ["Dependencies", scanDependencies],
    secrets: ["Secrets", scanSecretMaterial],
    authentication: ["Authentication", scanAuthentication],
    cloudflare: ["Cloudflare", scanCloudflare],
    supabase: ["Supabase", scanSupabase],
    stripe: ["Stripe", scanStripe],
    "api-keys": ["API Keys", scanApiKeyBoundaries],
    certificates: ["Certificates", scanCertificates],
    "broken-links": ["Broken Links", scanBrokenLinks],
    deployments: ["Deployments", scanDeployments]
  };

  return SECTORS.map((key) => {
    const [label, scanner] = scanners[key];
    const result = scanner(rootDir);
    return {
      ...summarizeSector(key, label, result.findings, result.coverage),
      findings: result.findings
    };
  });
}

function scoreSeverity(severity) {
  return {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  }[severity] || 0;
}

export function buildProjectSentinelDashboard(rootDir = process.cwd(), options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const sectors = buildSectors(rootDir);
  const findings = sectors
    .flatMap((sector) => sector.findings)
    .sort((a, b) => scoreSeverity(b.severity) - scoreSeverity(a.severity) || a.sector.localeCompare(b.sector));
  const critical = findings.filter((finding) => finding.severity === "critical").length;
  const high = findings.filter((finding) => finding.severity === "high").length;
  const medium = findings.filter((finding) => finding.severity === "medium").length;
  const low = findings.filter((finding) => finding.severity === "low").length;
  const status = critical || high ? STATUS.red : findings.length ? STATUS.amber : STATUS.green;
  const cleanSectors = sectors.filter((sector) => sector.actionableFindings === 0).length;

  return {
    generatedAt,
    service: "project-sentinel",
    title: "Project Sentinel Security Operations Dashboard",
    doctrine: "Report only actionable findings backed by local evidence. Do not speculate about connector state.",
    status,
    summary: findings.length
      ? `${findings.length} actionable finding(s): ${critical} critical, ${high} high, ${medium} medium, ${low} low.`
      : "No actionable findings detected from local scan evidence.",
    sectors: sectors.map(({ findings: _findings, ...sector }) => sector),
    findings,
    metrics: {
      sectors: sectors.length,
      cleanSectors,
      actionableFindings: findings.length,
      critical,
      high,
      medium,
      low
    },
    responsePlan: findings.slice(0, 6).map((finding, index) => ({
      order: index + 1,
      findingId: finding.id,
      severity: finding.severity,
      owner: finding.owner,
      action: finding.action
    }))
  };
}

export function writeProjectSentinelDashboard(rootDir = process.cwd()) {
  const dashboard = buildProjectSentinelDashboard(rootDir);
  const outputPath = path.join(rootDir, "client", "archaios-core", "interfaces", "project-sentinel.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(dashboard, null, 2)}\n`);
  return { outputPath, dashboard };
}
