"use client";

import { useEffect, useRef, useState } from "react";
import { deriveAgentStates } from "./core/agents";
import { startArchaiosAutonomy } from "./core/autonomy";
import { beginTaskExecution, completeTaskExecution } from "./core/execution";
import {
  loadIntelStreamMemory,
  loadMissionMode,
  loadSavedBriefsMemory,
  loadTaskQueueMemory,
  saveIntelStreamMemory,
  saveMissionMode,
  saveSavedBriefsMemory,
  saveTaskQueueMemory
} from "./core/memory";
import { deriveSystemSignals } from "./core/signals";
import {
  createInitialArchaiosState,
  createIntelStreamEntry,
  pushIntelStreamEntries,
  sortSavedBriefs,
  type ArchaiosCoreState,
  type BriefHistoryEntry,
  type SavedBrief
} from "./core/state";
import {
  MISSION_MODES,
  generateFallbackBrief,
  generateFallbackMarketIntelligence,
  type ActionTask,
  type IntelligenceSnapshot,
  type MissionMode,
  type TaskPriority,
  type TaskStatus
} from "./briefFallback";
import styles from "./MasterControlPanel.module.css";

const WORKER_URL = "https://archaios-saas-worker.quandrix357.workers.dev";
const NAV_ITEMS = [
  "Overview",
  "Intelligence",
  "Decision Engine",
  "Operations",
  "Saved Briefs",
  "Settings",
  "Agents",
  "Content drafts",
  "Marketing queue",
  "Revenue analytics",
  "Infrastructure",
  "Logs"
] as const;
const FALLBACK_MONTHLY_REVENUE = 49.99;
const FALLBACK_ARCHAIOS = {
  title: "ARCHAIOS CORE",
  status: "Active",
  mode: "Intelligence Engine"
} as const;

type NavItem = (typeof NAV_ITEMS)[number];

type SystemStatus = {
  worker: { status: string; url: string };
  supabase: { status: string; detail: string | null };
  stripe: { status: string; webhook_events: number };
  githubActions: { status: string };
  activeAgents: number;
  errorAlerts: number;
};

type Agent = {
  name: string;
  description: string | null;
  tags: string[];
  enabled: boolean;
  last_run: string | null;
  last_status: string;
};

type Revenue = {
  subscriptions: { total: number; active: number };
  monthlyRevenue: number;
  revenueToday: number;
  stripeMetrics: Record<string, unknown> | null;
  webhookEvents: { total: number; latest: Array<Record<string, unknown>> };
};

type IntelligenceBrief = {
  id: number;
  topic: string;
  report: string;
  created_at: string;
};

type ContentDraft = {
  id: number;
  channel: string;
  content_type: string;
  content: string;
  status: string;
  created_at: string;
};

type MarketingQueueItem = {
  id: number;
  channel: string;
  content: string;
  scheduled_time: string | null;
  status: string;
  created_at: string;
};

type RevenueAsset = {
  id: number;
  content_type: string;
  content: string;
  status: string;
  created_at: string;
};

type PerformanceMetric = {
  id: number;
  metric_type: string;
  value: Record<string, unknown>;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type LogResponse = {
  logs: Array<{
    agent_name: string;
    category: string;
    status: string;
    created_at: string;
    output: unknown;
  }>;
  page: number;
  pageSize: number;
  total: number;
};

const FALLBACK_SYSTEM_STATUS: SystemStatus = {
  worker: { status: "offline", url: WORKER_URL },
  supabase: { status: "fallback", detail: "Live dashboard services unavailable" },
  stripe: { status: "fallback", webhook_events: 0 },
  githubActions: { status: "unknown" },
  activeAgents: 0,
  errorAlerts: 0
};

const FALLBACK_REVENUE: Revenue = {
  subscriptions: { total: 1, active: 1 },
  monthlyRevenue: FALLBACK_MONTHLY_REVENUE,
  revenueToday: 0,
  stripeMetrics: null,
  webhookEvents: { total: 0, latest: [] }
};

const FALLBACK_LOGS: LogResponse = {
  logs: [],
  page: 1,
  pageSize: 12,
  total: 0
};

const FALLBACK_INTELLIGENCE = generateFallbackBrief(1);

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString() : "Never";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(value);
}

function readStoredMonthlyRevenue() {
  if (typeof window === "undefined") {
    return null;
  }

  const storageKeys = ["archaiosMonthlyRevenue", "monthlyRevenue", "dashboardMonthlyRevenue"];
  for (const key of storageKeys) {
    const rawValue = window.localStorage.getItem(key);
    if (!rawValue) {
      continue;
    }

    const parsed = Number.parseFloat(rawValue.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function findRevenueValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const priorityKeys = ["monthlyRevenue", "mrr", "mrr_snapshot", "revenue", "amount", "value"];

  for (const key of priorityKeys) {
    const next = record[key];
    const resolved = findRevenueValue(next);
    if (resolved != null) {
      return resolved;
    }
  }

  for (const next of Object.values(record)) {
    const resolved = findRevenueValue(next);
    if (resolved != null) {
      return resolved;
    }
  }

  return null;
}

function normalizeRevenue(payload: Partial<Revenue> | null | undefined): Revenue {
  const liveMonthlyRevenue = findRevenueValue(payload?.stripeMetrics);
  const storedMonthlyRevenue = readStoredMonthlyRevenue();

  return {
    subscriptions: payload?.subscriptions || FALLBACK_REVENUE.subscriptions,
    monthlyRevenue: liveMonthlyRevenue ?? storedMonthlyRevenue ?? FALLBACK_MONTHLY_REVENUE,
    revenueToday: payload?.revenueToday ?? FALLBACK_REVENUE.revenueToday,
    stripeMetrics: payload?.stripeMetrics || null,
    webhookEvents: payload?.webhookEvents || FALLBACK_REVENUE.webhookEvents
  };
}

function timestampLabel(value: string) {
  return new Date(value).toLocaleString();
}

function firstLine(value: string) {
  return value.split("\n")[0]?.trim() || value;
}

function normalizeTaskPriority(value: unknown, fallback: TaskPriority = "medium"): TaskPriority {
  return value === "low" || value === "medium" || value === "high" || value === "critical" ? value : fallback;
}

function normalizeTaskStatus(value: unknown, fallback: TaskStatus = "pending"): TaskStatus {
  return value === "pending" || value === "running" || value === "completed" || value === "blocked" ? value : fallback;
}

function normalizeTaskResult(value: unknown, title: string, assignedAgent: string, fallback?: string) {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return fallback || `${assignedAgent} completed ${title}.`;
}

function normalizeTaskRecord(item: unknown, missionMode: MissionMode, seed: string | number, index: number, fallbackTask?: ActionTask | null): ActionTask | null {
  const fallbackId = `${missionMode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${seed}-${index}`;

  if (typeof item === "string") {
    const title = item.trim();
    if (!title) {
      return null;
    }

    return {
      id: fallbackId,
      title,
      assignedAgent: fallbackTask?.assignedAgent || "intelligence_agent",
      priority: fallbackTask?.priority || "medium",
      status: "pending",
      result: normalizeTaskResult(null, title, fallbackTask?.assignedAgent || "intelligence_agent", fallbackTask?.result),
      createdAt: fallbackTask?.createdAt || new Date(Number(String(seed).replace(/[^0-9]/g, "")) || Date.now()).toISOString(),
      completedAt: null
    };
  }

  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const titleSource = typeof record.title === "string" && record.title.trim()
    ? record.title.trim()
    : typeof record.description === "string" && record.description.trim()
      ? record.description.trim()
      : "";

  if (!titleSource) {
    return null;
  }

  const assignedAgent = typeof record.assignedAgent === "string" && record.assignedAgent.trim()
    ? record.assignedAgent.trim()
    : fallbackTask?.assignedAgent || "intelligence_agent";
  const status = normalizeTaskStatus(record.status, fallbackTask?.status || "pending");
  const createdAt = typeof record.createdAt === "string" && record.createdAt.trim()
    ? record.createdAt.trim()
    : fallbackTask?.createdAt || new Date(Number(String(seed).replace(/[^0-9]/g, "")) || Date.now()).toISOString();
  const completedAt = typeof record.completedAt === "string" && record.completedAt.trim()
    ? record.completedAt.trim()
    : status === "completed"
      ? createdAt
      : null;

  return {
    id: typeof record.id === "string" && record.id.trim()
      ? record.id.trim()
      : typeof record.taskId === "string" && record.taskId.trim()
        ? record.taskId.trim()
        : fallbackId,
    title: titleSource,
    assignedAgent,
    priority: normalizeTaskPriority(record.priority, fallbackTask?.priority || "medium"),
    status,
    result: normalizeTaskResult(record.result, titleSource, assignedAgent, fallbackTask?.result),
    createdAt,
    completedAt
  };
}

function normalizeActionQueue(value: unknown, missionMode: MissionMode, seed: string | number) {
  const fallback = generateFallbackBrief(Number(String(seed).replace(/[^0-9]/g, "")) || Date.now(), missionMode).actionQueue;

  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .map((item, index) => normalizeTaskRecord(item, missionMode, seed, index, fallback[index] || fallback[0] || null))
    .filter((item): item is ActionTask => Boolean(item));

  return normalized.length ? normalized : fallback;
}

function normalizeSavedBrief(value: unknown): SavedBrief | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const missionMode = MISSION_MODES.includes(record.missionMode as MissionMode)
    ? record.missionMode as MissionMode
    : "Intel Mode";
  const savedAt = typeof record.savedAt === "string" && record.savedAt.trim() ? record.savedAt : new Date().toISOString();
  const snapshot = generateFallbackBrief(Date.now(), missionMode);

  return {
    id: typeof record.id === "string" && record.id.trim() ? record.id : `${savedAt}-${missionMode}`,
    savedAt,
    missionMode,
    overview: typeof record.overview === "string" && record.overview.trim() ? record.overview : snapshot.overview,
    priorities: Array.isArray(record.priorities) ? record.priorities.filter((item): item is string => typeof item === "string" && Boolean(item.trim())) : snapshot.priorities,
    commandNote: typeof record.commandNote === "string" && record.commandNote.trim() ? record.commandNote : snapshot.commandNote,
    bestNextMove: typeof record.bestNextMove === "string" && record.bestNextMove.trim() ? record.bestNextMove : snapshot.bestNextMove,
    whyNow: typeof record.whyNow === "string" && record.whyNow.trim() ? record.whyNow : snapshot.whyNow,
    expectedImpact: typeof record.expectedImpact === "string" && record.expectedImpact.trim() ? record.expectedImpact : snapshot.expectedImpact,
    actionQueue: normalizeActionQueue(record.actionQueue, missionMode, savedAt),
    marketIntelligence: normalizeMarketIntel(record.marketIntelligence, Date.now(), missionMode)
  };
}

function formatBriefContent(snapshot: IntelligenceSnapshot) {
  return [
    `Mission Mode: ${snapshot.missionMode}`,
    "",
    snapshot.overview,
    "",
    "Mission Priorities:",
    ...snapshot.priorities.map((priority, index) => `${index + 1}. ${priority}`),
    "",
    `Command Note: ${snapshot.commandNote}`,
    "",
    `Best Next Move: ${snapshot.bestNextMove}`,
    `Why Now: ${snapshot.whyNow}`,
    `Expected Impact: ${snapshot.expectedImpact}`,
    "",
    "ARCHAIOS Action Queue:",
    ...snapshot.actionQueue.map((item, index) => `${index + 1}. ${item.title} | ${item.assignedAgent} | ${item.priority} | ${item.status}`),
    "",
    "Market Intelligence:",
    `Opportunity: ${snapshot.marketIntelligence.opportunity}`,
    `Threat: ${snapshot.marketIntelligence.threat}`,
    `Recommendation: ${snapshot.marketIntelligence.recommendation}`,
    `Status: ${snapshot.marketIntelligence.status}`
  ].join("\n");
}

function isMissingMarketIntelValue(value: unknown) {
  if (typeof value !== "string") {
    return true;
  }

  const normalized = value.trim().toLowerCase();
  return !normalized || normalized === "not found" || normalized === "not_found";
}

function normalizeMarketIntel(value: unknown, seed = Date.now(), missionMode: MissionMode = "Intel Mode") {
  const fallback = generateFallbackMarketIntelligence(seed, missionMode);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const record = value as Record<string, unknown>;
  const status = typeof record.status === "string" ? record.status.trim().toLowerCase() : "";
  const message = typeof record.message === "string" ? record.message.trim().toLowerCase() : "";
  const opportunity = record.opportunity;
  const threat = record.threat;
  const recommendation = record.recommendation;

  if (
    status === "not_found" ||
    status === "not found" ||
    message.includes("not found") ||
    isMissingMarketIntelValue(opportunity) ||
    isMissingMarketIntelValue(threat) ||
    isMissingMarketIntelValue(recommendation)
  ) {
    return fallback;
  }

  return {
    opportunity: String(opportunity).trim(),
    threat: String(threat).trim(),
    recommendation: String(recommendation).trim(),
    status: "ready" as const
  };
}

function parseLiveBrief(data: unknown, seed = Date.now(), missionMode: MissionMode = "Intel Mode"): IntelligenceSnapshot | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const brief = (data as { brief?: Record<string, unknown> }).brief;
  if (!brief || typeof brief !== "object") {
    return null;
  }

  const summary = typeof brief.summary === "string" && brief.summary.trim()
    ? brief.summary.trim()
    : null;
  const content = typeof brief.content === "string" ? brief.content : "";
  const title = typeof brief.title === "string" && brief.title.trim()
    ? brief.title.trim()
    : "Live intelligence brief ready";
  const fallbackSnapshot = generateFallbackBrief(seed, missionMode);

  if (!summary) {
    return null;
  }

  const lines = content
    .split("\n")
    .map((line) => line.replace(/^[-*\d. ]+/, "").trim())
    .filter(Boolean);

  const priorities = lines.slice(0, 3);
  const normalizedMarketIntel = normalizeMarketIntel({
    ...(brief.marketIntelligence && typeof brief.marketIntelligence === "object"
      ? brief.marketIntelligence as Record<string, unknown>
      : {}),
    opportunity: lines[0] || (brief.marketIntelligence as Record<string, unknown> | undefined)?.opportunity,
    threat: lines[1] || (brief.marketIntelligence as Record<string, unknown> | undefined)?.threat,
    recommendation: lines[2] || (brief.marketIntelligence as Record<string, unknown> | undefined)?.recommendation,
    status: (brief.marketIntelligence as Record<string, unknown> | undefined)?.status,
    message: (brief.marketIntelligence as Record<string, unknown> | undefined)?.message
  }, seed, missionMode);

  const liveActionQueue = Array.isArray(brief.actionQueue)
    ? brief.actionQueue
        .map((item, index) => normalizeTaskRecord(item, missionMode, seed, index, fallbackSnapshot.actionQueue[index] || fallbackSnapshot.actionQueue[0] || null))
        .filter((item): item is ActionTask => Boolean(item))
        .slice(0, 5)
    : [];

  return {
    overview: summary,
    priorities: priorities.length ? priorities : fallbackSnapshot.priorities,
    commandNote: title,
    marketIntelligence: normalizedMarketIntel,
    bestNextMove: typeof brief.bestNextMove === "string" && brief.bestNextMove.trim()
      ? brief.bestNextMove.trim()
      : fallbackSnapshot.bestNextMove,
    whyNow: typeof brief.whyNow === "string" && brief.whyNow.trim()
      ? brief.whyNow.trim()
      : fallbackSnapshot.whyNow,
    expectedImpact: typeof brief.expectedImpact === "string" && brief.expectedImpact.trim()
      ? brief.expectedImpact.trim()
      : fallbackSnapshot.expectedImpact,
    actionQueue: liveActionQueue.length ? liveActionQueue : fallbackSnapshot.actionQueue,
    missionMode
  };
}

function badgeClass(status: string) {
  if (status === "error" || status === "blocked") return `${styles.badge} ${styles.badgeError}`;
  if (status === "warning" || status === "paused" || status === "missing_config") {
    return `${styles.badge} ${styles.badgeWarn}`;
  }
  return styles.badge;
}

export default function MasterControlPanel() {
  const [activePage, setActivePage] = useState<NavItem>("Overview");
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [revenue, setRevenue] = useState<Revenue | null>(null);
  const [intelligence, setIntelligence] = useState<IntelligenceBrief[]>([]);
  const [contentDrafts, setContentDrafts] = useState<ContentDraft[]>([]);
  const [marketingQueue, setMarketingQueue] = useState<MarketingQueueItem[]>([]);
  const [revenueAssets, setRevenueAssets] = useState<RevenueAsset[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [logs, setLogs] = useState<LogResponse | null>(null);
  const [logQuery, setLogQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [briefStatus, setBriefStatus] = useState<"idle" | "loading" | "error" | "ready">("idle");
  const [coreState, setCoreState] = useState<ArchaiosCoreState>(() => createInitialArchaiosState(FALLBACK_INTELLIGENCE));
  const [commandInput, setCommandInput] = useState("");
  const coreStateRef = useRef(coreState);
  const briefStatusRef = useRef(briefStatus);

  const missionMode = coreState.missionMode;
  const briefData = coreState.currentBrief;
  const savedBriefs = coreState.savedBriefs;
  const operations = coreState.taskQueue;
  const briefHistory = coreState.briefHistory;
  const exportTimestamp = coreState.systemSignals.lastBriefTimestamp;

  const topOpportunity = coreState.currentBrief.marketIntelligence.opportunity;
  const pendingTasksCount = operations.filter((task) => task.status === "pending").length;
  const intelFreshness = exportTimestamp
    ? `${Math.max(1, Math.round((Date.now() - Date.parse(exportTimestamp)) / 60000))} min ago`
    : "Awaiting brief";
  const operatorStatus = briefStatus === "loading"
    ? "Generating"
    : loading
      ? "Syncing"
      : "Autonomous";
  const executionReadiness = operations.length
    ? operations.some((task) => task.status === "blocked")
      ? "Blocked"
      : operations.every((task) => task.status === "completed")
      ? "Ready to ship"
      : operations.some((task) => task.status === "running")
        ? "Executing now"
        : "Awaiting execution"
    : "Brief required";
  const commandBar = [
    { label: "ARCHAIOS CORE", value: coreState.systemSignals.systemStatus || FALLBACK_ARCHAIOS.status },
    { label: "Mission Mode", value: coreState.missionMode },
    { label: "Active Agents", value: String(coreState.systemSignals.activeAgentCount) },
    { label: "Pending Tasks", value: String(coreState.systemSignals.pendingTasksCount) },
    { label: "Last Brief", value: exportTimestamp ? timestampLabel(exportTimestamp) : "No brief yet" },
    { label: "Sync Status", value: coreState.systemSignals.syncStatus }
  ];
  const liveSignals = [
    { label: "Revenue", value: coreState.systemSignals.revenueStatus, hint: "Recurring revenue snapshot" },
    { label: "System Health", value: systemStatus?.worker.status || "standby", hint: systemStatus?.supabase.status || "local runtime" },
    { label: "Intel Freshness", value: intelFreshness, hint: "Time since latest brief export" },
    { label: "Queue Load", value: `${pendingTasksCount} pending`, hint: executionReadiness },
    { label: "Operator Status", value: operatorStatus, hint: "Autonomy and manual controls online" },
    { label: "Memory Sync", value: "Local Memory", hint: coreState.systemSignals.syncStatus }
  ];
  const commandAgents = coreState.agentStates.map((agent, index) => ({
    ...agent,
    detail: [
      "Brief orchestration online",
      "Signal ingestion synchronized",
      "Revenue playbooks synced",
      "Distribution board synced",
      "Growth experiments staged",
      "Environment checks stable"
    ][index] || "ARCHAIOS agent online"
  }));
  const intelStream = coreState.intelStream.length
    ? coreState.intelStream.map((entry) => `$ ${timestampLabel(entry.createdAt)} :: ${entry.event} :: ${entry.detail}`).slice(0, 16)
    : ["$ awaiting operator input :: no agent activity yet"];

  useEffect(() => {
    coreStateRef.current = coreState;
  }, [coreState]);

  useEffect(() => {
    briefStatusRef.current = briefStatus;
  }, [briefStatus]);

  async function fetchJson<T>(url: string, fallback: T): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Request failed for ${url}: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Dashboard fetch failed for ${url}`, error);
      return fallback;
    }
  }

  async function loadOverview() {
    const [systemJson, agentsJson, intelligenceJson, contentJson, marketingJson, revenueJson, metricsJson, logsJson] = await Promise.all([
      fetchJson("/api/system/status", FALLBACK_SYSTEM_STATUS),
      fetchJson("/api/agents", { agents: [] as Agent[] }),
      fetchJson("/api/intelligence", { briefs: [] as IntelligenceBrief[] }),
      fetchJson("/api/content-drafts", { drafts: [] as ContentDraft[] }),
      fetchJson("/api/marketing-queue", { queue: [] as MarketingQueueItem[] }),
      fetchJson("/api/revenue", FALLBACK_REVENUE),
      fetchJson("/api/metrics", { metrics: [] as PerformanceMetric[], salesContent: [] as RevenueAsset[] }),
      fetchJson("/api/logs?page=1&pageSize=12", FALLBACK_LOGS)
    ]);

    setSystemStatus(systemJson);
    setAgents(agentsJson.agents || []);
    setIntelligence(intelligenceJson.briefs || []);
    setContentDrafts(contentJson.drafts || []);
    setMarketingQueue(marketingJson.queue || []);
    setRevenue(normalizeRevenue(revenueJson));
    setRevenueAssets(metricsJson.salesContent || []);
    setPerformanceMetrics(metricsJson.metrics || []);
    setLogs(logsJson);
  }

  useEffect(() => {
    setLoading(true);
    loadOverview().finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;

    async function initializeBrief() {
      await generateBrief({ initial: true, isMounted: () => active });
    }

    initializeBrief();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const storedMissionMode = loadMissionMode();
    const storedSavedBriefs = loadSavedBriefsMemory()
      .map((item) => normalizeSavedBrief(item))
      .filter((item): item is SavedBrief => Boolean(item));
    const resolvedMissionMode = storedMissionMode || FALLBACK_INTELLIGENCE.missionMode;
    const storedTaskQueue = normalizeActionQueue(loadTaskQueueMemory(), resolvedMissionMode, Date.now());
    const storedIntelStream = loadIntelStreamMemory().filter((item) => item && typeof item === "object" && typeof item.id === "string");

    setCoreState((current) => ({
      ...current,
      missionMode: resolvedMissionMode,
      currentBrief: current.currentBrief.missionMode === resolvedMissionMode
        ? {
            ...current.currentBrief,
            missionMode: resolvedMissionMode,
            actionQueue: storedTaskQueue.length ? storedTaskQueue : current.currentBrief.actionQueue
          }
        : generateFallbackBrief(Date.now(), resolvedMissionMode),
      savedBriefs: sortSavedBriefs(storedSavedBriefs),
      taskQueue: storedTaskQueue.length ? storedTaskQueue : current.taskQueue,
      intelStream: storedIntelStream.length ? storedIntelStream : current.intelStream
    }));
  }, []);

  useEffect(() => {
    saveMissionMode(coreState.missionMode);
  }, [coreState.missionMode]);

  useEffect(() => {
    saveSavedBriefsMemory(coreState.savedBriefs);
  }, [coreState.savedBriefs]);

  useEffect(() => {
    saveTaskQueueMemory(coreState.taskQueue);
  }, [coreState.taskQueue]);

  useEffect(() => {
    saveIntelStreamMemory(coreState.intelStream);
  }, [coreState.intelStream]);

  useEffect(() => {
    const nextAgentStates = deriveAgentStates({
      taskQueue: coreState.taskQueue,
      intelStream: coreState.intelStream,
      briefStatus,
      revenueReady: Boolean(revenue && revenue.monthlyRevenue > 0),
      systemErrorAlerts: systemStatus?.errorAlerts ?? 0
    });
    const nextSignals = deriveSystemSignals({
      systemStatus: systemStatus?.worker.status || FALLBACK_ARCHAIOS.status,
      agentStates: nextAgentStates,
      taskQueue: coreState.taskQueue,
      lastBriefTimestamp: coreState.systemSignals.lastBriefTimestamp,
      revenueStatus: revenue ? formatCurrency(revenue.monthlyRevenue) : formatCurrency(FALLBACK_MONTHLY_REVENUE),
      syncStatus: loading || briefStatus === "loading" ? "Syncing" : "Local runtime"
    });

    setCoreState((current) => ({
      ...current,
      agentStates: nextAgentStates,
      systemSignals: nextSignals
    }));
  }, [briefStatus, coreState.intelStream, coreState.systemSignals.lastBriefTimestamp, coreState.taskQueue, loading, revenue, systemStatus]);

  useEffect(() => {
    return startArchaiosAutonomy({
      getState: () => coreStateRef.current,
      setState: setCoreState,
      shouldRun: () => briefStatusRef.current !== "loading",
      intervalMs: 45000,
      autoExecuteSafeTasks: true
    });
  }, []);

  async function generateBrief(options?: { initial?: boolean; isMounted?: () => boolean }) {
    const startedAt = new Date().toISOString();
    const seed = Date.now();
    const mounted = options?.isMounted ?? (() => true);
    const activityPrefix = options?.initial ? "Automatic" : "Manual";
    const nextMissionMode = coreState.missionMode;

    if (!mounted()) {
      return;
    }

    setBriefStatus("loading");
    setCoreState((current) => ({
      ...current,
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("market_intel_triggered", "Market intelligence pipeline started", startedAt),
        createIntelStreamEntry("brief_run_started", `${activityPrefix} brief generation requested`, startedAt)
      )
    }));

    let snapshot = generateFallbackBrief(seed, nextMissionMode);
    let source: "live" | "fallback" = "fallback";

    try {
      const response = await fetch(`${WORKER_URL}/api/brief`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id: "guest-free",
          tier: "free",
          location: "Chicago",
          focus: nextMissionMode,
          tone: "direct",
          prompt: `Generate a ${nextMissionMode} intelligence brief with best next move and action queue`
        })
      });

      const data = await response.json().catch(() => null);
      console.log("Using WORKER_URL:", WORKER_URL);
      console.error("Brief API response:", data);

      const liveSnapshot = response.ok ? parseLiveBrief(data, seed, nextMissionMode) : null;
      if (liveSnapshot) {
        snapshot = liveSnapshot;
        source = "live";
      }
    } catch (error) {
      console.error("Brief request error", error);
    }

    if (!mounted()) {
      return;
    }

    const completedAt = new Date().toISOString();
    const historyEntry: BriefHistoryEntry = {
      id: `${completedAt}-${source}`,
      createdAt: completedAt,
      source,
      summary: snapshot.overview
    };

    setBriefStatus("ready");
    setCoreState((current) => {
      const normalizedSnapshot: IntelligenceSnapshot = {
        ...snapshot,
        marketIntelligence: normalizeMarketIntel(snapshot.marketIntelligence, seed, nextMissionMode),
        missionMode: nextMissionMode
      };

      return {
        ...current,
        missionMode: nextMissionMode,
        currentBrief: normalizedSnapshot,
        taskQueue: normalizedSnapshot.actionQueue.map((task) => ({
          ...task,
          createdAt: task.createdAt || completedAt,
          completedAt: task.status === "completed" ? task.completedAt || completedAt : null
        })),
        briefHistory: [historyEntry, ...current.briefHistory].slice(0, 8),
        intelStream: pushIntelStreamEntries(
          current.intelStream,
          createIntelStreamEntry("brief_archive", `${source.toUpperCase()} :: ${snapshot.overview}`, completedAt),
          createIntelStreamEntry("brief_run_completed", source === "live" ? "Brief generation completed with live data" : "Brief generation completed with fallback data", completedAt),
          createIntelStreamEntry("market_intel_completed", source === "live" ? "Market intelligence updated from live brief" : "Fallback market intelligence applied", completedAt)
        ),
        systemSignals: {
          ...current.systemSignals,
          lastBriefTimestamp: completedAt
        }
      };
    });
    setIntelligence((current) => [
      {
        id: Date.now(),
        topic: source === "live" ? "Live intelligence brief" : "Fallback intelligence brief",
        report: formatBriefContent(snapshot),
        created_at: completedAt
      },
      ...current
    ].slice(0, 20));
  }

  function saveBrief() {
    const savedAt = coreState.systemSignals.lastBriefTimestamp || new Date().toISOString();
    const nextEntry: SavedBrief = {
      id: `${savedAt}-${coreState.currentBrief.missionMode}`,
      savedAt,
      missionMode: coreState.currentBrief.missionMode,
      overview: coreState.currentBrief.overview,
      priorities: coreState.currentBrief.priorities,
      commandNote: coreState.currentBrief.commandNote,
      bestNextMove: coreState.currentBrief.bestNextMove,
      whyNow: coreState.currentBrief.whyNow,
      expectedImpact: coreState.currentBrief.expectedImpact,
      actionQueue: coreState.currentBrief.actionQueue,
      marketIntelligence: coreState.currentBrief.marketIntelligence
    };

    setCoreState((current) => ({
      ...current,
      savedBriefs: sortSavedBriefs([nextEntry, ...current.savedBriefs.filter((item) => item.id !== nextEntry.id)].slice(0, 20)),
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("brief_archive", `Saved brief archived for ${nextEntry.missionMode}`, savedAt)
      )
    }));
  }

  function loadSavedBrief(savedBrief: SavedBrief) {
    setBriefStatus("ready");
    setCoreState((current) => ({
      ...current,
      missionMode: savedBrief.missionMode,
      currentBrief: savedBrief,
      taskQueue: savedBrief.actionQueue.map((task) => ({
        ...task,
        createdAt: task.createdAt || savedBrief.savedAt,
        completedAt: task.completedAt || null
      })),
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("brief_archive", `Loaded saved brief for ${savedBrief.missionMode}`, new Date().toISOString())
      ),
      systemSignals: {
        ...current.systemSignals,
        lastBriefTimestamp: savedBrief.savedAt
      }
    }));
  }

  function deleteSavedBrief(id: string) {
    setCoreState((current) => ({
      ...current,
      savedBriefs: current.savedBriefs.filter((item) => item.id !== id)
    }));
  }

  function executeTask(taskId: string) {
    const startedAt = new Date().toISOString();
    let selectedTask: ActionTask | null = null;

    setCoreState((current) => {
      const next = beginTaskExecution(current, taskId, startedAt);
      selectedTask = next.task;
      return next.state;
    });

    window.setTimeout(() => {
      if (!selectedTask) {
        return;
      }
      const completedAt = new Date().toISOString();
      setCoreState((current) => completeTaskExecution(current, taskId, completedAt).state);
    }, 1200);
  }

  function queueManualTask(title: string) {
    const createdAt = new Date().toISOString();
    const nextTask: ActionTask = {
      id: `manual-${Date.now()}`,
      title,
      assignedAgent: "intelligence_agent",
      priority: "medium",
      status: "pending",
      result: `Manual operator task completed for ${title}.`,
      createdAt,
      completedAt: null
    };

    setCoreState((current) => ({
      ...current,
      taskQueue: [nextTask, ...current.taskQueue],
      currentBrief: {
        ...current.currentBrief,
        actionQueue: [nextTask, ...current.currentBrief.actionQueue]
      },
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("autonomy_task_generated", `Operator queued ${title}`, createdAt)
      )
    }));
    setActivePage("Operations");
  }

  function executePrimaryTask() {
    const task = operations.find((item) => item.status === "pending") || operations.find((item) => item.status === "running");
    if (task && task.status === "pending") {
      executeTask(task.id);
      return;
    }

    setCoreState((current) => ({
      ...current,
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("task_execution_blocked", "Primary execute requested with no pending task available")
      )
    }));
  }

  async function submitCommand(rawCommand?: string) {
    const command = (rawCommand ?? commandInput).trim();
    if (!command) {
      return;
    }

    const normalized = command.toLowerCase();
    setCommandInput("");

    if (normalized === "generate brief") {
      await generateBrief();
      return;
    }

    if (normalized.startsWith("switch mode")) {
      const nextMode = MISSION_MODES.find((mode) => normalized.includes(mode.toLowerCase().replace(" mode", ""))) || MISSION_MODES.find((mode) => normalized.includes(mode.toLowerCase()));
      if (nextMode) {
        setCoreState((current) => ({
          ...current,
          missionMode: nextMode,
          intelStream: pushIntelStreamEntries(
            current.intelStream,
            createIntelStreamEntry("autonomy_cycle", `Command input switched mission mode to ${nextMode}`)
          )
        }));
      }
      return;
    }

    if (normalized.startsWith("queue task")) {
      const title = command.replace(/queue task/i, "").trim() || "Operator-requested task";
      queueManualTask(title);
      return;
    }

    if (normalized === "show tasks") {
      setActivePage("Operations");
      setCoreState((current) => ({
        ...current,
        intelStream: pushIntelStreamEntries(
          current.intelStream,
          createIntelStreamEntry("autonomy_cycle", `Command input opened Operations Board with ${current.taskQueue.length} tasks.`)
        )
      }));
      return;
    }

    setCoreState((current) => ({
      ...current,
      intelStream: pushIntelStreamEntries(
        current.intelStream,
        createIntelStreamEntry("task_execution_blocked", `Command not recognized: ${command}`)
      )
    }));
  }

  async function refreshLogs(page = 1, query = logQuery) {
    const response = await fetch(`/api/logs?page=${page}&pageSize=12&q=${encodeURIComponent(query)}`);
    const payload = await response.json();
    setLogs(payload);
  }

  async function runRoute(path: string) {
    setLoading(true);
    await fetch(path, { method: "POST" });
    await loadOverview();
    setLoading(false);
  }

  async function runAgent(name: string) {
    setLoading(true);
    await fetch("/api/agents/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: name })
    });
    await loadOverview();
    setLoading(false);
  }

  async function pauseAgent(name: string, enabled: boolean) {
    setLoading(true);
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: name, enabled })
    });
    await loadOverview();
    setLoading(false);
  }

  async function scheduleAgent(name: string, currentTags: string[]) {
    const next = window.prompt("Enter schedule tags (comma separated: daily, hourly, weekly)", currentTags.join(", "));
    if (next == null) {
      return;
    }

    const tags = next
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item === "daily" || item === "hourly" || item === "weekly");

    setLoading(true);
    await fetch("/api/agents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agent: name, tags })
    });
    await loadOverview();
    setLoading(false);
  }

  async function approve(path: string, id: number) {
    setLoading(true);
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    await loadOverview();
    setLoading(false);
  }

  return (
    <div className={styles.shell}>
      <div className={styles.frame}>
        <aside className={styles.sidebar}>
          <h1 className={styles.brand}>
            ARCHAIOS
            <span>Master Control Panel</span>
          </h1>
          <p className={styles.navSectionLabel}>Command Rail</p>
          <nav className={styles.nav}>
            {NAV_ITEMS.map((item) => (
              <button
                key={item}
                className={`${styles.navButton} ${activePage === item ? styles.navButtonActive : ""}`}
                onClick={() => setActivePage(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>

        <main className={styles.content}>
          <section className={styles.commandBar}>
            {commandBar.map((item) => (
              <article className={styles.commandPill} key={item.label}>
                <p className={styles.label}>{item.label}</p>
                <p className={styles.commandValue}>{item.value}</p>
              </article>
            ))}
          </section>

          <section className={styles.signalRow}>
            {liveSignals.map((signal) => (
              <article className={`${styles.signalCard} ${signal.label === "Operator Status" ? styles.signalCardAccent : ""}`} key={signal.label}>
                <p className={styles.label}>{signal.label}</p>
                <p className={styles.signalValue}>{signal.value}</p>
                <p className={styles.hint}>{signal.hint}</p>
              </article>
            ))}
          </section>

          <section className={styles.hero}>
            <h2 className={styles.heroTitle}>Operate the autonomous ARCHAIOS network from one console.</h2>
            <p className={styles.heroText}>
              Intelligence generation, content drafting, marketing queueing, and revenue copy all stay inside approved Supabase-backed workflows.
              {" "}
              {loading ? "Refreshing data..." : "Manual controls are ready."}
            </p>
          </section>

          {activePage === "Overview" && systemStatus && revenue && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Overview</h2>
                <div className={styles.actions}>
                  <select
                    className={styles.input}
                    onChange={(event) => setCoreState((current) => ({ ...current, missionMode: event.target.value as MissionMode }))}
                    value={missionMode}
                  >
                    {MISSION_MODES.map((mode) => (
                      <option key={mode} value={mode}>{mode}</option>
                    ))}
                  </select>
                  <button className={styles.button} onClick={() => generateBrief()} type="button">Generate Brief</button>
                  <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => saveBrief()} type="button">Save Brief</button>
                  <button className={styles.button} onClick={() => loadOverview()} type="button">Refresh</button>
                </div>
              </div>
              <div className={styles.cards}>
                <Card label="Worker health" value={systemStatus.worker.status} hint={systemStatus.worker.url} />
                <Card
                  id="monthly-revenue-card"
                  dataHook="monthly-revenue"
                  label="Monthly Revenue"
                  value={formatCurrency(revenue.monthlyRevenue)}
                  hint="Fallback-safe recurring revenue snapshot"
                />
                <DetailCard
                  id="archaios-core-card"
                  dataHook="archaios-core"
                  title={FALLBACK_ARCHAIOS.title}
                  rows={[
                    { label: "Status", value: FALLBACK_ARCHAIOS.status },
                    { label: "Mode", value: FALLBACK_ARCHAIOS.mode }
                  ]}
                />
                <Card label="Intelligence briefs" value={String(intelligence.length)} hint="Recent generated intelligence items" />
                <Card label="Content drafts" value={String(contentDrafts.length)} hint="Tweet, blog, and newsletter backlog" />
                <Card label="Marketing queue" value={String(marketingQueue.length)} hint="Scheduled but not published" />
                <Card label="Revenue assets" value={String(revenueAssets.length)} hint="Sales copy drafts ready for review" />
              </div>
              <div className={styles.cards}>
                <Card
                  label="Overnight Overview"
                  value={
                    briefStatus === "loading"
                      ? "Stand by"
                      : briefData.overview
                  }
                  hint="Latest strategic market signal"
                />
                <Card
                  label="Mission Priorities"
                  value={
                    briefStatus === "loading"
                      ? "Stand by"
                      : briefData.priorities.join(" / ")
                  }
                  hint="First operational action from the brief"
                />
                <Card
                  label="Command Note"
                  value={
                    briefStatus === "loading"
                      ? "Stand by"
                      : briefData.commandNote
                  }
                  hint="Generated brief title"
                />
                <Card
                  label="Best Next Move"
                  value={briefStatus === "loading" ? "Stand by" : briefData.bestNextMove}
                  hint={briefStatus === "loading" ? "Stand by" : briefData.whyNow}
                />
                <Card
                  label="ARCHAIOS Action Queue"
                  value={briefStatus === "loading" ? "Stand by" : briefData.actionQueue[0]?.title || "Stand by"}
                  hint={briefStatus === "loading" ? "Stand by" : briefData.expectedImpact}
                />
                <Card
                  label="Export Timestamp"
                  value={exportTimestamp ? timestampLabel(exportTimestamp) : "Awaiting brief export"}
                  hint="Most recent intelligence package time"
                />
                <Card
                  label="History"
                  value={briefHistory[0] ? `${briefHistory.length} entries` : "No entries yet"}
                  hint={briefHistory[0] ? `${briefHistory[0].source} run at ${timestampLabel(briefHistory[0].createdAt)} in ${missionMode}` : "Generate a brief to create the first history item"}
                />
                <Card
                  label="Agent Activity"
                  value={coreState.intelStream[0] ? `${coreState.intelStream.length} events` : "No activity yet"}
                  hint={coreState.intelStream[0] ? coreState.intelStream[0].event : "Generate a brief to log agent events"}
                />
                <Card
                  label="Market Intelligence"
                  value={briefData.marketIntelligence.opportunity}
                  hint={briefData.marketIntelligence.recommendation}
                />
                <Card
                  label="Market Intel Status"
                  value={briefStatus === "loading" ? "Stand by" : "Ready"}
                  hint={briefData.marketIntelligence.threat}
                />
              </div>
              <div className={styles.sectionHeader} style={{ marginTop: 18 }}>
                <h2>Agent Status Grid</h2>
              </div>
              <div className={styles.commandNodeGrid}>
                {commandAgents.map((agent) => (
                  <article className={styles.commandNode} key={agent.name}>
                    <div className={styles.commandNodeHeader}>
                      <p className={styles.label}>{agent.name}</p>
                      <span className={badgeClass(agent.status)}>{agent.status}</span>
                    </div>
                    <p className={styles.commandNodeValue}>{agent.currentTask || agent.detail}</p>
                    <p className={styles.hint}>{agent.lastRun ? `Last run ${timestampLabel(agent.lastRun)}` : agent.detail}</p>
                  </article>
                ))}
              </div>
              <div className={styles.gridTwo}>
                <div className={styles.decisionHero}>
                  <p className={styles.label}>Decision Engine</p>
                  <h3 className={styles.decisionTitle}>{briefData.bestNextMove}</h3>
                  <div className={styles.decisionMetrics}>
                    <article className={styles.decisionMetric}>
                      <p className={styles.label}>Why Now</p>
                      <p className={styles.decisionBody}>{briefData.whyNow}</p>
                    </article>
                    <article className={styles.decisionMetric}>
                      <p className={styles.label}>Expected Impact</p>
                      <p className={styles.decisionBody}>{briefData.expectedImpact}</p>
                    </article>
                  </div>
                  <div className={styles.actions}>
                    <button className={`${styles.button} ${styles.primaryCommandButton}`} onClick={() => executePrimaryTask()} type="button">
                      Execute Primary Move
                    </button>
                    <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => generateBrief()} type="button">
                      Refresh Decision
                    </button>
                  </div>
                  <div className={styles.decisionFooter}>
                    <span className={badgeClass(executionReadiness === "Blocked" ? "blocked" : executionReadiness === "Executing now" ? "warning" : "ready")}>
                      {executionReadiness}
                    </span>
                    <span className={styles.hint}>Top Opportunity: {topOpportunity}</span>
                  </div>
                </div>
                <div className={styles.consolePanel}>
                  <div className={styles.terminalHeader}>Intel Stream / Event Console</div>
                  <div className={styles.consolePrompt}>ARCHAIOS://console</div>
                  {intelStream.map((line, index) => (
                    <div className={styles.streamLine} key={`${line}-${index}`}>{line}</div>
                  ))}
                </div>
              </div>
              <div className={styles.sectionHeader} style={{ marginTop: 18 }}>
                <h2>ARCHAIOS Operations Board</h2>
              </div>
              <div className={styles.operationsBoard}>
                {operations.length ? operations.slice(0, 3).map((task) => (
                  <article className={`${styles.card} ${styles.detailCard} ${styles.operationCard}`} key={`overview-${task.id}`}>
                    <p className={styles.label}>{task.assignedAgent}</p>
                    <p className={styles.value} style={{ fontSize: 18 }}>{task.title}</p>
                    <div className={styles.actions}>
                      <span className={badgeClass(task.priority === "critical" ? "error" : task.priority === "high" ? "warning" : "ready")}>{task.priority}</span>
                      <span className={badgeClass(task.status === "running" ? "warning" : task.status === "blocked" ? "blocked" : task.status)}>{task.status}</span>
                    </div>
                    <p className={styles.hint}>Created: {timestampLabel(task.createdAt)}</p>
                  </article>
                )) : (
                  <article className={`${styles.card} ${styles.detailCard}`}>
                    <p className={styles.label}>ARCHAIOS Operations Board</p>
                    <p className={styles.hint}>Generate a brief to stage live operator tasks.</p>
                  </article>
                )}
              </div>
              <div className={styles.commandConsoleSection}>
                <div className={styles.sectionHeader} style={{ marginTop: 18 }}>
                  <h2>ARCHAIOS Command Input</h2>
                </div>
                <form
                  className={styles.commandInputBar}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void submitCommand();
                  }}
                >
                  <input
                    className={`${styles.input} ${styles.commandInputField}`}
                    onChange={(event) => setCommandInput(event.target.value)}
                    placeholder="generate brief | switch mode revenue | queue task investigate AI partnerships | show tasks"
                    value={commandInput}
                  />
                  <button className={`${styles.button} ${styles.primaryCommandButton}`} type="submit">Submit</button>
                </form>
              </div>
            </section>
          )}

          {activePage === "Agents" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Agents</h2>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Status</th>
                      <th>Schedule</th>
                      <th>Last run</th>
                      <th>Controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agents.map((agent) => (
                      <tr key={agent.name}>
                        <td>
                          <strong>{agent.name}</strong>
                          <div className={styles.hint}>{agent.description || "No description"}</div>
                        </td>
                        <td><span className={badgeClass(agent.enabled ? agent.last_status : "paused")}>{agent.enabled ? agent.last_status : "paused"}</span></td>
                        <td>{(agent.tags || []).join(", ") || "manual"}</td>
                        <td>{formatDate(agent.last_run)}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.button} onClick={() => runAgent(agent.name)} type="button">Run</button>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => pauseAgent(agent.name, !agent.enabled)} type="button">
                              {agent.enabled ? "Pause" : "Resume"}
                            </button>
                            <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => scheduleAgent(agent.name, agent.tags || [])} type="button">
                              Schedule
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Intelligence" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Intelligence</h2>
                <div className={styles.actions}>
                  <button className={styles.button} onClick={() => runRoute("/api/agents/intelligence")} type="button">Run intelligence</button>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Created</th>
                      <th>Brief</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intelligence.map((brief) => (
                      <tr key={brief.id}>
                        <td>{brief.topic}</td>
                        <td>{formatDate(brief.created_at)}</td>
                        <td><div className={styles.pre}>{brief.report}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Decision Engine" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Decision Engine</h2>
              </div>
              <div className={styles.gridTwo}>
                <div className={`${styles.pre} ${styles.decisionHero}`}>
                  {[
                    `Mission Mode: ${briefData.missionMode}`,
                    "",
                    `Best Next Move: ${briefData.bestNextMove}`,
                    "",
                    `Why Now: ${briefData.whyNow}`,
                    "",
                    `Expected Impact: ${briefData.expectedImpact}`,
                    "",
                    "Mission Priorities:",
                    ...briefData.priorities.map((priority, index) => `${index + 1}. ${priority}`)
                  ].join("\n")}
                </div>
                <div className={styles.pre}>
                  {[
                    "Market Intelligence",
                    "",
                    `Opportunity: ${briefData.marketIntelligence.opportunity}`,
                    `Threat: ${briefData.marketIntelligence.threat}`,
                    `Recommendation: ${briefData.marketIntelligence.recommendation}`,
                    "Status: Ready"
                  ].join("\n")}
                </div>
              </div>
            </section>
          )}

          {activePage === "Operations" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>ARCHAIOS Operations Board</h2>
              </div>
              <div className={styles.operationsBoard}>
                {operations.length ? operations.map((task) => (
                  <article className={`${styles.card} ${styles.detailCard} ${styles.operationCard}`} key={task.id}>
                    <p className={styles.label}>Task {task.id}</p>
                    <p className={styles.value} style={{ fontSize: 20 }}>{task.title}</p>
                    <p className={styles.hint}>Assigned Agent: {task.assignedAgent}</p>
                    <p className={styles.hint}>Priority: {task.priority}</p>
                    <p className={styles.hint}>Created: {timestampLabel(task.createdAt)}</p>
                    <p className={styles.hint}>Completed: {task.completedAt ? timestampLabel(task.completedAt) : "Awaiting completion"}</p>
                    <div className={styles.actions}>
                      <span className={badgeClass(task.status === "running" ? "warning" : task.status === "blocked" ? "error" : task.status)}>{task.status}</span>
                      <button
                        className={styles.button}
                        disabled={task.status !== "pending"}
                        onClick={() => executeTask(task.id)}
                        type="button"
                      >
                        {task.status === "pending" ? "Execute" : task.status === "running" ? "Running" : task.status === "blocked" ? "Blocked" : "Completed"}
                      </button>
                    </div>
                    <p className={styles.hint}>Result: {task.status === "completed" ? task.result : task.status === "running" ? "Execution in progress" : task.status === "blocked" ? task.result : "Awaiting execution"}</p>
                  </article>
                )) : (
                  <article className={`${styles.card} ${styles.detailCard}`}>
                    <p className={styles.label}>ARCHAIOS Operations Board</p>
                    <p className={styles.hint}>Generate a brief to create executable operations.</p>
                  </article>
                )}
              </div>
              <div className={styles.sectionHeader} style={{ marginTop: 18 }}>
                <h2>Intel Stream</h2>
              </div>
              <div className={styles.terminalStream}>
                <div className={styles.terminalHeader}>ARCHAIOS Intel Stream</div>
                <div className={styles.consolePrompt}>ARCHAIOS://ops</div>
                {intelStream.map((line, index) => (
                  <div className={styles.streamLine} key={`${line}-${index}`}>{line}</div>
                ))}
              </div>
            </section>
          )}

          {activePage === "Saved Briefs" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Saved Briefs</h2>
              </div>
              <div className={styles.cards}>
                {savedBriefs.length ? savedBriefs.map((savedBrief) => (
                  <article className={`${styles.card} ${styles.detailCard}`} key={savedBrief.id}>
                    <p className={styles.label}>Saved Brief</p>
                    <p className={styles.hint}>{timestampLabel(savedBrief.savedAt)}</p>
                    <p className={styles.hint}>{savedBrief.missionMode}</p>
                    <p className={styles.hint}>{firstLine(savedBrief.overview)}</p>
                    <div className={styles.actions}>
                      <button className={styles.button} onClick={() => loadSavedBrief(savedBrief)} type="button">Load</button>
                      <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => deleteSavedBrief(savedBrief.id)} type="button">Delete</button>
                    </div>
                  </article>
                )) : (
                  <article className={`${styles.card} ${styles.detailCard}`}>
                    <p className={styles.label}>Saved Briefs</p>
                    <p className={styles.hint}>No saved briefs yet. Generate and save a brief to build the archive.</p>
                  </article>
                )}
              </div>
            </section>
          )}

          {activePage === "Content drafts" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Content drafts</h2>
                <div className={styles.actions}>
                  <button className={styles.button} onClick={() => runRoute("/api/agents/content")} type="button">Run content</button>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contentDrafts.map((draft) => (
                      <tr key={draft.id}>
                        <td>{draft.channel}</td>
                        <td>{draft.content_type}</td>
                        <td><span className={badgeClass(draft.status)}>{draft.status}</span></td>
                        <td>{formatDate(draft.created_at)}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.button} onClick={() => approve("/api/content-drafts/approve", draft.id)} type="button">Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Marketing queue" && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Marketing queue</h2>
                <div className={styles.actions}>
                  <button className={styles.button} onClick={() => runRoute("/api/agents/marketing")} type="button">Run marketing</button>
                </div>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Channel</th>
                      <th>Status</th>
                      <th>Scheduled</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketingQueue.map((item) => (
                      <tr key={item.id}>
                        <td>{item.channel}</td>
                        <td><span className={badgeClass(item.status)}>{item.status}</span></td>
                        <td>{formatDate(item.scheduled_time)}</td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.button} onClick={() => approve("/api/marketing-queue/approve", item.id)} type="button">Approve</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Revenue analytics" && revenue && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Revenue analytics</h2>
                <div className={styles.actions}>
                  <button className={styles.button} onClick={() => runRoute("/api/agents/revenue")} type="button">Run revenue</button>
                </div>
              </div>
              <div className={styles.gridTwo}>
                <div className={styles.cards}>
                  <Card
                    id="revenue-analytics-monthly-revenue-card"
                    dataHook="revenue-analytics-monthly-revenue"
                    label="Monthly Revenue"
                    value={formatCurrency(revenue.monthlyRevenue)}
                    hint="Primary dashboard revenue target"
                  />
                  <Card label="Subscriptions" value={String(revenue.subscriptions.total)} hint={`${revenue.subscriptions.active} active`} />
                  <Card label="Revenue today" value={String(revenue.revenueToday)} hint="Webhook deliveries seen today" />
                  <Card label="Revenue assets" value={String(revenueAssets.length)} hint="Sales copy drafts" />
                  <Card label="Metric rows" value={String(performanceMetrics.length)} hint="Feedback and optimization records" />
                </div>
                <div className={styles.pre}>{JSON.stringify({ stripeMetrics: revenue.stripeMetrics, performanceMetrics, salesContent: revenueAssets }, null, 2)}</div>
              </div>
            </section>
          )}

          {activePage === "Infrastructure" && systemStatus && (
            <section className={styles.section}>
              <div className={styles.metaGrid}>
                <StatusBlock title="Worker" status={systemStatus.worker.status} detail={systemStatus.worker.url} />
                <StatusBlock title="Supabase" status={systemStatus.supabase.status} detail={systemStatus.supabase.detail || "Queries available"} />
                <StatusBlock title="Stripe" status={systemStatus.stripe.status} detail={`${systemStatus.stripe.webhook_events} webhook events logged`} />
                <StatusBlock title="GitHub actions" status={systemStatus.githubActions.status} detail="Heartbeat workflow presence check" />
              </div>
            </section>
          )}

          {activePage === "Logs" && logs && (
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Logs</h2>
              </div>
              <div className={styles.searchBar}>
                <input className={styles.input} onChange={(event) => setLogQuery(event.target.value)} placeholder="Search by agent or category" value={logQuery} />
                <button className={styles.button} onClick={() => refreshLogs(1)} type="button">Search</button>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.logs.map((log, index) => (
                      <tr key={`${log.agent_name}-${log.created_at}-${index}`}>
                        <td>{log.agent_name}</td>
                        <td>{log.category}</td>
                        <td><span className={badgeClass(log.status)}>{log.status}</span></td>
                        <td>{formatDate(log.created_at)}</td>
                        <td><div className={styles.pre}>{JSON.stringify(log.output, null, 2)}</div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {activePage === "Settings" && (
            <section className={styles.section}>
              <div className={styles.pre}>
                {JSON.stringify(
                  {
                    workerBaseUrl: "set via WORKER_BASE_URL or defaults to deployed worker",
                    controls: ["Run intelligence/content/marketing/revenue", "Approve content drafts", "Approve marketing queue"],
                    scheduler: "single cron trigger runs intelligence -> content -> marketing -> revenue"
                  },
                  null,
                  2
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({
  id,
  dataHook,
  label,
  value,
  hint
}: {
  id?: string;
  dataHook?: string;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className={styles.card} data-card={dataHook} id={id}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      <p className={styles.hint}>{hint}</p>
    </article>
  );
}

function DetailCard({
  id,
  dataHook,
  title,
  rows
}: {
  id?: string;
  dataHook?: string;
  title: string;
  rows: Array<{ label: string; value: string }>;
}) {
  return (
    <article className={`${styles.card} ${styles.detailCard}`} data-card={dataHook} id={id}>
      <p className={styles.label}>{title}</p>
      <div className={styles.detailRows}>
        {rows.map((row) => (
          <div className={styles.detailRow} key={row.label}>
            <span className={styles.detailLabel}>{row.label}</span>
            <span className={styles.detailValue}>{row.value}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function StatusBlock({ title, status, detail }: { title: string; status: string; detail: string }) {
  return (
    <article className={styles.card}>
      <p className={styles.label}>{title}</p>
      <p className={styles.value} style={{ fontSize: 22 }}>{status}</p>
      <p className={styles.hint}>{detail}</p>
    </article>
  );
}
