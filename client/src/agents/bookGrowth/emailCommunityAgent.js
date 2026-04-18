import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const emailCommunityAgent = createAgentDefinition({
  id: "email-community-agent",
  name: "Email / Community Agent",
  mission: "Create reader journeys, newsletter sequences, lead magnet ideas, and review-request flows.",
  currentTask: "Draft reader journey and lead magnet plan.",
  queueCount: 7
});

export function runEmailCommunityAgent(state) {
  const leadMagnets = [
    "Saint Black Reading Path Quiz",
    "Seven-Day Holy Discipline Reflection Sheet",
    "Cosmic Research Starter Checklist",
    "Eden Symbolism Journal Prompts"
  ];
  const journey = ["Discovery post", "Landing page", "Email opt-in", "Book CTA", "Reader follow-up", "Review request", "Cross-book recommendation"];
  const run = createRun(emailCommunityAgent, "Create reader journey and email plan", "completed", "Prepared lead magnet ideas and reader journey.", { leadMagnets, journey });

  return {
    run,
    agent: updateAgentAfterRun(emailCommunityAgent, run, "Convert best lead magnet into a downloadable asset."),
    leadMagnets,
    journey
  };
}
