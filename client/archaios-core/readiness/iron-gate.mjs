import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const DEFAULT_TIMEOUT_MS = 7000;
const REPO_FULL_NAME = "saintblack-ai/archaios-system";
const EXPECTED_WORKER_SERVICE = "archaios-saas-worker";
const WORKER_HEALTH_URL = "https://archaios-saas-worker.quandrix357.workers.dev/api/health";

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

function readJsonFromText(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function runCommand(rootDir, command, args, timeout = 30000) {
  try {
    return {
      ok: true,
      stdout: execFileSync(command, args, {
        cwd: rootDir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        timeout,
        maxBuffer: 1024 * 1024 * 8
      }).trim(),
      stderr: ""
    };
  } catch (error) {
    return {
      ok: false,
      stdout: String(error?.stdout || "").trim(),
      stderr: String(error?.stderr || error?.message || error || "").trim()
    };
  }
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: options.headers || {},
      signal: controller.signal
    });
    const text = await response.text();
    let body = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = { raw: text.slice(0, 400) };
    }
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    return { ok: false, status: 0, body: { error: String(error?.message || error) } };
  } finally {
    clearTimeout(timeout);
  }
}

function check({ id, category, title, status, score, maxScore, evidence, action, productionBlocker = false }) {
  return {
    id,
    category,
    title,
    status,
    score,
    maxScore,
    evidence,
    action,
    productionBlocker
  };
}

function pass(fields) {
  return check({ ...fields, status: "pass", score: fields.maxScore });
}

function warn(fields, score = Math.floor(fields.maxScore / 2)) {
  return check({ ...fields, status: "warn", score });
}

function fail(fields) {
  return check({ ...fields, status: "fail", score: 0, productionBlocker: fields.productionBlocker ?? true });
}

function parseClientWranglerSupabaseUrl(rootDir) {
  const text = readText(path.join(rootDir, "client", "wrangler.jsonc"));
  return text.match(/"SUPABASE_URL"\s*:\s*"([^"]+)"/)?.[1] || "";
}

function countPlaceholderSignals(rootDir) {
  const targets = [
    "client/src/pages/revenue/PricingPage.jsx",
    "client/src/pages/revenue/PublicLanding.jsx",
    "client/src/pages/Dashboard.jsx",
    "client/data/books.json",
    "server/index.js",
    "client/src/integrations/social/connectors.js"
  ];
  const patterns = [/placeholder/i, /coming soon/i, /launch-gated/i, /not configured/i];
  const findings = [];

  for (const target of targets) {
    const text = readText(path.join(rootDir, target));
    if (!text) continue;
    const lines = text.split("\n");
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (/\bplaceholder=/.test(trimmed)) {
        return;
      }

      if (patterns.some((pattern) => pattern.test(trimmed))) {
        findings.push(`${target}:${index + 1}`);
      }
    });
  }

  return findings;
}

function buildLocalChecks(rootDir, options = {}) {
  const checks = [];
  const gitStatus = runCommand(rootDir, "git", ["status", "--short"], 10000);
  const dirtyEntries = gitStatus.stdout ? gitStatus.stdout.split("\n").filter(Boolean) : [];

  checks.push(dirtyEntries.length
    ? fail({
      id: "git-worktree-clean",
      category: "github",
      title: "Git worktree is not release-clean",
      maxScore: 8,
      evidence: `${dirtyEntries.length} modified/untracked entries.`,
      action: "Classify, commit, archive, or explicitly discard all dirty worktree entries before production deployment.",
      productionBlocker: true
    })
    : pass({
      id: "git-worktree-clean",
      category: "github",
      title: "Git worktree is release-clean",
      maxScore: 8,
      evidence: "No modified or untracked entries.",
      action: "No action required."
    }));

  const requiredFiles = [
    ".github/workflows/deploy.yml",
    ".github/workflows/worker_heartbeat.yml",
    "client/package.json",
    "client/wrangler.jsonc",
    "wrangler.toml",
    "client/supabase/sql/2026-06-28_archaios_semantic_memory.sql",
    "client/supabase/sql/2026-06-20_subscription_upsert_contract.sql",
    "tests/project-sentinel.test.mjs"
  ];
  const missingFiles = requiredFiles.filter((file) => !exists(path.join(rootDir, file)));
  checks.push(missingFiles.length
    ? fail({
      id: "required-runtime-files",
      category: "subsystems",
      title: "Required runtime files are missing",
      maxScore: 10,
      evidence: missingFiles.join(", "),
      action: "Restore required runtime, workflow, migration, and Sentinel test files before release."
    })
    : pass({
      id: "required-runtime-files",
      category: "subsystems",
      title: "Required runtime files are present",
      maxScore: 10,
      evidence: `${requiredFiles.length} required files found.`,
      action: "No action required."
    }));

  const rootWorker = exists(path.join(rootDir, "worker.js"));
  const clientWorker = exists(path.join(rootDir, "client", "worker", "index.js"));
  checks.push(rootWorker && clientWorker
    ? warn({
      id: "duplicate-worker-surfaces",
      category: "technical-debt",
      title: "Duplicate Worker implementations exist",
      maxScore: 6,
      evidence: "Both worker.js and client/worker/index.js exist.",
      action: "Choose one canonical Worker implementation and retire or archive the non-canonical path."
    }, 2)
    : pass({
      id: "duplicate-worker-surfaces",
      category: "technical-debt",
      title: "Worker implementation surface is singular",
      maxScore: 6,
      evidence: rootWorker ? "Root Worker present." : "Client Worker present.",
      action: "No action required."
    }));

  const placeholderSignals = countPlaceholderSignals(rootDir);
  const placeholderEvidence = placeholderSignals.length
    ? `${placeholderSignals.length} placeholder/coming-soon/launch-gated signals in production-facing files. First targets: ${placeholderSignals.slice(0, 12).join(", ")}${placeholderSignals.length > 12 ? ", ..." : ""}.`
    : "";
  checks.push(placeholderSignals.length
    ? fail({
      id: "placeholder-closure",
      category: "placeholders",
      title: "Production-facing placeholders remain",
      maxScore: 10,
      evidence: placeholderEvidence,
      action: "Replace public placeholders with live links, final policy text, or explicit pre-production gating before launch.",
      productionBlocker: true
    })
    : pass({
      id: "placeholder-closure",
      category: "placeholders",
      title: "No production-facing placeholder signals found",
      maxScore: 10,
      evidence: "Scanned production-facing files are clear.",
      action: "No action required."
    }));

  const sentinel = readJson(path.join(rootDir, "client", "archaios-core", "interfaces", "project-sentinel.json"), null);
  const sentinelFindings = Number(sentinel?.metrics?.actionableFindings || 0);
  checks.push(sentinelFindings
    ? warn({
      id: "sentinel-actionable-findings",
      category: "security",
      title: "Project Sentinel has actionable findings",
      maxScore: 8,
      evidence: `${sentinelFindings} actionable finding(s).`,
      action: "Resolve Project Sentinel findings before production."
    }, sentinelFindings > 2 ? 2 : 5)
    : pass({
      id: "sentinel-actionable-findings",
      category: "security",
      title: "Project Sentinel has no actionable findings",
      maxScore: 8,
      evidence: "Sentinel clean.",
      action: "No action required."
    }));

  if (options.runSecurityAudit) {
    const audit = runCommand(rootDir, "npm", [
      "--prefix",
      "client",
      "audit",
      "--audit-level=moderate",
      "--json"
    ], 60000);
    const auditPayload = readJsonFromText(audit.stdout);
    const vulnerabilities = auditPayload?.metadata?.vulnerabilities || {};
    const high = Number(vulnerabilities.high || 0);
    const critical = Number(vulnerabilities.critical || 0);
    const moderate = Number(vulnerabilities.moderate || 0);
    const totalVulnerabilities = Number(vulnerabilities.total || high + critical + moderate);

    if (auditPayload && totalVulnerabilities > 0) {
      checks.push(fail({
        id: "client-dependency-audit",
        category: "security",
        title: "Client dependency audit has vulnerabilities",
        maxScore: 8,
        evidence: `${totalVulnerabilities} vulnerabilities: ${critical} critical, ${high} high, ${moderate} moderate.`,
        action: "Run non-mutating dependency remediation, update vulnerable packages, then rerun `npm --prefix client audit --audit-level=moderate`.",
        productionBlocker: high > 0 || critical > 0
      }));
    } else if (audit.ok) {
      checks.push(pass({
        id: "client-dependency-audit",
        category: "security",
        title: "Client dependency audit passes",
        maxScore: 8,
        evidence: "npm audit found no moderate-or-higher client vulnerabilities.",
        action: "No action required."
      }));
    } else {
      checks.push(fail({
        id: "client-dependency-audit",
        category: "security",
        title: "Client dependency audit could not complete",
        maxScore: 8,
        evidence: audit.stderr || audit.stdout || "npm audit failed without parseable output.",
        action: "Run Iron Gate from a network-enabled environment and resolve npm audit failures before production.",
        productionBlocker: true
      }));
    }
  } else {
    checks.push(warn({
      id: "client-dependency-audit",
      category: "security",
      title: "Client dependency audit was not run by Iron Gate",
      maxScore: 8,
      evidence: "Run with --run-security-audit for registry-backed vulnerability verification.",
      action: "Run Iron Gate with --run-security-audit before production."
    }, 3));
  }

  if (options.runTests) {
    const test = runCommand(rootDir, "node", [
      "--test",
      "tests/project-sentinel.test.mjs",
      "tests/archaios-daily-command.test.mjs",
      "tests/archaios-runtime-health.test.mjs",
      "tests/revenue-readiness.test.mjs",
      "tests/archivist-agent.test.mjs"
    ], 60000);
    checks.push(test.ok
      ? pass({
        id: "automated-tests",
        category: "health-checks",
        title: "Automated tests pass",
        maxScore: 12,
        evidence: "Node test suite completed successfully.",
        action: "No action required."
      })
      : fail({
        id: "automated-tests",
        category: "health-checks",
        title: "Automated tests failed",
        maxScore: 12,
        evidence: test.stderr || test.stdout || "Test command failed.",
        action: "Fix failing tests before production."
      }));
  } else {
    checks.push(warn({
      id: "automated-tests",
      category: "health-checks",
      title: "Automated tests were not run by Iron Gate",
      maxScore: 12,
      evidence: "Run with --run-tests for release verification.",
      action: "Run Iron Gate with --run-tests before deployment."
    }, 6));
  }

  if (options.runBuild) {
    const build = runCommand(rootDir, "npm", ["--prefix", "client", "run", "build"], 90000);
    checks.push(build.ok
      ? pass({
        id: "client-production-build",
        category: "health-checks",
        title: "Client production build passes",
        maxScore: 12,
        evidence: "Vite build completed successfully.",
        action: "No action required."
      })
      : fail({
        id: "client-production-build",
        category: "health-checks",
        title: "Client production build failed",
        maxScore: 12,
        evidence: build.stderr || build.stdout || "Build command failed.",
        action: "Fix build failure before deployment."
      }));
  } else {
    checks.push(warn({
      id: "client-production-build",
      category: "health-checks",
      title: "Client production build was not run by Iron Gate",
      maxScore: 12,
      evidence: "Run with --run-build for release verification.",
      action: "Run Iron Gate with --run-build before deployment."
    }, 6));
  }

  return checks;
}

async function buildLiveChecks(rootDir) {
  const checks = [];

  const githubRepo = await fetchJson(`https://api.github.com/repos/${REPO_FULL_NAME}`);
  const githubRuns = await fetchJson(`https://api.github.com/repos/${REPO_FULL_NAME}/actions/runs?per_page=5`);
  checks.push(githubRepo.ok
    ? pass({
      id: "live-github-repository",
      category: "github",
      title: "Live GitHub repository is reachable",
      maxScore: 8,
      evidence: `${githubRepo.body?.full_name || REPO_FULL_NAME}; default branch ${githubRepo.body?.default_branch || "unknown"}. Latest runs reachable: ${githubRuns.ok ? "yes" : "no"}.`,
      action: githubRuns.ok ? "No action required." : "Verify GitHub Actions access or repository workflow permissions."
    })
    : fail({
      id: "live-github-repository",
      category: "github",
      title: "Live GitHub repository is not reachable",
      maxScore: 8,
      evidence: `GitHub API status ${githubRepo.status}: ${githubRepo.body?.message || githubRepo.body?.error || "unavailable"}.`,
      action: "Authenticate GitHub access or verify repository visibility before release."
    }));

  const cloudflare = await fetchJson(WORKER_HEALTH_URL);
  const workerService = cloudflare.body?.service || cloudflare.body?.name || "unknown";
  if (!cloudflare.ok) {
    checks.push(fail({
      id: "live-cloudflare-worker",
      category: "cloudflare",
      title: "Cloudflare Worker health endpoint failed",
      maxScore: 10,
      evidence: `HTTP ${cloudflare.status}: ${cloudflare.body?.error || cloudflare.body?.raw || "unavailable"}.`,
      action: "Verify Worker deployment, route, and public /api/health response."
    }));
  } else if (workerService !== EXPECTED_WORKER_SERVICE) {
    checks.push(fail({
      id: "live-cloudflare-worker",
      category: "cloudflare",
      title: "Cloudflare Worker identity mismatch",
      maxScore: 10,
      evidence: `HTTP ${cloudflare.status}; expected service ${EXPECTED_WORKER_SERVICE}, got ${workerService}.`,
      action: "Deploy the canonical revenue Worker with `npx wrangler deploy --name archaios-saas-worker` and verify /api/health identity.",
      productionBlocker: true
    }));
  } else {
    checks.push(pass({
      id: "live-cloudflare-worker",
      category: "cloudflare",
      title: "Cloudflare Worker health endpoint is canonical",
      maxScore: 10,
      evidence: `HTTP ${cloudflare.status}; service ${workerService}; release ${cloudflare.body?.release || "unknown"}.`,
      action: "No action required."
    }));
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || parseClientWranglerSupabaseUrl(rootDir);
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseHealth = supabaseUrl ? await fetchJson(`${supabaseUrl.replace(/\/+$/, "")}/auth/v1/health`) : null;
  if (!supabaseUrl) {
    checks.push(fail({
      id: "live-supabase-url",
      category: "supabase",
      title: "Supabase URL is not configured",
      maxScore: 8,
      evidence: "No SUPABASE_URL/VITE_SUPABASE_URL found.",
      action: "Configure Supabase URL for frontend and Worker environments."
    }));
  } else if (supabaseHealth?.ok) {
    checks.push(supabaseAnon
      ? pass({
        id: "live-supabase-health",
        category: "supabase",
        title: "Supabase auth health is reachable",
        maxScore: 8,
        evidence: `HTTP ${supabaseHealth.status}; anon key present in runtime environment.`,
        action: "Run table-level subscription/profile smoke checks before paid launch."
      })
      : warn({
        id: "live-supabase-health",
        category: "supabase",
        title: "Supabase auth health is reachable, but anon key is absent",
        maxScore: 8,
        evidence: `HTTP ${supabaseHealth.status}; no anon key available to Iron Gate.`,
        action: "Provide VITE_SUPABASE_ANON_KEY for authenticated browser smoke tests."
      }, 5));
  } else {
    checks.push(fail({
      id: "live-supabase-health",
      category: "supabase",
      title: "Supabase auth health failed",
      maxScore: 8,
      evidence: `HTTP ${supabaseHealth?.status || 0}: ${supabaseHealth?.body?.error || supabaseHealth?.body?.raw || "unavailable"}.`,
      action: "Verify Supabase project status and configured project URL."
    }));
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    checks.push(fail({
      id: "live-stripe-metrics",
      category: "stripe",
      title: "Stripe metrics are not connected",
      maxScore: 10,
      evidence: "STRIPE_SECRET_KEY is not available to Iron Gate.",
      action: "Run Iron Gate from an approved environment with read-only Stripe access or verify metrics through a controlled backend endpoint.",
      productionBlocker: true
    }));
  } else {
    const stripe = await fetchJson("https://api.stripe.com/v1/subscriptions?limit=1", {
      headers: { Authorization: `Bearer ${stripeKey}` }
    });
    checks.push(stripe.ok
      ? pass({
        id: "live-stripe-metrics",
        category: "stripe",
        title: "Stripe subscription metrics are reachable",
        maxScore: 10,
        evidence: `HTTP ${stripe.status}; has_more=${Boolean(stripe.body?.has_more)}.`,
        action: "Reconcile Stripe subscriptions with Supabase profiles before production."
      })
      : fail({
        id: "live-stripe-metrics",
        category: "stripe",
        title: "Stripe metrics request failed",
        maxScore: 10,
        evidence: `HTTP ${stripe.status}: ${stripe.body?.error?.message || stripe.body?.error || "unavailable"}.`,
        action: "Verify Stripe key scope, mode, and account before paid launch."
      }));
  }

  return checks;
}

function summarize(checks) {
  const total = checks.reduce((sum, item) => sum + item.maxScore, 0);
  const earned = checks.reduce((sum, item) => sum + item.score, 0);
  const score = total ? Math.round((earned / total) * 100) : 0;
  const blockers = checks.filter((item) => item.productionBlocker || item.status === "fail");
  const complete = checks.filter((item) => item.status === "pass");
  const warnings = checks.filter((item) => item.status === "warn");

  return {
    score,
    earned,
    total,
    status: blockers.length ? "blocked" : warnings.length ? "conditional" : "ready",
    complete: complete.length,
    warnings: warnings.length,
    blockers: blockers.length
  };
}

function renderMarkdown(report) {
  const blockers = report.checks.filter((item) => item.productionBlocker || item.status === "fail");
  const complete = report.checks.filter((item) => item.status === "pass");
  const warnings = report.checks.filter((item) => item.status === "warn");

  const table = (items) => items.length
    ? items.map((item) => `| ${item.category} | ${item.title} | ${item.evidence.replaceAll("\n", " ")} | ${item.action.replaceAll("\n", " ")} |`).join("\n")
    : "| none | none | none | none |";

  return `# Operation Iron Gate Readiness Report

Generated: ${report.generatedAt}
Operational Readiness Score: ${report.summary.score}/100
Status: ${report.summary.status}

## Production Blockers

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
${table(blockers)}

## Warnings

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
${table(warnings)}

## Already Complete

| Area | Finding | Evidence | Required Fix |
| --- | --- | --- | --- |
${table(complete)}

## Deployment Checklist

### Prevents Production

${blockers.length ? blockers.map((item) => `- [ ] ${item.title}: ${item.action}`).join("\n") : "- [x] No production blockers detected."}

### Complete

${complete.map((item) => `- [x] ${item.title}`).join("\n")}

### Must Run Immediately Before Deploy

- [ ] Run Iron Gate with live credentials: \`npm --prefix client run iron-gate -- --run-tests --run-build --run-security-audit\`
- [ ] Confirm GitHub Actions pass on the release commit.
- [ ] Confirm Supabase subscription/profile smoke checks.
- [ ] Confirm Stripe test checkout and webhook subscription sync.
- [ ] Confirm Cloudflare Worker \`/api/health\` returns the intended service and release.
- [ ] Confirm no untracked temp files, raw exports, or generated caches are included in the release commit.
`;
}

export async function buildIronGateReadiness(rootDir = process.cwd(), options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const checks = [
    ...buildLocalChecks(rootDir, options),
    ...(await buildLiveChecks(rootDir))
  ];
  const report = {
    generatedAt,
    service: "operation-iron-gate",
    objective: "Operational readiness verification for ARCHAIOS production deployment.",
    summary: summarize(checks),
    checks
  };
  return report;
}

export async function writeIronGateReadiness(rootDir = process.cwd(), options = {}) {
  const report = await buildIronGateReadiness(rootDir, options);
  const interfacePath = path.join(rootDir, "client", "archaios-core", "interfaces", "iron-gate-readiness.json");
  const markdownPath = path.join(rootDir, "reports", "OPERATION_IRON_GATE_READINESS_REPORT.md");
  fs.mkdirSync(path.dirname(interfacePath), { recursive: true });
  fs.mkdirSync(path.dirname(markdownPath), { recursive: true });
  fs.writeFileSync(interfacePath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdown(report));
  return { interfacePath, markdownPath, report };
}
