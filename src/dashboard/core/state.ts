import type { ActionTask, IntelligenceSnapshot, MissionMode } from "../briefFallback";

export const ARCHAIOS_AGENT_NAMES = [
  "Brief Agent",
  "Market Intel Agent",
  "Revenue Agent",
  "Media Ops Agent",
  "Growth Agent",
  "Security Sentinel"
] as const;

export type ArchaiosAgentName = (typeof ARCHAIOS_AGENT_NAMES)[number];
export type AgentRuntimeStatus = "ready" | "running" | "warning" | "error" | "offline";
export type AgentHealth = "stable" | "degraded" | "critical";

export type SavedBrief = IntelligenceSnapshot & {
  id: string;
  savedAt: string;
};

export type BriefHistoryEntry = {
  id: string;
  createdAt: string;
  source: "live" | "fallback";
  summary: string;
};

export type IntelStreamEvent =
  | "brief_run_started"
  | "brief_run_completed"
  | "market_intel_triggered"
  | "market_intel_completed"
  | "task_execution_started"
  | "task_execution_completed"
  | "task_execution_blocked"
  | "brief_archive"
  | "autonomy_cycle"
  | "autonomy_task_generated"
  | "autonomy_task_executed";

export type IntelStreamEntry = {
  id: string;
  createdAt: string;
  event: IntelStreamEvent;
  detail: string;
};

export type AgentState = {
  name: ArchaiosAgentName;
  status: AgentRuntimeStatus;
  lastRun: string | null;
  currentTask: string | null;
  result: string | null;
  health: AgentHealth;
};

export type SystemSignals = {
  systemStatus: string;
  activeAgentCount: number;
  pendingTasksCount: number;
  lastBriefTimestamp: string | null;
  revenueStatus: string;
  syncStatus: string;
};

export type ArchaiosCoreState = {
  missionMode: MissionMode;
  currentBrief: IntelligenceSnapshot;
  savedBriefs: SavedBrief[];
  taskQueue: ActionTask[];
  agentStates: AgentState[];
  intelStream: IntelStreamEntry[];
  systemSignals: SystemSignals;
  briefHistory: BriefHistoryEntry[];
};

export function createIntelStreamEntry(event: IntelStreamEvent, detail: string, createdAt = new Date().toISOString()): IntelStreamEntry {
  return {
    id: `${createdAt}-${event}-${detail.slice(0, 24).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    createdAt,
    event,
    detail
  };
}

export function pushIntelStreamEntries(current: IntelStreamEntry[], ...entries: IntelStreamEntry[]) {
  return [...entries, ...current].slice(0, 20);
}

export function sortSavedBriefs(savedBriefs: SavedBrief[]) {
  return [...savedBriefs].sort((left, right) => right.savedAt.localeCompare(left.savedAt));
}

export function createInitialArchaiosState(fallbackBrief: IntelligenceSnapshot): ArchaiosCoreState {
  return {
    missionMode: fallbackBrief.missionMode,
    currentBrief: fallbackBrief,
    savedBriefs: [],
    taskQueue: fallbackBrief.actionQueue,
    agentStates: ARCHAIOS_AGENT_NAMES.map((name) => ({
      name,
      status: "ready",
      lastRun: null,
      currentTask: null,
      result: null,
      health: "stable"
    })),
    intelStream: [],
    systemSignals: {
      systemStatus: "Active",
      activeAgentCount: ARCHAIOS_AGENT_NAMES.length,
      pendingTasksCount: fallbackBrief.actionQueue.filter((task) => task.status === "pending").length,
      lastBriefTimestamp: null,
      revenueStatus: "$49.99",
      syncStatus: "Local runtime"
    },
    briefHistory: []
  };
}
