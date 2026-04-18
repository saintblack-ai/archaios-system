import { createAgentDefinition, createRun, slugify, updateAgentAfterRun } from "./shared";

export const contentCreatorAgent = createAgentDefinition({
  id: "content-creator-agent",
  name: "Content Creator Agent",
  mission: "Generate compliant daily promotional copy, long-form promos, quote snippets, hooks, and test variants.",
  currentTask: "Generate the initial 30-day promotional content engine.",
  queueCount: 30
});

const platforms = ["X", "Instagram", "Threads", "Facebook", "TikTok", "YouTube", "Blog", "Email"];

export function buildContentLibrary(books, seedLibrary) {
  const socialPosts = books.flatMap((book) =>
    Array.from({ length: 10 }, (_, index) => {
      const hook = book.hooks[index % book.hooks.length];
      const platform = platforms[index % 6];
      return {
        id: `short-${book.id}-${index + 1}`,
        bookId: book.id,
        type: "social-post",
        platform,
        status: "approval-ready",
        copy: `${hook} Read ${book.title} by ${book.author}. Apple Books link in campaign CTA.`,
        cta: `Open ${book.title} on Apple Books`,
        testVariant: index % 2 === 0 ? "mystery-hook" : "direct-benefit"
      };
    })
  );

  const longFormPromos = books.flatMap((book) =>
    Array.from({ length: 5 }, (_, index) => ({
      id: `long-${book.id}-${index + 1}`,
      bookId: book.id,
      type: "long-form-promo",
      title: `${book.title}: ${book.themes[index % book.themes.length]} reading path`,
      outline: [
        `Open with the problem: readers feel drawn to ${book.themes[index % book.themes.length]} but lack a map.`,
        `Introduce ${book.title} as a focused Saint Black guide.`,
        "Close with a direct Apple Books CTA and an invitation to join the reader list."
      ],
      status: "draft"
    }))
  );

  const quoteSnippets = books.flatMap((book) =>
    Array.from({ length: 10 }, (_, index) => ({
      id: `quote-${book.id}-${index + 1}`,
      bookId: book.id,
      type: "quote-insight",
      text: `${book.hooks[index % book.hooks.length]} (${book.title} insight ${index + 1})`,
      graphicPrompt: `Create a dark premium quote card for ${book.title} using ${book.themes[index % book.themes.length]} symbolism.`,
      status: "design-prompt-ready"
    }))
  );

  const audienceHooks = books.flatMap((book) =>
    Array.from({ length: 5 }, (_, index) => ({
      id: `hook-${book.id}-${index + 1}`,
      bookId: book.id,
      audience: book.audience[index % book.audience.length],
      hook: `For ${book.audience[index % book.audience.length]}: ${book.hooks[index % book.hooks.length]}`,
      status: "testing"
    }))
  );

  const videoPromoPrompts = books.flatMap((book) =>
    book.hooks.slice(0, 3).map((hook, index) => ({
      id: `video-${book.id}-${index + 1}`,
      bookId: book.id,
      prompt: `15-second vertical video: black/gold title card, line "${hook}", quick book-cover reveal, Apple Books CTA.`,
      status: "prompt-ready"
    }))
  );

  return {
    ...seedLibrary,
    generatedAt: new Date().toISOString(),
    socialPosts,
    longFormPromos,
    quoteSnippets,
    audienceHooks,
    videoPromoPrompts,
    contentFolders: books.map((book) => `content/${slugify(book.title)}`)
  };
}

export function runContentCreatorAgent(state) {
  const contentLibrary = buildContentLibrary(state.books, state.contentLibrary);
  const run = createRun(
    contentCreatorAgent,
    "Generate initial 30-day content engine",
    "completed",
    `Generated ${contentLibrary.socialPosts.length} short posts, ${contentLibrary.longFormPromos.length} long promos, and ${contentLibrary.quoteSnippets.length} quote snippets.`,
    { contentCounts: {
      socialPosts: contentLibrary.socialPosts.length,
      longFormPromos: contentLibrary.longFormPromos.length,
      quoteSnippets: contentLibrary.quoteSnippets.length,
      audienceHooks: contentLibrary.audienceHooks.length
    } }
  );

  return {
    run,
    agent: updateAgentAfterRun(contentCreatorAgent, run, "Prepare tomorrow's platform-specific post queue."),
    contentLibrary
  };
}
