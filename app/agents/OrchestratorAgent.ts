import { supabaseAdmin } from "../lib/supabaseAdmin";
import { AgentFactory } from "./AgentFactory";
import { SwarmController } from "./SwarmController";
import { subagents } from "./subagents";
import type {
  AgentType,
  OrchestratorExecutionPlan,
  SwarmExecutionStage,
  SwarmTaskContext,
  SwarmTaskResult,
  TaskType
} from "./types";

const PIPELINE: Exclude<TaskType, "full_venture_cycle">[] = [
  "trend_scan",
  "opportunity_rank",
  "experiment_plan",
  "launch",
  "metrics_update",
  "optimize"
];

function pipelineForTask(taskType: TaskType) {
  return taskType === "full_venture_cycle" ? PIPELINE : [taskType];
}

async function insertSwarmLog(category: string, status: string, result: Record<string, unknown>) {
  await supabaseAdmin.from("agent_logs").insert({
    agent_name: "orchestrator_agent",
    category,
    status,
    trigger: "swarm_runtime",
    result,
    output: result
  });
}

export class OrchestratorAgent {
  static async buildExecutionPlan(context: SwarmTaskContext): Promise<OrchestratorExecutionPlan> {
    const stages: SwarmExecutionStage[] = pipelineForTask(context.task_type).map((taskType) => ({
      task_type: taskType,
      agent_type: (
        taskType === "trend_scan"
          ? "trend_scout"
          : taskType === "opportunity_rank"
            ? "opportunity_hunter"
            : taskType === "experiment_plan"
              ? "experiment_runner"
              : taskType === "launch"
                ? "launch_agent"
                : "revenue_optimizer"
      ) as AgentType,
      parallel: taskType === "trend_scan" || taskType === "launch" || taskType === "metrics_update"
    }));

    const selectedAgents = (
      await Promise.all(
        stages.map((stage) => SwarmController.selectBestAgents(stage.task_type, stage.parallel ? 2 : 1))
      )
    ).flat();

    return {
      task_type: context.task_type,
      selected_agents: selectedAgents,
      stages,
      parallel_groups: [["trend_scan"], ["launch", "metrics_update"]]
    };
  }

  static async ensureBaselineSwarm() {
    const registry = await AgentFactory.getRegistry();
    if (registry.length > 0) {
      return registry;
    }

    await Promise.all([
      AgentFactory.createAgent("trend_scout"),
      AgentFactory.createAgent("opportunity_hunter"),
      AgentFactory.createAgent("experiment_runner"),
      AgentFactory.createAgent("launch_agent"),
      AgentFactory.createAgent("revenue_optimizer")
    ]);

    return AgentFactory.getRegistry();
  }

  static async execute(context: SwarmTaskContext) {
    await this.ensureBaselineSwarm();
    const plan = await this.buildExecutionPlan(context);
    await insertSwarmLog("orchestrator_start", "running", {
      task_type: context.task_type,
      selected_agents: plan.selected_agents.map((agent) => agent.agent_id)
    });

    await SwarmController.balanceWorkload(context);

    const results: SwarmTaskResult[] = [];
    const runStage = async (
      taskType: Exclude<TaskType, "full_venture_cycle">
    ): Promise<SwarmTaskResult | null> => {
      const stage = plan.stages.find((entry) => entry.task_type === taskType);
      if (!stage) {
        return null;
      }

      const executor = subagents[stage.task_type];
      const [assignedAgent] = await SwarmController.assignTasks(stage.task_type, 1);

      await insertSwarmLog("subagent_called", "running", {
        task_type: stage.task_type,
        agent_type: stage.agent_type,
        agent_id: assignedAgent?.agent_id ?? null
      });

      const stageResult = await executor(context);
      const enrichedResult = {
        ...stageResult,
        agent_id: assignedAgent?.agent_id ?? undefined
      };

      await insertSwarmLog("subagent_completed", enrichedResult.status, {
        task_type: stage.task_type,
        agent_type: stage.agent_type,
        agent_id: enrichedResult.agent_id ?? null,
        summary: enrichedResult.summary,
        data: enrichedResult.data
      });

      return enrichedResult;
    };

    for (const taskType of ["trend_scan", "opportunity_rank", "experiment_plan"] as const) {
      const result = await runStage(taskType);
      if (result) {
        results.push(result);
      }
    }

    const parallelResults = await Promise.all([
      runStage("launch"),
      runStage("metrics_update")
    ]);
    results.push(...parallelResults.filter((result): result is SwarmTaskResult => result !== null));

    const optimizeResult = await runStage("optimize");
    if (optimizeResult) {
      results.push(optimizeResult);
    }

    const scaleResult = await SwarmController.scaleSwarm();
    const snapshot = await SwarmController.monitorAllAgents();

    await insertSwarmLog("pipeline_completed", "success", {
      task_type: context.task_type,
      stages_completed: results.length,
      agents_spawned: scaleResult.spawned.length,
      agents_inactivated: scaleResult.inactivated.length
    });

    return {
      plan,
      results,
      control: snapshot,
      scaling: {
        spawned: scaleResult.spawned,
        inactivated: scaleResult.inactivated
      }
    };
  }
}
