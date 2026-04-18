#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const RESOLVED_ARCHIVE_ROOT = process.env.ARCHAIOS_ARCHIVE_ROOT || null;
const KNOWLEDGE_SOURCE = process.env.EXPORT_KNOWLEDGE_SOURCE || null;
const CORE = path.join(ROOT, "archaios-core");
const AGENT_DEF_DIR = path.join(CORE, "runtime", "agents");
const AGENT_SCRIPT_DIR = path.join(CORE, "agents");
const LOG_FILE = path.join(ROOT, "logs", "orchestrator.log");
const QUEUE_SOURCE = path.join(ROOT, "tasks", "agent-task-queue.json");

const DIRS = {
  queue: path.join(ROOT, "tasks", "queue"),
  inProgress: path.join(ROOT, "tasks", "in_progress"),
  completed: path.join(ROOT, "tasks", "completed"),
  blocked: path.join(ROOT, "tasks", "blocked"),
  prioritized: path.join(ROOT, "tasks", "prioritized"),
  services: path.join(CORE, "services"),
  state: path.join(CORE, "state"),
  stateAgents: path.join(CORE, "state", "agents"),
  interfaces: path.join(CORE, "interfaces")
};

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function appendLog(message) {
  ensureDir(path.dirname(LOG_FILE));
  fs.appendFileSync(LOG_FILE, `[${nowIso()}] ${message}\n`);
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "task";
}

function loadAgentDefinitions() {
  const defs = {};
  if (!fs.existsSync(AGENT_DEF_DIR)) return defs;
  for (const file of fs.readdirSync(AGENT_DEF_DIR)) {
    if (!file.endsWith(".json")) continue;
    const def = readJson(path.join(AGENT_DEF_DIR, file), null);
    if (!def?.key) continue;
    defs[def.key] = def;
  }
  return defs;
}

function queueFile(dir, taskId, suffix = "json") {
  return path.join(dir, `${taskId}.${suffix}`);
}

function routeTask(task, cycleId, agentDefs) {
  const id = `${cycleId}-${task.agent || "unknown"}-${slugify(task.task).slice(0, 40)}`;
  const normalized = {
    id,
    cycleId,
    createdAt: nowIso(),
    priority: task.priority || "medium",
    agent: task.agent || "unknown",
    task: task.task || "unspecified task",
    source: "tasks/agent-task-queue.json",
    status: "intake"
  };

  writeJson(queueFile(DIRS.queue, id), normalized);
  if (normalized.priority === "high") {
    writeJson(queueFile(DIRS.prioritized, id), normalized);
  }

  const def = agentDefs[normalized.agent];
  const scriptPath = path.join(AGENT_SCRIPT_DIR, `${normalized.agent}.js`);
  const scriptExists = fs.existsSync(scriptPath);
  if (!def || !scriptExists) {
    normalized.status = "blocked";
    normalized.blockedAt = nowIso();
    normalized.blockReason = !def ? "missing-agent-definition" : "missing-agent-script";
    writeJson(queueFile(DIRS.blocked, id), normalized);
    return { normalized, result: "blocked", exitCode: 1 };
  }

  normalized.status = "in_progress";
  normalized.startedAt = nowIso();
  writeJson(queueFile(DIRS.inProgress, id), normalized);

  const run = spawnSync("node", [scriptPath, normalized.task], {
    cwd: ROOT,
    encoding: "utf8",
    timeout: 120000
  });

  const finished = { ...normalized, endedAt: nowIso(), exitCode: run.status ?? 1 };
  if (run.status === 0) {
    finished.status = "completed";
    finished.stdout = (run.stdout || "").trim().slice(0, 1500);
    writeJson(queueFile(DIRS.completed, id), finished);
    return { normalized: finished, result: "completed", exitCode: 0 };
  }

  finished.status = "blocked";
  finished.stderr = (run.stderr || run.stdout || "agent execution failed").trim().slice(0, 1500);
  finished.blockReason = "agent-execution-failure";
  writeJson(queueFile(DIRS.blocked, id), finished);
  return { normalized: finished, result: "blocked", exitCode: run.status ?? 1 };
}

function summarizeKnowledge() {
  const knowledgeIndex = readJson(path.join(ROOT, "knowledge", "knowledge-index.json"), {});
  const categories = Array.isArray(knowledgeIndex.categories) ? knowledgeIndex.categories : [];
  const top = [...categories].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 5);
  return {
    source: knowledgeIndex.source || null,
    totals: knowledgeIndex.totals || { files: 0, conversations: 0, records: 0 },
    topCategories: top
  };
}

function summarizeRevenue() {
  const file = path.join(ROOT, "revenue", "revenue_streams.md");
  if (!fs.existsSync(file)) return { opportunities: [], source: "missing" };
  const lines = fs.readFileSync(file, "utf8").split("\n");
  const opportunities = lines
    .filter((line) => /^\d+\.\s+/.test(line.trim()))
    .map((line) => line.replace(/^\d+\.\s+/, "").trim())
    .slice(0, 8);
  return { opportunities, source: "revenue/revenue_streams.md" };
}

function buildServiceRegistry(agentDefs) {
  return {
    generatedAt: nowIso(),
    services: [
      {
        name: "task-router",
        path: "archaios-core/orchestrator/orchestrator.mjs",
        role: "dispatches tasks to agent runtime scripts"
      },
      {
        name: "knowledge-index",
        path: "knowledge/knowledge-index.json",
        role: "knowledge ingestion summary interface"
      },
      {
        name: "dashboard-data",
        path: "archaios-core/interfaces/dashboard-data.json",
        role: "command dashboard data model"
      },
      ...Object.values(agentDefs).map((def) => ({
        name: def.name,
        key: def.key,
        path: `archaios-core/agents/${def.key}.js`,
        role: def.mission
      }))
    ]
  };
}

function main() {
  Object.values(DIRS).forEach(ensureDir);

  const cycleId = nowIso().replace(/[:.]/g, "-");
  const source = readJson(QUEUE_SOURCE, { tasks: [] });
  const sourceTasks = Array.isArray(source.tasks) ? source.tasks : [];
  const agentDefs = loadAgentDefinitions();

  const serviceRegistry = buildServiceRegistry(agentDefs);
  writeJson(path.join(DIRS.services, "service-registry.json"), serviceRegistry);

  const routed = { completed: 0, blocked: 0, inProgress: 0, intake: sourceTasks.length };
  const agentStatus = {};

  for (const task of sourceTasks) {
    const routedTask = routeTask(task, cycleId, agentDefs);
    routed[routedTask.result] += 1;

    const key = routedTask.normalized.agent;
    if (!agentStatus[key]) {
      agentStatus[key] = {
        agent: key,
        lastExecution: routedTask.normalized.endedAt || routedTask.normalized.startedAt || nowIso(),
        tasksCompleted: 0,
        tasksBlocked: 0,
        currentTask: routedTask.normalized.task,
        status: routedTask.result === "completed" ? "Running" : "Needs Input"
      };
    }
    if (routedTask.result === "completed") {
      agentStatus[key].tasksCompleted += 1;
      agentStatus[key].status = "Running";
    } else {
      agentStatus[key].tasksBlocked += 1;
      agentStatus[key].status = "Error";
    }
  }

  for (const def of Object.values(agentDefs)) {
    if (!agentStatus[def.key]) {
      agentStatus[def.key] = {
        agent: def.key,
        lastExecution: null,
        tasksCompleted: 0,
        tasksBlocked: 0,
        currentTask: "idle",
        status: "Paused"
      };
    }
    writeJson(path.join(DIRS.stateAgents, `${def.key}.json`), {
      ...agentStatus[def.key],
      allowedActions: def.allowedActions,
      blockedActions: def.blockedActions,
      outputDestination: def.outputDestination
    });
  }

  const runtimeState = {
    generatedAt: nowIso(),
    cycleId,
    sourceQueue: "tasks/agent-task-queue.json",
    archiveRoot: RESOLVED_ARCHIVE_ROOT,
    knowledgeSource: KNOWLEDGE_SOURCE,
    queueStats: {
      intake: routed.intake,
      completed: routed.completed,
      blocked: routed.blocked
    },
    agentStatus: Object.values(agentStatus),
    conventions: {
      logs: "logs/*.log append-only",
      state: "archaios-core/state/*.json",
      tasks: "tasks/{queue,in_progress,completed,blocked,prioritized}"
    }
  };
  writeJson(path.join(DIRS.state, "runtime-state.json"), runtimeState);

  const dashboardData = {
    generatedAt: runtimeState.generatedAt,
    archiveRoot: RESOLVED_ARCHIVE_ROOT,
    knowledgeSource: KNOWLEDGE_SOURCE,
    systemHealth: routed.blocked > 0 ? "degraded" : "healthy",
    activeAgents: Object.values(agentStatus).filter((a) => a.status === "Running").length,
    taskCounts: runtimeState.queueStats,
    projectClusterSummary: summarizeKnowledge().topCategories,
    revenueOpportunities: summarizeRevenue().opportunities,
    knowledgeIngestionSummary: summarizeKnowledge().totals,
    serviceRegistry: "archaios-core/services/service-registry.json"
  };
  writeJson(path.join(DIRS.interfaces, "dashboard-data.json"), dashboardData);

  appendLog(
    `cycle=${cycleId} intake=${routed.intake} completed=${routed.completed} blocked=${routed.blocked} health=${dashboardData.systemHealth}`
  );

  console.log(JSON.stringify({ ok: true, cycleId, queueStats: runtimeState.queueStats, health: dashboardData.systemHealth }));
}

main();
