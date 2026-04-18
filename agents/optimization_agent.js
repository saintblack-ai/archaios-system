export const optimizationAgent = {
  name: "optimization_agent",
  description: "Improves topic selection, content style, and posting schedule from performance metrics."
};

export function buildOptimizationPrompt(metrics, currentProfile) {
  return [
    "You are optimization_agent for AI Assassins.",
    "Adjust topic selection, content style, and posting schedule using recent metrics.",
    "Return markdown with sections: Topic Selection, Content Style, Posting Schedule, Rationale.",
    `Current profile: ${JSON.stringify(currentProfile)}`,
    `Metrics: ${JSON.stringify(metrics)}`
  ].join("\n");
}
