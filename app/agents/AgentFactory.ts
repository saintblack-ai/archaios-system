import { randomUUID } from "crypto";
import { supabaseAdmin } from "../lib/supabaseAdmin";
import {
  type AgentCapability,
  type AgentPerformanceRecord,
  type AgentType,
  type CreateAgentConfig,
  type SwarmAgent
} from "./types";

const TEMPLATE_CAPABILITIES: Record<AgentType, AgentCapability[]> = {
  trend_scout: ["signal_detection", "performance_analysis"],
  opportunity_hunter: ["opportunity_scoring", "performance_analysis"],
  experiment_runner: ["experiment_design", "performance_analysis"],
  launch_agent: ["launch_execution", "performance_analysis"],
  revenue_optimizer: ["pricing_optimization", "revenue_scaling", "performance_analysis"]
};

const DEFAULT_REPLICATION_THRESHOLD = 80;
const DEFAULT_REVENUE_THRESHOLD = 1000;
const HIGH_REVENUE_BONUS = 2;

export class AgentFactory {
  static templateCapabilities(agentType: AgentType) {
    return TEMPLATE_CAPABILITIES[agentType];
  }

  static async createAgent(type: AgentType, config: CreateAgentConfig = {}): Promise<SwarmAgent> {
    const agent = {
      id: randomUUID(),
      agent_type: type,
      status: config.status ?? "active",
      performance_score: config.performanceScore ?? 0,
      tasks_completed: config.tasksCompleted ?? 0,
      revenue_generated: config.revenueGenerated ?? 0,
      metadata: {
        template: `${type}_template`,
        specialization: type,
        capabilities: config.capabilities ?? this.templateCapabilities(type),
        ...(config.metadata || {})
      }
    };

    const { data, error } = await supabaseAdmin
      .from("agents_registry")
      .insert(agent)
      .select("id, agent_type, status, performance_score, tasks_completed, revenue_generated, created_at, metadata")
      .single();

    if (error) {
      throw new Error(`Unable to create agent: ${error.message}`);
    }

    return {
      agent_id: data.id,
      agent_type: data.agent_type,
      capabilities: ((data.metadata as Record<string, unknown> | null)?.capabilities as AgentCapability[]) ?? this.templateCapabilities(type),
      status: data.status,
      performance_score: data.performance_score,
      tasks_completed: data.tasks_completed,
      revenue_generated: data.revenue_generated,
      metadata: (data.metadata as Record<string, unknown> | null) ?? {},
      created_at: data.created_at
    };
  }

  static async createAgents(type: AgentType, count: number, config: CreateAgentConfig = {}) {
    return Promise.all(Array.from({ length: count }, () => this.createAgent(type, config)));
  }

  static async getRegistry() {
    const { data, error } = await supabaseAdmin
      .from("agents_registry")
      .select("id, agent_type, status, performance_score, tasks_completed, revenue_generated, created_at, metadata")
      .order("performance_score", { ascending: false });

    if (error) {
      throw new Error(`Unable to load agent registry: ${error.message}`);
    }

    return (data || []).map((row) => ({
      agent_id: row.id,
      agent_type: row.agent_type,
      capabilities: ((row.metadata as Record<string, unknown> | null)?.capabilities as AgentCapability[]) ?? this.templateCapabilities(row.agent_type),
      status: row.status,
      performance_score: row.performance_score,
      tasks_completed: row.tasks_completed,
      revenue_generated: row.revenue_generated,
      metadata: (row.metadata as Record<string, unknown> | null) ?? {},
      created_at: row.created_at
    })) satisfies SwarmAgent[];
  }

  static async replicateHighPerformers(
    records: AgentPerformanceRecord[],
    threshold = DEFAULT_REPLICATION_THRESHOLD,
    maxCreates = Number.POSITIVE_INFINITY
  ) {
    const spawns = records
      .filter((agent) => agent.performance_score > threshold)
      .flatMap((agent) => Array.from({ length: 2 }, () => ({ type: agent.agent_type, parentId: agent.id })));

    const revenueBoosts = records
      .filter((agent) => agent.revenue_generated >= DEFAULT_REVENUE_THRESHOLD)
      .flatMap((agent) => Array.from({ length: HIGH_REVENUE_BONUS }, () => ({ type: agent.agent_type, parentId: agent.id })));

    const created = await Promise.all(
      [...spawns, ...revenueBoosts].slice(0, maxCreates).map((entry) =>
        this.createAgent(entry.type, {
          metadata: {
            parent_agent_id: entry.parentId,
            replication_reason: "performance_or_revenue"
          }
        })
      )
    );

    return created;
  }

  static async markUnderperformersInactive(records: AgentPerformanceRecord[], threshold = 25) {
    const underperformers = records.filter((agent) => agent.performance_score < threshold || agent.status === "error");
    if (underperformers.length === 0) {
      return [];
    }

    const ids = underperformers.map((agent) => agent.id);
    const { data, error } = await supabaseAdmin
      .from("agents_registry")
      .update({ status: "inactive" })
      .in("id", ids)
      .select("id, agent_type, status, performance_score, tasks_completed, revenue_generated, created_at, metadata");

    if (error) {
      throw new Error(`Unable to deactivate underperforming agents: ${error.message}`);
    }

    return (data || []).map((row) => ({
      agent_id: row.id,
      agent_type: row.agent_type,
      capabilities: ((row.metadata as Record<string, unknown> | null)?.capabilities as AgentCapability[]) ?? this.templateCapabilities(row.agent_type),
      status: row.status,
      performance_score: row.performance_score,
      tasks_completed: row.tasks_completed,
      revenue_generated: row.revenue_generated,
      metadata: (row.metadata as Record<string, unknown> | null) ?? {},
      created_at: row.created_at
    })) satisfies SwarmAgent[];
  }
}
