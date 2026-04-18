import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const seoMetadataAgent = createAgentDefinition({
  id: "seo-metadata-agent",
  name: "SEO + Metadata Agent",
  mission: "Improve Apple Books listing discoverability through descriptions, keyword clusters, categories, and audience tags.",
  currentTask: "Draft metadata recommendations for each book.",
  queueCount: 12
});

export function runSeoMetadataAgent(state) {
  const metadataRecommendations = state.books.map((book) => ({
    bookId: book.id,
    title: book.title,
    keywordClusters: [
      book.themes.join(", "),
      book.audience.join(", "),
      `${book.title}, Saint Black, spiritual intelligence`
    ],
    descriptionUpgrade: `${book.description} Position the listing around transformation, mystery, and a clear reader outcome. Add direct language about who the book is for and why now.`,
    categoryIdeas: book.id === "pleiadian-project" ? ["Body, Mind & Spirit", "Reference", "Spirituality"] : ["Religion & Spirituality", "Self-Improvement", "Literature"],
    audienceTags: book.audience
  }));
  const run = createRun(seoMetadataAgent, "Create Apple Books metadata recommendations", "completed", "Prepared metadata and keyword clusters for all three books.", { metadataRecommendations });

  return {
    run,
    agent: updateAgentAfterRun(seoMetadataAgent, run, "Review Apple Books listing copy after live links are added."),
    metadataRecommendations
  };
}
