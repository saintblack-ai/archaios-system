import { createAgentDefinition, createRun, updateAgentAfterRun } from "./shared";

export const brandStoryAgent = createAgentDefinition({
  id: "brand-story-agent",
  name: "Brand Story Agent",
  mission: "Extract themes, quotes, hooks, and audience-specific story angles from the Saint Black book library.",
  currentTask: "Create positioning angles for spiritual, literary, research, and mystery audiences.",
  queueCount: 9
});

export function runBrandStoryAgent(state) {
  const angles = state.books.flatMap((book) =>
    book.themes.slice(0, 4).map((theme) => ({
      bookId: book.id,
      bookTitle: book.title,
      theme,
      angle: `${book.title} speaks to ${theme} through the Saint Black lens: disciplined, mysterious, and conviction-led.`,
      audience: book.audience[0]
    }))
  );
  const run = createRun(brandStoryAgent, "Generate audience positioning angles", "completed", `Built ${angles.length} positioning angles.`, { angles });

  return {
    run,
    agent: updateAgentAfterRun(brandStoryAgent, run, "Turn top themes into quote card prompts."),
    angles
  };
}
