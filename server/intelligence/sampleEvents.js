import { normalizeEvent } from "./normalizeEvent.js";

export function buildSampleEvents() {
  const now = new Date().toISOString();
  return [
    normalizeEvent({
      source_key: "sample-archaios",
      external_id: "sample-ai-status",
      headline: "Sample AI infrastructure watch item",
      summary: "Sample event for interface continuity when live adapters or database credentials are unavailable.",
      category: "ai",
      severity: "guarded",
      confidence: 0.4,
      status: "sample",
      source_name: "ARCHAIOS sample data",
      source_url: null,
      source_type: "sample",
      published_at: now,
      tags: ["sample", "ai"],
      entities: ["ARCHAIOS"],
      analysis: "Sample data. Do not treat as a real-world intelligence claim.",
      recommended_actions: ["Configure live sources and refresh SITREP before operational use."],
      is_live: false,
      is_verified: false,
      raw_payload: { sample: true }
    }),
    normalizeEvent({
      source_key: "sample-weather",
      external_id: "sample-weather-marker",
      headline: "Sample regional weather marker",
      summary: "Sample map marker with valid coordinates for UI verification only.",
      category: "weather",
      severity: "low",
      confidence: 0.35,
      status: "sample",
      source_name: "ARCHAIOS sample data",
      source_url: null,
      source_type: "sample",
      published_at: now,
      latitude: 29.7604,
      longitude: -95.3698,
      country_code: "US",
      region: "Houston, Texas",
      tags: ["sample", "weather"],
      entities: ["ARCHAIOS"],
      analysis: "Sample coordinate marker. It is not a live weather alert.",
      recommended_actions: ["Replace with live weather adapter output before production use."],
      is_live: false,
      is_verified: false,
      raw_payload: { sample: true }
    })
  ];
}
