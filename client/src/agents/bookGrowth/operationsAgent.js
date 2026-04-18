import { createAgentDefinition, createRun, SCHEDULE, updateAgentAfterRun } from "./shared";

export const operationsAgent = createAgentDefinition({
  id: "operations-agent",
  name: "Operations Agent",
  mission: "Monitor schedules, logs, retries, agent status, and execution health.",
  currentTask: "Keep the local Book Growth OS execution queue visible and reviewable.",
  queueCount: 10
});

export function runOperationsAgent(state) {
  const health = {
    agentsConfigured: state.agents.length,
    activeCampaigns: state.campaigns.filter((campaign) => campaign.status === "active").length,
    schedule: SCHEDULE,
    automationMode: state.automationSettings?.mode || "approval-first"
  };
  const run = createRun(operationsAgent, "Refresh operations health", "completed", "Operations health refreshed. Automation remains approval-first.", { health });

  return {
    run,
    agent: updateAgentAfterRun(operationsAgent, run, "Watch for failed runs and stale queues."),
    health
  };
}
