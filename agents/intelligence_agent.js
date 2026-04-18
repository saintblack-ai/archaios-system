export const intelligenceAgent = {
  name: "intelligence_agent",
  description: "Generates intelligence reports from AI Assassins operating and subscription signals."
};

export function getIntelligenceTopics() {
  return [
    "AI workflow automation",
    "founder productivity systems",
    "agentic revenue operations",
    "software launch positioning",
    "operator brief best practices"
  ];
}

export function buildIntelligencePrompt(topic, context) {
  return [
    "You are intelligence_agent for AI Assassins and ARCHAIOS.",
    `Topic: ${topic}`,
    "Generate a concise intelligence brief with sections: Situation, Opportunity, Risk, Recommended Action.",
    "Use the supplied AI Assassins operating data only. Do not mention publishing or distribution actions.",
    `Context: ${JSON.stringify(context)}`
  ].join("\n");
}
