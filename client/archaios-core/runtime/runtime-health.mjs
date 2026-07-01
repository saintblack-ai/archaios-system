import fs from "node:fs";
import path from "node:path";

export const REQUIRED_KNOWLEDGE_PATHS = [
  "identity.md",
  "mission.md",
  "projects",
  "research",
  "books",
  "music",
  "business",
  "vault",
  "memory",
  "logs"
];

export const REQUIRED_SECURITY_CONTROLS = [
  "jwt-authentication",
  "rbac",
  "encrypted-secrets",
  "audit-logging",
  "rate-limiting",
  "secure-api-gateway",
  "vulnerability-scanning"
];

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function exists(targetPath) {
  return fs.existsSync(targetPath);
}

function countJsonFiles(dirPath) {
  if (!exists(dirPath)) return 0;
  return fs.readdirSync(dirPath).filter((file) => file.endsWith(".json")).length;
}

function unique(values) {
  return [...new Set(values)];
}

export function loadAgentNetwork(rootDir = process.cwd()) {
  const manifestPath = path.join(rootDir, "client", "archaios-core", "runtime", "agent-network.json");
  const manifest = readJson(manifestPath, null);
  if (!manifest) {
    throw new Error(`Missing agent network manifest: ${manifestPath}`);
  }
  return manifest;
}

export function validateAgentNetwork(manifest) {
  const agents = Array.isArray(manifest.agents) ? manifest.agents : [];
  const required = Array.isArray(manifest.requiredAgentKeys) ? manifest.requiredAgentKeys : [];
  const keys = agents.map((agent) => agent.key).filter(Boolean);
  const missing = required.filter((key) => !keys.includes(key));
  const duplicates = unique(keys.filter((key, index) => keys.indexOf(key) !== index));
  const incomplete = agents
    .filter((agent) => {
      return !agent.role ||
        !Array.isArray(agent.tools) ||
        !agent.tools.length ||
        !agent.permissions ||
        !Array.isArray(agent.memory) ||
        !agent.memory.length ||
        !agent.taskQueue ||
        !Array.isArray(agent.evaluationMetrics) ||
        !agent.evaluationMetrics.length;
    })
    .map((agent) => agent.key || "unknown");

  return {
    ok: missing.length === 0 && duplicates.length === 0 && incomplete.length === 0,
    totalAgents: agents.length,
    requiredAgents: required.length,
    missing,
    duplicates,
    incomplete
  };
}

export function summarizeTaskQueues(rootDir = process.cwd(), queueRoot = path.join("client", "tasks")) {
  const base = path.join(rootDir, queueRoot);
  return {
    queue: countJsonFiles(path.join(base, "queue")),
    prioritized: countJsonFiles(path.join(base, "prioritized")),
    inProgress: countJsonFiles(path.join(base, "in_progress")),
    completed: countJsonFiles(path.join(base, "completed")),
    blocked: countJsonFiles(path.join(base, "blocked"))
  };
}

export function summarizeKnowledgeSystem(rootDir = process.cwd()) {
  const root = path.join(rootDir, "knowledge");
  const coverage = REQUIRED_KNOWLEDGE_PATHS.map((entry) => ({
    path: `knowledge/${entry}`,
    present: exists(path.join(root, entry))
  }));
  const present = coverage.filter((item) => item.present).length;

  return {
    root: "knowledge",
    required: REQUIRED_KNOWLEDGE_PATHS.length,
    present,
    ready: present === REQUIRED_KNOWLEDGE_PATHS.length,
    coverage
  };
}

export function summarizeSecurityDeployment(rootDir = process.cwd()) {
  const signals = {
    jwtAuthentication: exists(path.join(rootDir, "middleware.ts")) || exists(path.join(rootDir, "app", "lib", "dashboardAuth.ts")),
    rbac: exists(path.join(rootDir, "app", "lib", "entitlements.ts")) || exists(path.join(rootDir, "client", "src", "components", "ProtectedContent.jsx")),
    encryptedSecrets: exists(path.join(rootDir, ".env.example")) && exists(path.join(rootDir, "SECRET_INVENTORY.md")),
    auditLogging: exists(path.join(rootDir, "client", "archaios-core", "logs")) || exists(path.join(rootDir, "logs")),
    rateLimiting: exists(path.join(rootDir, "middleware.ts")) || exists(path.join(rootDir, "worker.js")),
    secureApiGateway: exists(path.join(rootDir, "worker.js")) || exists(path.join(rootDir, "client", "worker", "index.js")),
    vulnerabilityScanning: exists(path.join(rootDir, ".github", "workflows"))
  };

  const implemented = Object.values(signals).filter(Boolean).length;
  return {
    controls: REQUIRED_SECURITY_CONTROLS.length,
    implemented,
    ready: implemented === REQUIRED_SECURITY_CONTROLS.length,
    signals
  };
}

export function buildOperatingSnapshot(rootDir = process.cwd()) {
  const manifest = loadAgentNetwork(rootDir);
  const agentNetwork = validateAgentNetwork(manifest);
  const taskQueues = summarizeTaskQueues(rootDir);
  const knowledge = summarizeKnowledgeSystem(rootDir);
  const security = summarizeSecurityDeployment(rootDir);

  const blockedSignals = [
    agentNetwork.ok ? null : "agent-network-contract",
    knowledge.ready ? null : "knowledge-tree-coverage",
    security.ready ? null : "security-control-coverage",
    taskQueues.blocked > 0 ? "blocked-runtime-tasks" : null
  ].filter(Boolean);

  return {
    generatedAt: new Date().toISOString(),
    system: manifest.system,
    health: blockedSignals.length ? "degraded" : "healthy",
    blockedSignals,
    agentNetwork,
    taskQueues,
    knowledge,
    security,
    nextActions: [
      "Connect agent-network manifest to live Supabase agent registry.",
      "Index knowledge documents into pgvector with encrypted metadata where required.",
      "Add signed audit events for agent actions that mutate runtime state."
    ]
  };
}
