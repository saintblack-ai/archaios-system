import { fetchJsonWithTimeout } from "../http.js";
import { normalizeEvent } from "../normalizeEvent.js";

function severityFromIndicator(indicator) {
  if (indicator === "critical") return "critical";
  if (indicator === "major") return "high";
  if (indicator === "minor") return "elevated";
  if (indicator === "maintenance") return "guarded";
  return "informational";
}

export async function fetchStatusPageEvents(source, options = {}) {
  const payload = await fetchJsonWithTimeout(source.url, options);
  const status = payload?.status || {};
  const incidents = Array.isArray(payload?.incidents) ? payload.incidents : [];
  const scheduled = Array.isArray(payload?.scheduled_maintenances) ? payload.scheduled_maintenances : [];
  const sourceEvents = [...incidents.slice(0, 8), ...scheduled.slice(0, 4)];

  if (sourceEvents.length === 0) {
    return [
      normalizeEvent({
        source_key: source.key,
        external_id: `${source.key}:${status.indicator || "none"}:${payload?.page?.updated_at || new Date().toISOString().slice(0, 13)}`,
        headline: `${source.name}: ${status.description || "Status available"}`,
        summary: `${source.name} reports ${status.description || "no active incidents"} through its official public status endpoint.`,
        category: source.category,
        severity: severityFromIndicator(status.indicator),
        confidence: 0.9,
        status: "live",
        source_name: source.name,
        source_url: source.url,
        source_type: source.type,
        published_at: payload?.page?.updated_at || null,
        tags: ["status", source.key],
        entities: [source.name.replace(" Status", "")],
        analysis: "Official provider status endpoint. Treat as source status, not independent incident verification.",
        recommended_actions: ["Monitor dependent ARCHAIOS services if provider status worsens."],
        is_live: true,
        is_verified: true,
        raw_payload: status
      })
    ];
  }

  return sourceEvents.map((incident) =>
    normalizeEvent({
      source_key: source.key,
      external_id: incident.id,
      headline: `${source.name}: ${incident.name}`,
      summary: incident.impact
        ? `${incident.name}. Impact level: ${incident.impact}.`
        : incident.name,
      category: source.category,
      severity: severityFromIndicator(incident.impact),
      confidence: 0.88,
      status: "live",
      source_name: source.name,
      source_url: incident.shortlink || source.url,
      source_type: source.type,
      published_at: incident.created_at || incident.scheduled_for || null,
      tags: ["status", source.key, incident.impact].filter(Boolean),
      entities: [source.name.replace(" Status", "")],
      analysis: "Official provider incident or maintenance item. Verify customer impact against ARCHAIOS system health.",
      recommended_actions: ["Check dependent services and update system health if user-facing impact is observed."],
      is_live: true,
      is_verified: true,
      raw_payload: incident
    })
  );
}
