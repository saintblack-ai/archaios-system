export const ARCHIVIST_ITEM_TYPES = new Set([
  "research",
  "mission_log",
  "document",
  "agent_output",
  "decision",
  "timeline_event"
]);

const MAX_TITLE_LENGTH = 240;
const MAX_BODY_LENGTH = 50000;
const MAX_TAGS = 20;

function cleanText(value, maxLength) {
  return String(value || "").trim().slice(0, maxLength);
}

export function normalizeArchivistTags(value) {
  const input = Array.isArray(value) ? value : [];
  const tags = input
    .map((tag) => String(tag || "").trim().toLowerCase())
    .map((tag) => tag.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter((tag) => tag.length > 0 && tag.length <= 64);

  return [...new Set(tags)].slice(0, MAX_TAGS);
}

export function normalizeArchivistItemInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid archivist item payload");
  }

  const itemType = cleanText(input.item_type || "research", 40);
  const title = cleanText(input.title, MAX_TITLE_LENGTH);
  const body = cleanText(input.body, MAX_BODY_LENGTH);
  const sourceRef = cleanText(input.source_ref, 2048);

  if (!ARCHIVIST_ITEM_TYPES.has(itemType)) {
    throw new Error("Invalid archivist item type");
  }
  if (!title) {
    throw new Error("Research title is required");
  }
  if (!body && !sourceRef) {
    throw new Error("Research body or source_ref is required");
  }

  return {
    item_type: itemType,
    title,
    body,
    source_type: cleanText(input.source_type || "manual", 40) || "manual",
    source_ref: sourceRef || null,
    category: cleanText(input.category || "research", 120) || "research",
    tags: normalizeArchivistTags(input.tags),
    importance: cleanText(input.importance || "medium", 20) || "medium"
  };
}

export function isArchivistItemId(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
}

export function buildArchivistSearchPath(userId, searchParams) {
  const params = new URLSearchParams({
    select: "id,item_type,title,body,summary,source_type,source_ref,category,tags,importance,status,created_at,updated_at",
    owner_id: `eq.${userId}`,
    order: "updated_at.desc",
    limit: String(Math.min(Math.max(Number(searchParams.get("limit") || 25), 1), 100))
  });
  const itemType = cleanText(searchParams.get("item_type"), 40);
  const category = cleanText(searchParams.get("category"), 120);
  const tag = normalizeArchivistTags([searchParams.get("tag")])[0];
  const query = cleanText(searchParams.get("q"), 80).replace(/[^a-zA-Z0-9 -]/g, "").trim();

  if (ARCHIVIST_ITEM_TYPES.has(itemType)) {
    params.set("item_type", `eq.${itemType}`);
  }
  if (category) {
    params.set("category", `eq.${category}`);
  }
  if (tag) {
    params.set("tags", `cs.{${tag}}`);
  }
  if (query) {
    params.set("or", `(title.ilike.*${query}*,body.ilike.*${query}*,summary.ilike.*${query}*)`);
  }

  return `archivist_items?${params.toString()}`;
}

export function buildArchivistSummaryPrompt(item) {
  const body = cleanText(item?.body, 12000);
  const source = cleanText(item?.source_ref, 1024);

  return [
    "You are ARCHIVIST, the institutional-memory agent for Archaios.",
    "Write a factual, concise research summary in 3 to 5 sentences.",
    "Preserve uncertainty. Do not invent evidence, conclusions, or citations.",
    `Title: ${cleanText(item?.title, MAX_TITLE_LENGTH)}`,
    `Category: ${cleanText(item?.category, 120)}`,
    `Tags: ${normalizeArchivistTags(item?.tags).join(", ") || "none"}`,
    source ? `Source reference: ${source}` : "",
    `Research body:\n${body || "No body supplied; summarize only the available metadata."}`
  ].filter(Boolean).join("\n\n");
}
