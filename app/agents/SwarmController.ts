import { AgentFactory } from "./AgentFactory";
import type {
  AgentPerformanceRecord,
  AgentType,
  SwarmAgent,
  SwarmControlSnapshot,
  SwarmTaskContext,
  TaskType
} from "./types";

export const MAX_AGENTS = 50;
export const MAX_TASKS_PER_AGENT = 10;

const TASK_AGENT_MAP: Record<Exclude<TaskType, "full_venture_cycle">, AgentType> = {
  trend_scan: "trend_scout",
  opportunity_rank: "opportunity_hunter",
  experiment_plan: "experiment_runner",
  launch: "launch_agent",
  metrics_update: "revenue_optimizer",
  optimize: "revenue_optimizer"
};

export class SwarmController {
  static async listAgents() {
    return AgentFactory.getRegistry();
  }

  static async selectBestAgents(taskType: Exclude<TaskType, "full_venture_cycle">, limit = 3) {
    const registry = await this.listAgents();
    const preferredType = TASK_AGENT_MAP[taskType];

    return registry
      .filter((agent) => agent.agent_type === preferredType && agent.status !== "inactive")
      .sort((left, right) => {
        const rightScore = right.performance_score + right.revenue_generated;
        const leftScore = left.performance_score + left.revenue_generated;
        return rightScore - leftScore;
      })
      .slice(0, limit);
  }

  static async assignTasks(taskType: Exclude<TaskType, "full_venture_cycle">, workload = 1) {
    const availableAgents = await this.selectBestAgents(taskType, Math.min(workload, MAX_TASKS_PER_AGENT));
    return availableAgents.map((agent, index) => ({
      task_slot: index + 1,
      task_type: taskType,
      agent_id: agent.agent_id,
      agent_type: agent.agent_type
    }));
  }

  static async balanceWorkload(context: SwarmTaskContext) {
    const totalAgents = (await this.listAgents()).length;
    const spawns: Promise<SwarmAgent[]>[] = [];

    if ((context.opportunityVolume ?? 0) >= 25 && totalAgents < MAX_AGENTS) {
      spawns.push(AgentFactory.createAgents("trend_scout", Math.min(3, MAX_AGENTS - totalAgents)));
    }

    if ((context.conversionRate ?? 0) >= 0.18 && totalAgents < MAX_AGENTS) {
      const capacity = Math.max(MAX_AGENTS - totalAgents - 3, 0);
      if (capacity > 0) {
        spawns.push(AgentFactory.createAgents("launch_agent", Math.min(2, capacity)));
      }
    }

    return (await Promise.all(spawns)).flat();
  }

  static async scaleSwarm() {
    const registry = await AgentFactory.getRegistry();
    const records: AgentPerformanceRecord[] = registry.map((agent) => ({
      id: agent.agent_id,
      agent_type: agent.agent_type,
      status: agent.status,
      performance_score: agent.performance_score,
      tasks_completed: agent.tasks_completed,
      revenue_generated: agent.revenue_generated,
      created_at: agent.created_at || new Date().toISOString()
    }));

    const existingCount = registry.length;
    const slotsRemaining = Math.max(MAX_AGENTS - existingCount, 0);
    const replicas = slotsRemaining > 0
      ? await AgentFactory.replicateHighPerformers(records, undefined, slotsRemaining)
      : [];
    const inactivated = await AgentFactory.markUnderperformersInactive(records);

    return {
      spawned: replicas,
      inactivated
    };
  }

  static async monitorAllAgents(): Promise<SwarmControlSnapshot> {
    const agents = await this.listAgents();
    const topPerformers = [...agents]
      .sort((left, right) => (right.performance_score + right.revenue_generated) - (left.performance_score + left.revenue_generated))
      .slice(0, 5);

    return {
      totalAgents: agents.length,
      activeAgents: agents.filter((agent) => agent.status === "active" || agent.status === "running" || agent.status === "scaling").length,
      inactiveAgents: agents.filter((agent) => agent.status === "inactive").length,
      topPerformers,
      revenuePerAgent: agents.map((agent) => ({
        agent_id: agent.agent_id,
        agent_type: agent.agent_type,
        revenue_generated: agent.revenue_generated
      })),
      experimentsRunning: agents.filter((agent) => agent.agent_type === "experiment_runner" && agent.status === "running").length,
      maxAgents: MAX_AGENTS,
      maxTasksPerAgent: MAX_TASKS_PER_AGENT
    };
  }
}
