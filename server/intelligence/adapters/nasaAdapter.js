import { fetchJsonWithTimeout } from "../http.js";
import { normalizeEvent } from "../normalizeEvent.js";
import { getSource } from "../sourceRegistry.js";

export async function fetchNasaEvents(options = {}) {
  const source = getSource("nasa-donki");
  const url = `${source.url}&api_key=DEMO_KEY`;
  const payload = await fetchJsonWithTimeout(url, options);
  const items = Array.isArray(payload) ? payload : [];

  return items.slice(0, 12).map((item, index) =>
    normalizeEvent({
      source_key: source.key,
      external_id: item.messageID || item.messageType || `nasa-${index}`,
      headline: `NASA space weather notification: ${item.messageType || "Update"}`,
      summary: String(item.messageBody || "NASA issued a public space weather notification.").slice(0, 600),
      category: "space",
      severity: "informational",
      confidence: 0.86,
      status: "live",
      source_name: source.name,
      source_url: item.messageURL || "https://kauai.ccmc.gsfc.nasa.gov/DONKI/",
      source_type: source.type,
      published_at: item.messageIssueTime || null,
      tags: ["nasa", "space-weather", "donki"],
      entities: ["NASA"],
      analysis: "Official public NASA space weather notification. Operational relevance depends on affected systems.",
      recommended_actions: ["Queue for weekly space-weather review if infrastructure exposure is relevant."],
      is_live: true,
      is_verified: true,
      raw_payload: item
    })
  );
}
