import { fetchJsonWithTimeout } from "../http.js";
import { normalizeEvent } from "../normalizeEvent.js";
import { getSource } from "../sourceRegistry.js";

function severityFromMagnitude(magnitude) {
  if (magnitude >= 7) return "critical";
  if (magnitude >= 6) return "high";
  if (magnitude >= 5) return "elevated";
  return "guarded";
}

export async function fetchUsgsEvents(options = {}) {
  const source = getSource("usgs-earthquakes");
  const payload = await fetchJsonWithTimeout(source.url, options);
  const features = Array.isArray(payload?.features) ? payload.features : [];

  return features.slice(0, 25).map((feature) => {
    const magnitude = Number(feature?.properties?.mag || 0);
    const coordinates = feature?.geometry?.coordinates || [];

    return normalizeEvent({
      source_key: source.key,
      external_id: feature?.id,
      headline: feature?.properties?.title || `Magnitude ${magnitude} earthquake`,
      summary: `USGS reported a magnitude ${magnitude || "unknown"} seismic event near ${feature?.properties?.place || "an unspecified location"}.`,
      category: "science",
      severity: severityFromMagnitude(magnitude),
      confidence: 0.95,
      status: "live",
      source_name: source.name,
      source_url: feature?.properties?.url || source.url,
      source_type: source.type,
      published_at: feature?.properties?.time ? new Date(feature.properties.time).toISOString() : null,
      latitude: coordinates[1],
      longitude: coordinates[0],
      region: feature?.properties?.place || "",
      tags: ["usgs", "earthquake", "public-feed"],
      entities: ["USGS"],
      analysis: "Official public seismic feed. Operational impact requires local context before escalation.",
      recommended_actions: ["Review local infrastructure exposure if the event is near operating regions."],
      is_live: true,
      is_verified: true,
      raw_payload: feature
    });
  });
}
