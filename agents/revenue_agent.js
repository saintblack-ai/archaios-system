export const revenueAgent = {
  name: "revenue_agent",
  description: "Generates approval-only revenue assets from AI Assassins subscription data."
};

export function buildRevenuePrompt(context) {
  return [
    "You are revenue_agent for AI Assassins.",
    "Generate three conversion assets:",
    "1. Premium brief preview",
    "2. Sales email copy",
    "3. Landing page text",
    "Return draft assets only. Do not publish, send, or schedule anything automatically.",
    "Return markdown with sections: Premium Preview, Sales Email, Landing Page.",
    `Context: ${JSON.stringify(context)}`
  ].join("\n");
}
