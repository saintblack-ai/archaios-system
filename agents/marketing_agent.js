export const marketingAgent = {
  name: "marketing_agent",
  description: "Moves approved content drafts into the marketing queue without publishing."
};

export function buildMarketingPrompt(items) {
  return [
    "You are marketing_agent for AI Assassins.",
    "Create a weekly marketing queue from the following content drafts.",
    "Queue items for review only. Do not publish anything.",
    "Return markdown with sections: Weekly Theme, Channel Plan, Scheduling Notes.",
    `Draft summaries: ${JSON.stringify(items)}`
  ].join("\n");
}
