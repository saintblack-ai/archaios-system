import { isPersistentStoreAvailable, listIngestionRuns } from "./store.js";
import { getSourceHealth } from "./ingestEvents.js";

export async function buildSitrepHealth() {
  const runs = await listIngestionRuns();
  const failed = runs.filter((run) => run.status === "failed").length;
  const latest = runs[0] || null;
  const sources = await getSourceHealth();
  const staleSources = sources.filter((source) => source.freshness !== "fresh").length;

  return {
    status: failed > 0 || staleSources > 0 ? "degraded" : "operational",
    frontend_build_status: "unknown",
    backend_health: "operational",
    database_connectivity: isPersistentStoreAvailable() ? "operational" : "unknown",
    latest_migration: "20260710_archaios_intelligence_os.sql",
    latest_ingestion: latest?.completed_at || latest?.created_at || null,
    failed_ingestion_count: failed,
    source_freshness: sources,
    deployment_status: "unknown",
    github_activity: "not_configured",
    environment_configuration_status: isPersistentStoreAvailable() ? "configured" : "partial",
    last_successful_sitrep_generation: runs.find((run) => run.status === "completed")?.completed_at || null
  };
}
