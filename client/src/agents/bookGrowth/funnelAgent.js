import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const funnelAgent = createAgentDefinition({
  id: "funnel-agent",
  name: "Landing Page / Funnel Agent",
  mission: "Design book promo pages, CTA routing, click tracking assumptions, and landing page variants.",
  currentTask: "Build funnel map and landing page variants.",
  queueCount: 8
});

export function runFunnelAgent(state) {
  const funnelMap = state.books.map((book) => ({
    bookId: book.id,
    landingSlug: `/books/${book.id}`,
    requiredSections: ["cover", "summary", "reader promise", "themes", "reviews placeholder", "author section", "Apple Books CTA"],
    trackingPlan: [`source=${book.id}-social`, `campaign=${book.currentCampaignFocus}`, "medium=organic"],
    primaryCta: `Read ${book.title} on Apple Books`
  }));
  const run = createRun(funnelAgent, "Create book funnel map", "completed", "Mapped three landing pages with CTA and tracking requirements.", { funnelMap });

  return {
    run,
    agent: updateAgentAfterRun(funnelAgent, run, "Add live cover art and real Apple Books URLs."),
    funnelMap
  };
}
