import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const socialDistributionAgent = createAgentDefinition({
  id: "social-distribution-agent",
  name: "Social Distribution Agent",
  mission: "Prepare platform-specific approval queues and publishing calendars without auto-posting.",
  currentTask: "Build this week's post queue from the content library.",
  queueCount: 21
});

export function runSocialDistributionAgent(state) {
  const posts = state.contentLibrary.socialPosts || [];
  const queue = posts.slice(0, 21).map((post, index) => ({
    ...post,
    scheduledDay: `Day ${Math.floor(index / 3) + 1}`,
    approvalRequired: true
  }));
  const run = createRun(socialDistributionAgent, "Build approval-ready publishing queue", "completed", `Prepared ${queue.length} posts for manual approval.`, { queue });

  return {
    run,
    agent: updateAgentAfterRun(socialDistributionAgent, run, "Await approval before scheduling or exporting."),
    publishingQueue: queue
  };
}
