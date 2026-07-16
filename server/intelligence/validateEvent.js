import { EVENT_CATEGORIES, EVENT_SEVERITIES, EVENT_STATUSES } from "./eventSchema.js";

function isFiniteCoordinate(value, min, max) {
  return value === null || value === undefined || (Number.isFinite(Number(value)) && Number(value) >= min && Number(value) <= max);
}

function isHttpUrl(value) {
  if (!value) {
    return true;
  }
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateEvent(event) {
  const errors = [];

  if (!event || typeof event !== "object") {
    return { ok: false, errors: ["event_object_required"] };
  }

  if (!event.id || typeof event.id !== "string") errors.push("id_required");
  if (!event.headline || typeof event.headline !== "string") errors.push("headline_required");
  if (!event.summary || typeof event.summary !== "string") errors.push("summary_required");
  if (!EVENT_CATEGORIES.includes(event.category)) errors.push("invalid_category");
  if (!EVENT_SEVERITIES.includes(event.severity)) errors.push("invalid_severity");
  if (!EVENT_STATUSES.includes(event.status)) errors.push("invalid_status");
  if (!Number.isFinite(Number(event.confidence)) || Number(event.confidence) < 0 || Number(event.confidence) > 1) {
    errors.push("confidence_out_of_range");
  }
  if (!event.source_name || typeof event.source_name !== "string") errors.push("source_name_required");
  if (!isHttpUrl(event.source_url)) errors.push("invalid_source_url");
  if (!event.source_type || typeof event.source_type !== "string") errors.push("source_type_required");
  if (!event.ingested_at || Number.isNaN(Date.parse(event.ingested_at))) errors.push("invalid_ingested_at");
  if (event.published_at && Number.isNaN(Date.parse(event.published_at))) errors.push("invalid_published_at");
  if (!isFiniteCoordinate(event.latitude, -90, 90)) errors.push("invalid_latitude");
  if (!isFiniteCoordinate(event.longitude, -180, 180)) errors.push("invalid_longitude");
  if (!Array.isArray(event.tags)) errors.push("tags_must_be_array");
  if (!Array.isArray(event.entities)) errors.push("entities_must_be_array");
  if (!Array.isArray(event.related_event_ids)) errors.push("related_event_ids_must_be_array");
  if (!Array.isArray(event.recommended_actions)) errors.push("recommended_actions_must_be_array");
  if (typeof event.is_live !== "boolean") errors.push("is_live_must_be_boolean");
  if (typeof event.is_verified !== "boolean") errors.push("is_verified_must_be_boolean");
  if (!event.raw_payload_hash || typeof event.raw_payload_hash !== "string") errors.push("raw_payload_hash_required");

  return { ok: errors.length === 0, errors };
}

export function assertValidEvent(event) {
  const validation = validateEvent(event);
  if (!validation.ok) {
    const error = new Error(`invalid_intelligence_event:${validation.errors.join(",")}`);
    error.validation = validation;
    throw error;
  }
  return event;
}
