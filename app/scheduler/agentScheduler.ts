import { OrchestratorAgent } from "../agents/OrchestratorAgent";
import type { SwarmTaskContext, TaskType } from "../agents/types";

export const CONTINUOUS_LOOP_MINUTES = {
  min: 5,
  max: 15
} as const;

export async function enqueueSwarmTask(taskType: TaskType, payload: Record<string, unknown> = {}) {
  const context: SwarmTaskContext = {
    task_type: taskType,
    demandScore: Number(payload.demandScore ?? 55),
    opportunityVolume: Number(payload.opportunityVolume ?? 20),
    conversionRate: Number(payload.conversionRate ?? 0.1),
    revenueSignal: Number(payload.revenueSignal ?? 500),
    payload
  };

  return OrchestratorAgent.execute(context);
}

export async function runContinuousLoop(payload: Record<string, unknown> = {}) {
  return enqueueSwarmTask("full_venture_cycle", payload);
}
