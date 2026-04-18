import type { ActionTask } from "../briefFallback";
import { createIntelStreamEntry, pushIntelStreamEntries, type ArchaiosCoreState } from "./state";

type TaskTransitionResult = {
  state: ArchaiosCoreState;
  task: ActionTask | null;
};

function updateTaskCollection(tasks: ActionTask[], taskId: string, updater: (task: ActionTask) => ActionTask) {
  return tasks.map((task) => (task.id === taskId ? updater(task) : task));
}

export function beginTaskExecution(state: ArchaiosCoreState, taskId: string, startedAt: string): TaskTransitionResult {
  const task = state.taskQueue.find((item) => item.id === taskId) || null;

  if (!task || task.status !== "pending") {
    return {
      task: null,
      state: {
        ...state,
        intelStream: pushIntelStreamEntries(
          state.intelStream,
          createIntelStreamEntry("task_execution_blocked", "Task execution request ignored because the task is no longer pending", startedAt)
        )
      }
    };
  }

  const runningTask = { ...task, status: "running" as const, completedAt: null };
  return {
    task: runningTask,
    state: {
      ...state,
      taskQueue: updateTaskCollection(state.taskQueue, taskId, () => runningTask),
      currentBrief: {
        ...state.currentBrief,
        actionQueue: updateTaskCollection(state.currentBrief.actionQueue, taskId, () => runningTask)
      },
      intelStream: pushIntelStreamEntries(
        state.intelStream,
        createIntelStreamEntry("task_execution_started", `${runningTask.assignedAgent} started ${runningTask.title}`, startedAt)
      )
    }
  };
}

export function completeTaskExecution(state: ArchaiosCoreState, taskId: string, completedAt: string): TaskTransitionResult {
  const task = state.taskQueue.find((item) => item.id === taskId) || null;

  if (!task) {
    return { state, task: null };
  }

  const completedTask = {
    ...task,
    status: "completed" as const,
    completedAt
  };

  return {
    task: completedTask,
    state: {
      ...state,
      taskQueue: updateTaskCollection(state.taskQueue, taskId, () => completedTask),
      currentBrief: {
        ...state.currentBrief,
        actionQueue: updateTaskCollection(state.currentBrief.actionQueue, taskId, () => completedTask)
      },
      intelStream: pushIntelStreamEntries(
        state.intelStream,
        createIntelStreamEntry("task_execution_completed", `${completedTask.assignedAgent} completed ${completedTask.title}: ${completedTask.result}`, completedAt)
      )
    }
  };
}
