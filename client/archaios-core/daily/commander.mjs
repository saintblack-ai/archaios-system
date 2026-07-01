import fs from "node:fs";
import path from "node:path";
import { buildCommanderExecutiveService } from "../commander/service.mjs";
import { buildOperatingSnapshot, loadAgentNetwork } from "../runtime/runtime-health.mjs";

const DAILY_AGENT_KEYS = [
  "archivist",
  "researcher",
  "engineer",
  "writer",
  "strategist",
  "analyst",
  "security",
  "automation",
  "vision"
];

const REPORT_STATUS = {
  green: "green",
  amber: "amber",
  red: "red"
};

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

function listJsonFiles(dirPath, limit = 12) {
  try {
    return fs
      .readdirSync(dirPath)
      .filter((file) => file.endsWith(".json"))
      .sort()
      .slice(-limit)
      .map((file) => path.join(dirPath, file));
  } catch {
    return [];
  }
}

function firstSentence(value, fallback) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return fallback;
  const sentence = text.split(/(?<=[.!?])\s+/)[0];
  return sentence.length > 180 ? `${sentence.slice(0, 177)}...` : sentence;
}

function statusFromCounts({ red = 0, amber = 0 }) {
  if (red > 0) return REPORT_STATUS.red;
  if (amber > 0) return REPORT_STATUS.amber;
  return REPORT_STATUS.green;
}

function countMarkdownFiles(rootDir) {
  let count = 0;
  function walk(dirPath) {
    let entries = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const target = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        walk(target);
      } else if (entry.name.endsWith(".md")) {
        count += 1;
      }
    }
  }
  walk(rootDir);
  return count;
}

function loadTaskSamples(rootDir) {
  const base = path.join(rootDir, "client", "tasks");
  return {
    queue: listJsonFiles(path.join(base, "queue"), 5).map((file) => readJson(file, {})),
    prioritized: listJsonFiles(path.join(base, "prioritized"), 5).map((file) => readJson(file, {})),
    inProgress: listJsonFiles(path.join(base, "in_progress"), 5).map((file) => readJson(file, {})),
    blocked: listJsonFiles(path.join(base, "blocked"), 5).map((file) => readJson(file, {}))
  };
}

function loadGithubActivity(rootDir) {
  const deployWorkflow = path.join(rootDir, ".github", "workflows", "deploy.yml");
  const workerWorkflow = path.join(rootDir, ".github", "workflows", "worker_heartbeat.yml");
  return {
    workflows: [
      { name: "Frontend deploy", path: ".github/workflows/deploy.yml", present: fs.existsSync(deployWorkflow) },
      { name: "Worker heartbeat", path: ".github/workflows/worker_heartbeat.yml", present: fs.existsSync(workerWorkflow) }
    ],
    nextAction: fs.existsSync(deployWorkflow)
      ? "Review deploy workflow status before production frontend release."
      : "Add or restore frontend deployment workflow before production release."
  };
}

function buildAgentReport(agent, context) {
  const { rootDir, operatingSnapshot, knowledgeIndex, revenueReadiness, books, kpis, taskSamples } = context;
  const fallback = {
    agentKey: agent.key,
    agentName: agent.key,
    role: agent.role,
    status: REPORT_STATUS.amber,
    summary: "Report pending.",
    findings: [],
    actions: [],
    metrics: {},
    risks: []
  };

  if (agent.key === "archivist") {
    const markdownFiles = countMarkdownFiles(path.join(rootDir, "knowledge"));
    return {
      ...fallback,
      status: operatingSnapshot.knowledge.ready ? REPORT_STATUS.green : REPORT_STATUS.amber,
      summary: `Knowledge tree has ${operatingSnapshot.knowledge.present}/${operatingSnapshot.knowledge.required} required surfaces and ${markdownFiles} markdown records.`,
      findings: [
        "Canonical identity and mission documents are available.",
        "Vault and memory directories are separated from business and research knowledge."
      ],
      actions: ["Index new knowledge files into pgvector chunks.", "Add source provenance and sensitivity metadata during ingestion."],
      metrics: { markdownFiles, knowledgeCoverage: `${operatingSnapshot.knowledge.present}/${operatingSnapshot.knowledge.required}` },
      risks: operatingSnapshot.knowledge.ready ? [] : ["Some knowledge directories are missing."]
    };
  }

  if (agent.key === "researcher") {
    const categories = Array.isArray(knowledgeIndex?.categories) ? knowledgeIndex.categories : [];
    const top = categories.slice(0, 4).map((item) => item.label || item.id).filter(Boolean);
    return {
      ...fallback,
      status: categories.length ? REPORT_STATUS.green : REPORT_STATUS.amber,
      summary: `Research inbox tracks ${categories.length || 0} knowledge clusters.`,
      findings: top.length ? top : ["No research clusters loaded yet."],
      actions: ["Promote top research clusters into sourced briefs.", "Mark stale or unsourced claims before reports are published."],
      metrics: { clusters: categories.length, records: knowledgeIndex?.totals?.records || 0 },
      risks: ["Research freshness depends on the latest export ingestion cycle."]
    };
  }

  if (agent.key === "engineer") {
    return {
      ...fallback,
      status: operatingSnapshot.agentNetwork.ok ? REPORT_STATUS.green : REPORT_STATUS.red,
      summary: `Runtime contract validates ${operatingSnapshot.agentNetwork.totalAgents} agents.`,
      findings: ["Commander runtime can generate deterministic daily interface data.", "Existing test runner uses Node's built-in test framework."],
      actions: ["Surface operatingSnapshot in daily dashboards.", "Keep dashboard data generation independent from live credentials."],
      metrics: { agents: operatingSnapshot.agentNetwork.totalAgents, blockedSignals: operatingSnapshot.blockedSignals.length },
      risks: operatingSnapshot.blockedSignals
    };
  }

  if (agent.key === "writer") {
    const reportCount = listJsonFiles(path.join(rootDir, "client", "tasks", "completed"), 20).length;
    return {
      ...fallback,
      status: REPORT_STATUS.green,
      summary: "Documentation surfaces exist for command briefs, revenue plans, operator manuals, and knowledge taxonomy.",
      findings: ["Daily briefing should stay concise and decision-oriented.", "Evening review should capture wins, blockers, and tomorrow's first action."],
      actions: ["Convert Commander brief into a reusable operator note.", "Keep public copy separate from private command notes."],
      metrics: { recentCompletedTaskRecords: reportCount },
      risks: ["Documentation volume can outpace the canonical source of truth."]
    };
  }

  if (agent.key === "strategist") {
    const systems = Array.isArray(revenueReadiness?.systems) ? revenueReadiness.systems : [];
    const highReadiness = systems.filter((item) => item.readinessState === "high").length;
    return {
      ...fallback,
      status: highReadiness ? REPORT_STATUS.green : REPORT_STATUS.amber,
      summary: `${systems.length} revenue systems are tracked; ${highReadiness} are high readiness.`,
      findings: systems.slice(0, 3).map((item) => `${item.name}: ${item.nextLocalAction}`),
      actions: ["Prioritize one revenue system and one knowledge system per day.", "Keep production deploys behind readiness gates."],
      metrics: { trackedRevenueSystems: systems.length, highReadiness },
      risks: ["Too many active initiatives can dilute daily execution."]
    };
  }

  if (agent.key === "analyst") {
    return {
      ...fallback,
      status: REPORT_STATUS.amber,
      summary: `Projected monthly revenue is $${Number(kpis?.estimatedMonthlyRevenue || 0).toLocaleString()} against a $${Number(kpis?.annualRevenueTarget || 0).toLocaleString()} annual target.`,
      findings: [
        `Conversion score: ${kpis?.conversionScore || 0}.`,
        `Traffic target: ${Number(kpis?.monthlyTrafficTarget || 0).toLocaleString()} monthly visits.`
      ],
      actions: ["Track daily content output, clicks, checkout starts, and completed subscriptions.", "Replace projections with verified Supabase and Stripe metrics when credentials are active."],
      metrics: {
        estimatedMonthlyRevenue: kpis?.estimatedMonthlyRevenue || 0,
        annualRevenueTarget: kpis?.annualRevenueTarget || 0,
        conversionScore: kpis?.conversionScore || 0
      },
      risks: ["Current financial dashboard includes projection data, not verified revenue."]
    };
  }

  if (agent.key === "security") {
    return {
      ...fallback,
      status: operatingSnapshot.security.ready ? REPORT_STATUS.green : REPORT_STATUS.amber,
      summary: `${operatingSnapshot.security.implemented}/${operatingSnapshot.security.controls} security controls have local implementation signals.`,
      findings: Object.entries(operatingSnapshot.security.signals).map(([key, value]) => `${key}: ${value ? "present" : "missing"}`),
      actions: ["Keep paid checkout blocked for signed-out users.", "Require explicit approval for deploy, secret, billing, and destructive actions."],
      metrics: { implementedControls: operatingSnapshot.security.implemented, requiredControls: operatingSnapshot.security.controls },
      risks: operatingSnapshot.security.ready ? [] : ["Security readiness is not fully green."]
    };
  }

  if (agent.key === "automation") {
    return {
      ...fallback,
      status: taskSamples.blocked.length ? REPORT_STATUS.amber : REPORT_STATUS.green,
      summary: `Task queues show ${operatingSnapshot.taskQueues.queue} queued, ${operatingSnapshot.taskQueues.inProgress} in progress, and ${operatingSnapshot.taskQueues.blocked} blocked records.`,
      findings: taskSamples.prioritized.map((task) => task.task || task.id).filter(Boolean).slice(0, 3),
      actions: ["Prepare scheduled tasks as draft records before execution.", "Run tests before commit or deploy tasks are promoted."],
      metrics: operatingSnapshot.taskQueues,
      risks: taskSamples.blocked.map((task) => task.blockReason || task.task || task.id).filter(Boolean).slice(0, 3)
    };
  }

  if (agent.key === "vision") {
    return {
      ...fallback,
      status: Array.isArray(books) && books.length ? REPORT_STATUS.green : REPORT_STATUS.amber,
      summary: `${Array.isArray(books) ? books.length : 0} book assets are tracked for visual and campaign review.`,
      findings: (books || []).slice(0, 3).map((book) => `${book.title}: ${book.currentCampaignFocus}`),
      actions: ["Attach cover, product, and campaign asset metadata to each tracked book and music project.", "Run screenshot review after Daily Command Center UI changes."],
      metrics: { trackedBooks: Array.isArray(books) ? books.length : 0 },
      risks: ["Music catalog and visual asset inventory need canonical metadata."]
    };
  }

  return fallback;
}

function buildScheduledTasks(agentReports) {
  return [
    {
      id: "daily-morning-brief",
      cadence: "daily",
      localTime: "07:00",
      owner: "commander",
      status: "prepared",
      action: "Generate morning briefing from structured agent reports.",
      requiresApproval: false
    },
    {
      id: "daily-evening-review",
      cadence: "daily",
      localTime: "20:30",
      owner: "commander",
      status: "prepared",
      action: "Summarize completed work, blockers, memory additions, and tomorrow's first action.",
      requiresApproval: false
    },
    {
      id: "weekly-security-readiness",
      cadence: "weekly",
      localTime: "09:00",
      owner: "security",
      status: "prepared",
      action: "Review secrets, auth gates, deployment workflows, and dependency risk.",
      requiresApproval: false
    },
    {
      id: "predeploy-release-gate",
      cadence: "manual",
      localTime: null,
      owner: "automation",
      status: "approval-required",
      action: "Run tests and deployment readiness checks before Cloudflare or GitHub Pages release.",
      requiresApproval: true
    }
  ].map((task) => ({
    ...task,
    dependencies: task.owner === "commander" ? agentReports.map((report) => report.agentKey) : [task.owner]
  }));
}

function buildMemoryTimeline(rootDir, knowledgeIndex, taskSamples) {
  const totals = knowledgeIndex?.totals || {};
  const completed = listJsonFiles(path.join(rootDir, "client", "tasks", "completed"), 5).map((file) => readJson(file, {}));
  return [
    {
      timestamp: new Date().toISOString(),
      type: "knowledge-growth",
      title: "Knowledge index baseline",
      detail: `${totals.records || 0} indexed records across ${totals.conversations || 0} conversations.`
    },
    ...completed.map((task) => ({
      timestamp: task.endedAt || task.createdAt || new Date().toISOString(),
      type: "task-completed",
      title: task.agent || "agent",
      detail: firstSentence(task.task, task.id || "Completed task")
    })),
    ...taskSamples.blocked.slice(0, 2).map((task) => ({
      timestamp: task.blockedAt || task.createdAt || new Date().toISOString(),
      type: "blocker",
      title: task.agent || "blocked task",
      detail: firstSentence(task.blockReason || task.task, "Blocked task requires operator review.")
    }))
  ].slice(0, 8);
}

export function buildDailyCommandCenter(rootDir = process.cwd(), options = {}) {
  const generatedAt = options.generatedAt || new Date().toISOString();
  const manifest = loadAgentNetwork(rootDir);
  const operatingSnapshot = buildOperatingSnapshot(rootDir);
  const executiveOfficer = buildCommanderExecutiveService(rootDir, { generatedAt });
  const knowledgeIndex =
    readJson(path.join(rootDir, "client", "knowledge", "knowledge-index.json"), null) ||
    readJson(path.join(rootDir, "client", "processed_exports", "knowledge_snapshots", "knowledge-index.json"), {});
  const revenueReadiness = readJson(path.join(rootDir, "client", "revenue", "revenue-readiness.json"), {});
  const kpis = readJson(path.join(rootDir, "client", "data", "kpis.json"), {});
  const books = readJson(path.join(rootDir, "client", "data", "books.json"), []);
  const campaigns = readJson(path.join(rootDir, "client", "data", "campaigns.json"), []);
  const systemHealth = readJson(path.join(rootDir, "client", "data", "operator", "system-health.json"), {});
  const taskSamples = loadTaskSamples(rootDir);
  const github = loadGithubActivity(rootDir);

  const agentsByKey = Object.fromEntries((manifest.agents || []).map((agent) => [agent.key, agent]));
  const agentReports = DAILY_AGENT_KEYS.map((key) => buildAgentReport(agentsByKey[key], {
    rootDir,
    operatingSnapshot,
    knowledgeIndex,
    revenueReadiness,
    books,
    campaigns,
    kpis,
    taskSamples
  }));

  const red = agentReports.filter((report) => report.status === REPORT_STATUS.red).length;
  const amber = agentReports.filter((report) => report.status === REPORT_STATUS.amber).length;
  const commanderStatus = statusFromCounts({ red, amber });
  const scheduledTasks = buildScheduledTasks(agentReports);
  const memoryTimeline = buildMemoryTimeline(rootDir, knowledgeIndex, taskSamples);
  const revenueSystems = Array.isArray(revenueReadiness.systems) ? revenueReadiness.systems : [];
  const activeProjects = revenueSystems.slice(0, 5).map((item) => ({
    id: item.id,
    name: item.name,
    status: item.readinessState,
    nextAction: item.nextLocalAction,
    owner: item.primaryAgent
  }));

  const morningActions = [
    "Review blocked and in-progress tasks before starting new work.",
    "Advance one high-readiness revenue system.",
    "Index or summarize one knowledge item into memory.",
    "Run focused tests before any commit or deploy preparation."
  ];
  const eveningPrompts = [
    "What shipped or became clearer today?",
    "Which blocker needs operator approval?",
    "What should Commander put first tomorrow morning?",
    "What memory, source, or decision should be preserved?"
  ];

  const semanticMemory = {
    provider: "supabase-pgvector",
    migration: "client/supabase/sql/2026-06-28_archaios_semantic_memory.sql",
    embeddingModel: "text-embedding-3-small",
    dimensions: 1536,
    tables: [
      "archaios_memory_documents",
      "archaios_memory_chunks",
      "archaios_conversation_turns"
    ],
    retrievalPipeline: [
      "ingest document or conversation",
      "normalize metadata and sensitivity",
      "chunk text",
      "generate embedding",
      "store pgvector row",
      "retrieve by vector similarity plus owner, source, and sensitivity filters",
      "summarize stale high-volume memory"
    ],
    status: "schema-ready"
  };

  return {
    generatedAt,
    title: "ARCHAIOS Daily Command Center",
    commander: {
      agentKey: "commander",
      status: executiveOfficer.executiveBrief.status || commanderStatus,
      summary: `Commander merged ${agentReports.length} agent reports and ${executiveOfficer.monitors.length} executive monitors into today's operating brief.`,
      morningBriefing: {
        headline: executiveOfficer.executiveBrief.title,
        summary: executiveOfficer.executiveBrief.summary,
        actions: executiveOfficer.executiveBrief.actionQueue.map((item) => item.action).slice(0, 4)
      },
      eveningReview: {
        summary: "Capture wins, blockers, memory changes, and tomorrow's first action before ending the day.",
        prompts: eveningPrompts
      }
    },
    executiveOfficer,
    executiveBrief: executiveOfficer.executiveBrief,
    agentReports,
    dashboards: {
      activeProjects,
      revenueProgress: {
        annualTarget: kpis.annualRevenueTarget || 0,
        estimatedMonthlyRevenue: kpis.estimatedMonthlyRevenue || 0,
        conversionScore: kpis.conversionScore || 0,
        readinessSystems: revenueSystems.length,
        note: kpis.projectionNote || "Projection data until live Stripe/Supabase metrics are connected."
      },
      books: (books || []).map((book) => ({
        id: book.id,
        title: book.title,
        status: book.status,
        campaignFocus: book.currentCampaignFocus,
        targetContribution: book.revenueTargetContribution || 0
      })),
      music: {
        status: "metadata-needed",
        nextAction: "Create canonical Saint Black music catalog with releases, assets, links, and campaign status."
      },
      knowledgeGrowth: {
        totals: knowledgeIndex?.totals || { files: 0, conversations: 0, records: 0 },
        clusters: Array.isArray(knowledgeIndex?.categories) ? knowledgeIndex.categories.slice(0, 6) : []
      },
      agentHealth: {
        green: agentReports.filter((report) => report.status === REPORT_STATUS.green).length,
        amber: agentReports.filter((report) => report.status === REPORT_STATUS.amber).length,
        red,
        reports: agentReports.map((report) => ({
          agentKey: report.agentKey,
          status: report.status,
          summary: report.summary
        }))
      },
      deploymentStatus: {
        frontendHost: "https://saintblack-ai.github.io/ai-assassins-client/",
        backendHost: "https://archaios-saas-worker.quandrix357.workers.dev",
        github,
        localHealthSummary: systemHealth.summary || systemHealth.mode || "local status available"
      },
      memoryUsage: {
        timeline: memoryTimeline,
        semanticMemory
      },
      longTermGoals: [
        "Make ARCHAIOS the daily operating surface for creator execution.",
        "Convert knowledge and products into reliable recurring revenue.",
        "Preserve Blackburn legacy assets with searchable, secure memory.",
        "Keep autonomous workflows modular, testable, and approval-gated."
      ],
      financialDashboard: {
        estimatedMonthlyRevenue: kpis.estimatedMonthlyRevenue || 0,
        annualRevenueTarget: kpis.annualRevenueTarget || 0,
        averageBookRoyalty: kpis.averageBookRoyalty || 0,
        systems: revenueSystems.map((system) => ({
          id: system.id,
          name: system.name,
          readinessState: system.readinessState,
          nextLocalAction: system.nextLocalAction
        }))
      },
      aiConversationHistory: {
        records: knowledgeIndex?.totals?.conversations || 0,
        source: knowledgeIndex?.source || "client knowledge index",
        nextAction: "Ingest future conversation exports into archaios_conversation_turns and summarize into memory."
      },
      taskQueue: {
        counts: operatingSnapshot.taskQueues,
        samples: taskSamples
      },
      researchInbox: {
        clusters: Array.isArray(knowledgeIndex?.categories) ? knowledgeIndex.categories.slice(0, 8) : [],
        nextAction: "Turn the highest-value cluster into a sourced research brief."
      },
      projectStatus: activeProjects
    },
    scheduledTasks,
    operatingSnapshot
  };
}

export function writeDailyCommandCenter(rootDir = process.cwd()) {
  const snapshot = buildDailyCommandCenter(rootDir);
  const outputPath = path.join(rootDir, "client", "archaios-core", "interfaces", "daily-command-center.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { outputPath, snapshot };
}
