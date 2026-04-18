export const AGENT_TYPES = [
  "trend_scout",
  "opportunity_hunter",
  "experiment_runner",
  "launch_agent",
  "revenue_optimizer"
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];

export type AgentStatus =
  | "active"
  | "idle"
  | "running"
  | "scaling"
  | "inactive"
  | "error";

export type TaskType =
  | "trend_scan"
  | "opportunity_rank"
  | "experiment_plan"
  | "launch"
  | "metrics_update"
  | "optimize"
  | "full_venture_cycle";

export type AgentCapability =
  | "signal_detection"
  | "opportunity_scoring"
  | "experiment_design"
  | "launch_execution"
  | "pricing_optimization"
  | "revenue_scaling"
  | "performance_analysis";

export type AgentPerformanceRecord = {
  id: string;
  agent_type: AgentType;
  status: AgentStatus;
  performance_score: number;
  tasks_completed: number;
  revenue_generated: number;
  created_at: string;
};

export type CreateAgentConfig = {
  capabilities?: AgentCapability[];
  status?: AgentStatus;
  performanceScore?: number;
  tasksCompleted?: number;
  revenueGenerated?: number;
  metadata?: Record<string, unknown>;
};

export type SwarmAgent = {
  agent_id: string;
  agent_type: AgentType;
  capabilities: AgentCapability[];
  status: AgentStatus;
  performance_score: number;
  tasks_completed: number;
  revenue_generated: number;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export type SwarmExecutionStage = {
  task_type: Exclude<TaskType, "full_venture_cycle">;
  agent_type: AgentType;
  parallel?: boolean;
};

export type SwarmTaskContext = {
  task_type: TaskType;
  demandScore?: number;
  opportunityVolume?: number;
  conversionRate?: number;
  revenueSignal?: number;
  threshold?: number;
  payload?: Record<string, unknown>;
};

export type SwarmTaskResult = {
  agent_id?: string;
  agent_type: AgentType;
  task_type: TaskType;
  status: "success" | "warning" | "error";
  score?: number;
  revenue_impact?: number;
  summary: string;
  data: Record<string, unknown>;
};

export type OrchestratorExecutionPlan = {
  task_type: TaskType;
  selected_agents: SwarmAgent[];
  stages: SwarmExecutionStage[];
  parallel_groups: TaskType[][];
};

export type SwarmControlSnapshot = {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  topPerformers: SwarmAgent[];
  revenuePerAgent: Array<{
    agent_id: string;
    agent_type: AgentType;
    revenue_generated: number;
  }>;
  experimentsRunning: number;
  maxAgents: number;
  maxTasksPerAgent: number;
};
