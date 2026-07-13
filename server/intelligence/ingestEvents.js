import { fetchInternalArchaiosEvents } from "./adapters/internalArchaiosAdapter.js";
import { fetchNasaEvents } from "./adapters/nasaAdapter.js";
import { fetchStatusPageEvents } from "./adapters/statusPageAdapter.js";
import { fetchUsgsEvents } from "./adapters/usgsAdapter.js";
import { deduplicateEvents } from "./deduplicateEvents.js";
import { SOURCE_REGISTRY, getSource } from "./sourceRegistry.js";
import { listIngestionRuns, saveEvents, saveIngestionRun } from "./store.js";

const ADAPTERS = {
  "usgs-earthquakes": fetchUsgsEvents,
  "nasa-donki": fetchNasaEvents,
  "openai-status": (options) => fetchStatusPageEvents(getSource("openai-status"), options),
  "cloudflare-status": (options) => fetchStatusPageEvents(getSource("cloudflare-status"), options),
  "vercel-status": (options) => fetchStatusPageEvents(getSource("vercel-status"), options),
  "supabase-status": (options) => fetchStatusPageEvents(getSource("supabase-status"), options),
  "internal-archaios": (_options, context) => fetchInternalArchaiosEvents(context)
};

export async function refreshSitrepSources(options = {}) {
  const sourceKeys = options.sourceKeys?.length ? options.sourceKeys : SOURCE_REGISTRY.filter((source) => source.enabled).map((source) => source.key);
  const runs = [];
  const allEvents = [];

  for (const sourceKey of sourceKeys) {
    const adapter = ADAPTERS[sourceKey];
    const source = getSource(sourceKey);
    const startedAt = new Date().toISOString();

    if (!adapter || !source) {
      runs.push(await saveIngestionRun({ source_key: sourceKey, status: "failed", error: "adapter_not_found", started_at: startedAt }));
      continue;
    }

    try {
      const events = deduplicateEvents(await adapter(options, { supabaseConfigured: options.supabaseConfigured }));
      const stored = await saveEvents(events);
      allEvents.push(...events);
      runs.push(
        await saveIngestionRun({
          source_key: sourceKey,
          source_name: source.name,
          status: "completed",
          fetched_count: events.length,
          stored_count: stored.stored,
          store: stored.via,
          started_at: startedAt,
          completed_at: new Date().toISOString()
        })
      );
    } catch (error) {
      runs.push(
        await saveIngestionRun({
          source_key: sourceKey,
          source_name: source.name,
          status: "failed",
          error: String(error?.message || error || "adapter_failed"),
          fetched_count: 0,
          stored_count: 0,
          started_at: startedAt,
          completed_at: new Date().toISOString()
        })
      );
    }
  }

  return {
    refreshed_at: new Date().toISOString(),
    events: deduplicateEvents(allEvents),
    runs
  };
}

export async function getSourceHealth() {
  const runs = await listIngestionRuns();
  return SOURCE_REGISTRY.map((source) => {
    const latest = runs.find((run) => run.source_key === source.key);
    const lastSuccess = runs.find((run) => run.source_key === source.key && run.status === "completed");
    const ageMs = lastSuccess?.completed_at ? Date.now() - Date.parse(lastSuccess.completed_at) : Infinity;
    const stale = ageMs > source.freshnessMinutes * 60 * 1000;

    return {
      key: source.key,
      name: source.name,
      type: source.type,
      category: source.category,
      url: source.url,
      enabled: source.enabled,
      latest_status: latest?.status || "unavailable",
      last_successful_refresh: lastSuccess?.completed_at || null,
      freshness: lastSuccess ? (stale ? "stale" : "fresh") : "unavailable",
      last_error: latest?.status === "failed" ? latest.error : null
    };
  });
}
