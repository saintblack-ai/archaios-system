import type { ActionTask, MissionMode } from "../briefFallback";
import { beginTaskExecution, completeTaskExecution } from "./execution";
import {
  createIntelStreamEntry,
  pushIntelStreamEntries,
  type ArchaiosCoreState
} from "./state";

const AUTONOMY_BRIEF_THRESHOLD_MS = 10 * 60 * 1000;

type AutonomyContext = {
  now?: string;
  autoExecuteSafeTasks?: boolean;
};

type AutonomyTaskSpec = {
  title: string;
  assignedAgent: string;
  priority: ActionTask["priority"];
  result: string;
};

type AutonomyResult = {
  state: ArchaiosCoreState;
  generatedTaskIds: string[];
  executedTaskIds: string[];
};

type StartArchaiosAutonomyOptions = {
  getState: () => ArchaiosCoreState;
  setState: (updater: (current: ArchaiosCoreState) => ArchaiosCoreState) => void;
  shouldRun?: () => boolean;
  intervalMs?: number;
  autoExecuteSafeTasks?: boolean;
};

function taskExists(taskQueue: ActionTask[], matcher: (task: ActionTask) => boolean) {
  return taskQueue.some((task) => matcher(task) && (task.status === "pending" || task.status === "running"));
}

function createAutonomyTask(spec: AutonomyTaskSpec, missionMode: MissionMode, timestamp: string, index: number): ActionTask {
  return {
    id: `autonomy-${missionMode.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.parse(timestamp)}-${index}`,
    title: spec.title,
    assignedAgent: spec.assignedAgent,
    priority: spec.priority,
    status: "pending",
    result: spec.result,
    createdAt: timestamp,
    completedAt: null
  };
}

function getAutonomyCandidates(state: ArchaiosCoreState, timestamp: string) {
  const candidates: AutonomyTaskSpec[] = [];
  const hasPendingOrRunningTasks = state.taskQueue.some((task) => task.status === "pending" || task.status === "running");
  const lastBriefAge = state.systemSignals.lastBriefTimestamp
    ? Date.parse(timestamp) - Date.parse(state.systemSignals.lastBriefTimestamp)
    : Number.POSITIVE_INFINITY;
  const briefAgentRunning = state.agentStates.some((agent) => agent.name === "Brief Agent" && agent.status === "running");
  const mediaAgentRunning = state.agentStates.some((agent) => agent.name === "Media Ops Agent" && agent.status === "running");

  if (!hasPendingOrRunningTasks) {
    candidates.push({
      title: "Run ARCHAIOS market intelligence scan.",
      assignedAgent: "market_intel_agent",
      priority: "medium",
      result: "Autonomous market intelligence scan completed and signals refreshed."
    });
  }

  if (lastBriefAge > AUTONOMY_BRIEF_THRESHOLD_MS && !briefAgentRunning && !taskExists(state.taskQueue, (task) => task.assignedAgent.includes("brief") || task.title.toLowerCase().includes("brief"))) {
    candidates.push({
      title: "Generate a fresh operator brief from current system signals.",
      assignedAgent: "brief_agent",
      priority: "high",
      result: "Autonomous operator brief task completed and ARCHAIOS brief cycle refreshed."
    });
  }

  if (!mediaAgentRunning && !taskExists(state.taskQueue, (task) => task.assignedAgent.includes("media") || task.title.toLowerCase().includes("media ops"))) {
    candidates.push({
      title: "Draft one Media Ops distribution idea from the current mission posture.",
      assignedAgent: "media_ops_agent",
      priority: "low",
      result: "Autonomous media operations idea drafted for operator review."
    });
  }

  return candidates.map((candidate, index) => createAutonomyTask(candidate, state.missionMode, timestamp, index));
}

function syncTaskQueueIntoBrief(state: ArchaiosCoreState, taskQueue: ActionTask[]) {
  return {
    ...state,
    taskQueue,
    currentBrief: {
      ...state.currentBrief,
      actionQueue: taskQueue
    }
  };
}

function shouldAutoExecute(task: ActionTask) {
  return task.priority === "low" || task.title.toLowerCase().includes("scan");
}

export function runAutonomyCycle(state: ArchaiosCoreState, context: AutonomyContext = {}): AutonomyResult {
  const timestamp = context.now || new Date().toISOString();
  const autoExecuteSafeTasks = context.autoExecuteSafeTasks ?? true;
  const candidates = getAutonomyCandidates(state, timestamp);

  let nextState = state;
  const generatedTaskIds: string[] = [];
  const executedTaskIds: string[] = [];

  nextState = {
    ...nextState,
    intelStream: pushIntelStreamEntries(
      nextState.intelStream,
      createIntelStreamEntry("autonomy_cycle", `Autonomy cycle evaluated ${nextState.taskQueue.length} queued tasks.`, timestamp)
    )
  };

  if (!candidates.length) {
    return { state: nextState, generatedTaskIds, executedTaskIds };
  }

  const nextTaskQueue = [...candidates, ...nextState.taskQueue];
  nextState = syncTaskQueueIntoBrief(nextState, nextTaskQueue);
  generatedTaskIds.push(...candidates.map((task) => task.id));
  nextState = {
    ...nextState,
    intelStream: pushIntelStreamEntries(
      nextState.intelStream,
      ...candidates.map((task) => createIntelStreamEntry("autonomy_task_generated", `Autonomy queued ${task.title}`, timestamp))
    )
  };

  if (!autoExecuteSafeTasks) {
    return { state: nextState, generatedTaskIds, executedTaskIds };
  }

  for (const task of candidates.filter(shouldAutoExecute)) {
    const started = beginTaskExecution(nextState, task.id, timestamp);
    nextState = started.state;
    if (!started.task) {
      continue;
    }

    const completed = completeTaskExecution(nextState, task.id, timestamp);
    nextState = completed.state;
    executedTaskIds.push(task.id);
  }

  if (executedTaskIds.length) {
    nextState = {
      ...nextState,
      intelStream: pushIntelStreamEntries(
        nextState.intelStream,
        createIntelStreamEntry("autonomy_task_executed", `Autonomy auto-executed ${executedTaskIds.length} safe task${executedTaskIds.length === 1 ? "" : "s"}.`, timestamp)
      )
    };
  }

  return { state: nextState, generatedTaskIds, executedTaskIds };
}

export function startArchaiosAutonomy(options: StartArchaiosAutonomyOptions) {
  const intervalMs = options.intervalMs ?? 45000;
  const autoExecuteSafeTasks = options.autoExecuteSafeTasks ?? true;

  const tick = () => {
    if (options.shouldRun && !options.shouldRun()) {
      return;
    }

    options.setState((current) => runAutonomyCycle(options.getState() || current, {
      now: new Date().toISOString(),
      autoExecuteSafeTasks
    }).state);
  };

  tick();
  const intervalId = window.setInterval(tick, intervalMs);
  return () => window.clearInterval(intervalId);
}
