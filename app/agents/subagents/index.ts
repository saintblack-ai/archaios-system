import { RevenueOptimizerAgent } from "../RevenueOptimizerAgent";
import type { AgentType, SwarmTaskContext, SwarmTaskResult, TaskType } from "../types";

type SubagentExecutor = (context: SwarmTaskContext) => Promise<SwarmTaskResult>;

function normalizeScore(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)));
}

async function trendScanner(context: SwarmTaskContext): Promise<SwarmTaskResult> {
  const demandScore = Number(context.demandScore ?? 55);
  const opportunityVolume = Number(context.opportunityVolume ?? 20);

  return {
    agent_type: "trend_scout",
    task_type: "trend_scan",
    status: "success",
    score: normalizeScore(demandScore + opportunityVolume),
    summary: "Trend scout mapped revenue-adjacent demand signals.",
    data: {
      themes: ["creator monetization", "automated product launches", "pricing optimization"],
      demand_score: demandScore,
      opportunity_volume: opportunityVolume,
      recommendation: demandScore > 60 ? "increase scout coverage" : "maintain watchlist"
    }
  };
}

async function opportunityHunter(context: SwarmTaskContext): Promise<SwarmTaskResult> {
  const demandScore = Number(context.demandScore ?? 55);
  const revenueSignal = Number(context.revenueSignal ?? 0);
  const score = normalizeScore((demandScore * 0.6) + (revenueSignal / 50));

  return {
    agent_type: "opportunity_hunter",
    task_type: "opportunity_rank",
    status: "success",
    score,
    summary: "Opportunity hunter ranked the highest-conviction venture opportunities.",
    data: {
      ranked_opportunities: [
        { name: "conversion-focused AI funnel", score },
        { name: "premium launch package", score: normalizeScore(score - 7) },
        { name: "subscription upsell experiment", score: normalizeScore(score - 12) }
      ]
    }
  };
}

async function experimentRunner(context: SwarmTaskContext): Promise<SwarmTaskResult> {
  const score = normalizeScore((Number(context.demandScore ?? 50) * 0.5) + (Number(context.conversionRate ?? 0.1) * 120));

  return {
    agent_type: "experiment_runner",
    task_type: "experiment_plan",
    status: "success",
    score,
    summary: "Experiment runner prepared the next validation cycle.",
    data: {
      experiments: [
        "headline and offer test",
        "pricing elasticity test",
        "channel-specific launch split test"
      ],
      target_metric: "revenue per launch",
      max_tasks_per_agent: 10
    }
  };
}

async function launchAgent(context: SwarmTaskContext): Promise<SwarmTaskResult> {
  const conversionRate = Number(context.conversionRate ?? 0.1);

  return {
    agent_type: "launch_agent",
    task_type: "launch",
    status: "success",
    score: normalizeScore(conversionRate * 300),
    revenue_impact: Math.round((Number(context.revenueSignal ?? 500)) * Math.max(conversionRate, 0.05)),
    summary: "Launch agent assembled the campaign push for the top opportunity.",
    data: {
      channels: ["email", "landing_page", "social"],
      exposure_strategy: conversionRate > 0.18 ? "scale winners" : "contained rollout",
      launch_window_minutes: 15
    }
  };
}

async function metricsAgent(context: SwarmTaskContext): Promise<SwarmTaskResult> {
  const revenueSignal = Number(context.revenueSignal ?? 0);
  const conversionRate = Number(context.conversionRate ?? 0.1);

  return {
    agent_type: "revenue_optimizer",
    task_type: "metrics_update",
    status: "success",
    score: normalizeScore((revenueSignal / 20) + (conversionRate * 120)),
    summary: "Metrics stage captured the latest venture performance snapshot.",
    data: {
      revenue_generated: revenueSignal,
      conversion_rate: conversionRate,
      experiments_running: Number(context.payload?.experiments_running ?? 0),
      next_action: revenueSignal > 2000 ? "scale" : "iterate"
    }
  };
}

export const subagents: Record<Exclude<TaskType, "full_venture_cycle">, SubagentExecutor> = {
  trend_scan: trendScanner,
  opportunity_rank: opportunityHunter,
  experiment_plan: experimentRunner,
  launch: launchAgent,
  metrics_update: metricsAgent,
  optimize: RevenueOptimizerAgent.execute
};

export const subagentTypeMap: Record<Exclude<TaskType, "full_venture_cycle">, AgentType> = {
  trend_scan: "trend_scout",
  opportunity_rank: "opportunity_hunter",
  experiment_plan: "experiment_runner",
  launch: "launch_agent",
  metrics_update: "revenue_optimizer",
  optimize: "revenue_optimizer"
};
