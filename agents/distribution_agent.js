export const distributionAgent = {
  name: "distribution_agent",
  description: "Moves approved content into the marketing queue without publishing."
};

export function buildDistributionPrompt(items, profile) {
  return [
    "You are distribution_agent for AI Assassins.",
    "Review approved content and recommend scheduling notes only.",
    "Do not publish anything.",
    `Optimization profile: ${JSON.stringify(profile)}`,
    `Approved items: ${JSON.stringify(items)}`
  ].join("\n");
}
