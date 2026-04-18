import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const strategyCommander = createAgentDefinition({
  id: "strategy-commander",
  name: "Strategy Commander",
  mission: "Set weekly goals, allocate focus by book, and convert performance signals into action plans.",
  currentTask: "Rank book focus and assign weekly campaign priorities.",
  queueCount: 6
});

export function runStrategyCommander(state) {
  const rankedBooks = [...state.books].sort((a, b) => a.campaignPriority - b.campaignPriority);
  const topBook = rankedBooks[0];
  const actions = rankedBooks.map((book, index) => ({
    bookId: book.id,
    bookTitle: book.title,
    focus: book.currentCampaignFocus,
    weeklyGoal: index === 0 ? "Publish daily CTA content and test 3 hooks." : "Publish 3 support posts and collect audience response.",
    priority: index + 1
  }));
  const recommendation = `Lead with ${topBook.title}; route supporting content from the other books into the cross-book Saint Black Library campaign.`;
  const run = createRun(strategyCommander, "Weekly growth command plan", "completed", recommendation, { actions });

  return {
    run,
    agent: updateAgentAfterRun(strategyCommander, run, "Monitor campaign scores and rebalance focus."),
    recommendations: [
      recommendation,
      "Use one Apple Books CTA per post. Avoid vague multi-link CTAs until click tracking exists.",
      "Treat the first 30 days as signal collection: hooks, saves, replies, page clicks, and email opt-ins."
    ]
  };
}
