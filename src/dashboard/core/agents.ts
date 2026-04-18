import type { ActionTask } from "../briefFallback";
import { ARCHAIOS_AGENT_NAMES, type AgentRuntimeStatus, type AgentState, type IntelStreamEntry } from "./state";

type DeriveAgentStatesOptions = {
  taskQueue: ActionTask[];
  intelStream: IntelStreamEntry[];
  briefStatus: "idle" | "loading" | "error" | "ready";
  revenueReady: boolean;
  systemErrorAlerts: number;
};

const AGENT_TASK_HINTS: Record<(typeof ARCHAIOS_AGENT_NAMES)[number], string[]> = {
  "Brief Agent": ["brief", "mentor", "intelligence"],
  "Market Intel Agent": ["intel", "mentor", "intelligence"],
  "Revenue Agent": ["revenue"],
  "Media Ops Agent": ["media", "marketing"],
  "Growth Agent": ["growth", "optimization", "marketing"],
  "Security Sentinel": ["security", "sentinel"]
};

function matchesAgent(task: ActionTask, agentName: (typeof ARCHAIOS_AGENT_NAMES)[number]) {
  const haystack = `${task.assignedAgent} ${task.title}`.toLowerCase();
  return AGENT_TASK_HINTS[agentName].some((token) => haystack.includes(token));
}

function getLatestAgentEntry(intelStream: IntelStreamEntry[], agentName: (typeof ARCHAIOS_AGENT_NAMES)[number]) {
  const key = agentName.split(" ")[0].toLowerCase();
  return intelStream.find((entry) => entry.detail.toLowerCase().includes(key));
}

export function deriveAgentStates(options: DeriveAgentStatesOptions): AgentState[] {
  return ARCHAIOS_AGENT_NAMES.map((name) => {
    const runningTask = options.taskQueue.find((task) => matchesAgent(task, name) && task.status === "running");
    const blockedTask = options.taskQueue.find((task) => matchesAgent(task, name) && task.status === "blocked");
    const completedTask = [...options.taskQueue].reverse().find((task) => matchesAgent(task, name) && task.status === "completed");
    const lastEntry = getLatestAgentEntry(options.intelStream, name);

    let status: AgentRuntimeStatus = "ready";
    if (name === "Security Sentinel" && options.systemErrorAlerts > 0) {
      status = "warning";
    } else if (name === "Revenue Agent" && !options.revenueReady) {
      status = "warning";
    } else if ((name === "Brief Agent" || name === "Market Intel Agent") && options.briefStatus === "loading") {
      status = "running";
    } else if (blockedTask) {
      status = "warning";
    } else if (runningTask) {
      status = "running";
    }

    return {
      name,
      status,
      lastRun: runningTask?.createdAt || completedTask?.completedAt || lastEntry?.createdAt || null,
      currentTask: runningTask?.title || blockedTask?.title || null,
      result: completedTask?.result || null,
      health: status === "warning" ? "degraded" : status === "error" ? "critical" : "stable"
    };
  });
}
