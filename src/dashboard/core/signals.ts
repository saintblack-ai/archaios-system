import type { ActionTask } from "../briefFallback";
import type { AgentState, SystemSignals } from "./state";

type DeriveSystemSignalsOptions = {
  systemStatus: string;
  agentStates: AgentState[];
  taskQueue: ActionTask[];
  lastBriefTimestamp: string | null;
  revenueStatus: string;
  syncStatus: string;
};

export function deriveSystemSignals(options: DeriveSystemSignalsOptions): SystemSignals {
  return {
    systemStatus: options.systemStatus,
    activeAgentCount: options.agentStates.filter((agent) => agent.status !== "offline").length,
    pendingTasksCount: options.taskQueue.filter((task) => task.status === "pending").length,
    lastBriefTimestamp: options.lastBriefTimestamp,
    revenueStatus: options.revenueStatus,
    syncStatus: options.syncStatus
  };
}
