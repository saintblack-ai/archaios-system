import crypto from "node:crypto";
import { assertValidEvent } from "./validateEvent.js";

function clampConfidence(value, fallback = 0.5) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(0, Math.min(1, number));
}

function sanitizeText(value, fallback = "") {
  return String(value || fallback)
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 4000);
}

export function hashPayload(payload) {
  return crypto.createHash("sha256").update(JSON.stringify(payload || {})).digest("hex");
}

export function buildEventId(sourceKey, externalId, fallbackPayload) {
  const stable = externalId || hashPayload(fallbackPayload).slice(0, 24);
  return `${sourceKey}:${stable}`.toLowerCase().replace(/[^a-z0-9:_-]+/g, "-").slice(0, 180);
}

export function normalizeEvent(input) {
  const now = new Date().toISOString();
  const sourceKey = sanitizeText(input.source_key || input.sourceKey || "unknown-source", "unknown-source");
  const rawPayload = input.raw_payload ?? input.rawPayload ?? {};
  const event = {
    id: buildEventId(sourceKey, input.external_id || input.externalId, rawPayload),
    headline: sanitizeText(input.headline || input.title, "Untitled intelligence event"),
    summary: sanitizeText(input.summary, "No summary provided by source."),
    category: input.category,
    severity: input.severity || "informational",
    confidence: clampConfidence(input.confidence),
    status: input.status || "cached",
    source_name: sanitizeText(input.source_name || input.sourceName, sourceKey),
    source_url: input.source_url || input.sourceUrl || null,
    source_type: sanitizeText(input.source_type || input.sourceType, "public"),
    published_at: input.published_at || input.publishedAt || null,
    ingested_at: input.ingested_at || input.ingestedAt || now,
    latitude: input.latitude === undefined || input.latitude === null ? null : Number(input.latitude),
    longitude: input.longitude === undefined || input.longitude === null ? null : Number(input.longitude),
    country_code: input.country_code || input.countryCode || null,
    region: sanitizeText(input.region || "", ""),
    tags: Array.isArray(input.tags) ? input.tags.map((tag) => sanitizeText(tag)).filter(Boolean).slice(0, 20) : [],
    entities: Array.isArray(input.entities) ? input.entities.map((entity) => sanitizeText(entity)).filter(Boolean).slice(0, 30) : [],
    related_event_ids: Array.isArray(input.related_event_ids || input.relatedEventIds)
      ? (input.related_event_ids || input.relatedEventIds).filter(Boolean)
      : [],
    research_mission_id: input.research_mission_id || input.researchMissionId || null,
    analysis: sanitizeText(input.analysis || "", ""),
    recommended_actions: Array.isArray(input.recommended_actions || input.recommendedActions)
      ? (input.recommended_actions || input.recommendedActions).map((action) => sanitizeText(action)).filter(Boolean).slice(0, 8)
      : [],
    is_live: Boolean(input.is_live ?? input.isLive),
    is_verified: Boolean(input.is_verified ?? input.isVerified),
    raw_payload_hash: input.raw_payload_hash || input.rawPayloadHash || hashPayload(rawPayload)
  };

  return assertValidEvent(event);
}
