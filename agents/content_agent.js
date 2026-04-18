export const contentAgent = {
  name: "content_agent",
  description: "Turns intelligence reports into approval-only content drafts."
};

export function buildContentPrompt(brief) {
  return [
    "You are content_agent for AI Assassins.",
    "Using the intelligence brief below, create three artifacts:",
    "1. Tweet draft",
    "2. Blog post draft",
    "3. Email newsletter draft",
    "All outputs must remain in draft form and require human approval before any publishing action.",
    "Return markdown with sections: Tweet, Blog, Newsletter.",
    `Brief: ${brief}`
  ].join("\n");
}
