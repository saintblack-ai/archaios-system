import { normalizeEvent } from "../normalizeEvent.js";
import { getSource } from "../sourceRegistry.js";

export async function fetchInternalArchaiosEvents(context = {}) {
  const source = getSource("internal-archaios");
  const now = new Date().toISOString();
  const health = context.health || {
    frontendBuild: "unknown",
    backendHealth: "operational",
    databaseConnectivity: context.supabaseConfigured ? "operational" : "unknown",
    latestMigration: "20260710_archaios_intelligence_os.sql",
    environmentConfiguration: context.supabaseConfigured ? "configured" : "partial"
  };

  return [
    normalizeEvent({
      source_key: source.key,
      external_id: `internal-health-${now.slice(0, 13)}`,
      headline: "ARCHAIOS internal system health snapshot",
      summary: `Internal health snapshot generated. Backend: ${health.backendHealth}. Database: ${health.databaseConnectivity}. Environment: ${health.environmentConfiguration}.`,
      category: "archaios",
      severity: health.backendHealth === "operational" ? "informational" : "guarded",
      confidence: 0.8,
      status: "cached",
      source_name: source.name,
      source_url: null,
      source_type: source.type,
      published_at: now,
      tags: ["archaios", "system-health"],
      entities: ["ARCHAIOS"],
      analysis: "Internal operational signal. It is not external threat intelligence.",
      recommended_actions: ["Review missing configuration before enabling production refresh automation."],
      is_live: false,
      is_verified: true,
      raw_payload: health
    })
  ];
}
