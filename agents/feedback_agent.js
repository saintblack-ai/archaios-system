export const feedbackAgent = {
  name: "feedback_agent",
  description: "Analyzes draft and queue outcomes and writes performance metrics."
};

export function buildFeedbackPrompt(metricsContext) {
  return [
    "You are feedback_agent for AI Assassins.",
    "Analyze content throughput and queue health.",
    "Return concise markdown with sections: Observations, Friction, Next Metric to Watch.",
    `Context: ${JSON.stringify(metricsContext)}`
  ].join("\n");
}
