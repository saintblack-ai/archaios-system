export const EVENT_CATEGORIES = [
  "ai",
  "cyber",
  "defense",
  "markets",
  "space",
  "weather",
  "energy",
  "science",
  "geopolitics",
  "research",
  "infrastructure",
  "archaios"
];

export const EVENT_SEVERITIES = ["informational", "low", "guarded", "elevated", "high", "critical"];

export const EVENT_STATUSES = ["live", "cached", "sample", "stale", "unavailable"];

export function severityWeight(severity) {
  return EVENT_SEVERITIES.indexOf(severity);
}

export function getThreatLevel(events = []) {
  const verified = events.filter((event) => event.is_verified);
  const candidates = verified.length ? verified : events;
  return candidates.reduce((highest, event) => {
    return severityWeight(event.severity) > severityWeight(highest) ? event.severity : highest;
  }, "low");
}

export function publicEventFields() {
  return [
    "id",
    "headline",
    "summary",
    "category",
    "severity",
    "confidence",
    "status",
    "source_name",
    "source_url",
    "source_type",
    "published_at",
    "ingested_at",
    "latitude",
    "longitude",
    "country_code",
    "region",
    "tags",
    "entities",
    "related_event_ids",
    "research_mission_id",
    "analysis",
    "recommended_actions",
    "is_live",
    "is_verified",
    "raw_payload_hash"
  ];
}
