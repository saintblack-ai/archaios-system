import { createAgentDefinition, createRun, estimateKpiModel, updateAgentAfterRun } from "./shared";

export const analyticsAgent = createAgentDefinition({
  id: "analytics-agent",
  name: "Analytics Agent",
  mission: "Track traffic, clicks, CTR, conversion proxies, content velocity, and performance by book/platform.",
  currentTask: "Refresh KPI projections and campaign leaderboard.",
  queueCount: 5
});

export function runAnalyticsAgent(state) {
  const kpis = estimateKpiModel(state);
  const leaderboard = [...state.campaigns].sort((a, b) => b.score - a.score).slice(0, 5);
  const run = createRun(analyticsAgent, "Refresh KPI model", "completed", `Projected annual trajectory is $${kpis.estimatedAnnualRevenue.toLocaleString()} against the $${kpis.annualRevenueTarget.toLocaleString()} target.`, { kpis, leaderboard });

  return {
    run,
    agent: updateAgentAfterRun(analyticsAgent, run, "Compare next 7 days against projection."),
    kpis,
    leaderboard
  };
}
