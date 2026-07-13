import { supabaseAdmin } from "../lib/supabase.js";
import { buildSampleEvents } from "./sampleEvents.js";

const memory = {
  events: buildSampleEvents(),
  sources: [],
  ingestionRuns: [],
  researchMissions: [],
  reports: []
};

function toRow(event) {
  return {
    id: event.id,
    headline: event.headline,
    summary: event.summary,
    category: event.category,
    severity: event.severity,
    confidence: event.confidence,
    status: event.status,
    source_name: event.source_name,
    source_url: event.source_url,
    source_type: event.source_type,
    published_at: event.published_at,
    ingested_at: event.ingested_at,
    latitude: event.latitude,
    longitude: event.longitude,
    country_code: event.country_code,
    region: event.region,
    tags: event.tags,
    entities: event.entities,
    related_event_ids: event.related_event_ids,
    research_mission_id: event.research_mission_id,
    analysis: event.analysis,
    recommended_actions: event.recommended_actions,
    is_live: event.is_live,
    is_verified: event.is_verified,
    raw_payload_hash: event.raw_payload_hash
  };
}

export function isPersistentStoreAvailable() {
  return Boolean(supabaseAdmin);
}

export async function saveEvents(events) {
  if (!events.length) {
    return { stored: 0, via: isPersistentStoreAvailable() ? "supabase" : "memory" };
  }

  if (supabaseAdmin) {
    const { error } = await supabaseAdmin.from("sitrep_events").upsert(events.map(toRow), { onConflict: "id" });
    if (!error) {
      return { stored: events.length, via: "supabase" };
    }
    memory.ingestionRuns.push({ status: "failed", error: error.message, created_at: new Date().toISOString() });
  }

  const merged = new Map(memory.events.map((event) => [event.id, event]));
  for (const event of events) merged.set(event.id, event);
  memory.events = Array.from(merged.values());
  return { stored: events.length, via: "memory" };
}

export async function listEvents(filters = {}) {
  if (supabaseAdmin) {
    let query = supabaseAdmin.from("sitrep_events").select("*", { count: "exact" });
    query = applySupabaseFilters(query, filters);
    const limit = Math.min(Number(filters.limit || 50), 100);
    const page = Math.max(Number(filters.page || 1), 1);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const { data, error, count } = await query.order("published_at", { ascending: false, nullsFirst: false }).range(from, to);
    if (!error) return { events: data || [], total: count || 0, page, limit, via: "supabase" };
  }

  const filtered = applyMemoryFilters(memory.events, filters);
  const limit = Math.min(Number(filters.limit || 50), 100);
  const page = Math.max(Number(filters.page || 1), 1);
  const start = (page - 1) * limit;
  return {
    events: filtered.slice(start, start + limit),
    total: filtered.length,
    page,
    limit,
    via: "memory"
  };
}

export async function getEventById(id) {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from("sitrep_events").select("*").eq("id", id).maybeSingle();
    if (!error && data) return { event: data, via: "supabase" };
  }
  return { event: memory.events.find((event) => event.id === id) || null, via: "memory" };
}

export async function saveIngestionRun(run) {
  const row = { ...run, created_at: run.created_at || new Date().toISOString() };
  memory.ingestionRuns.unshift(row);
  memory.ingestionRuns = memory.ingestionRuns.slice(0, 100);
  if (supabaseAdmin) {
    await supabaseAdmin.from("sitrep_ingestion_runs").insert(row).catch?.(() => null);
  }
  return row;
}

export async function listIngestionRuns() {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("sitrep_ingestion_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (!error) return data || [];
  }
  return memory.ingestionRuns;
}

export async function saveReport(report) {
  memory.reports.unshift(report);
  memory.reports = memory.reports.slice(0, 25);
  if (supabaseAdmin) {
    await supabaseAdmin.from("sitrep_reports").insert(report).catch?.(() => null);
  }
  return report;
}

export async function getLatestReport() {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("sitrep_reports")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!error && data) return data;
  }
  return memory.reports[0] || null;
}

export async function createResearchMission(input) {
  const now = new Date().toISOString();
  const mission = {
    id: `mission-${cryptoRandomId()}`,
    title: String(input.title || "Untitled research mission").slice(0, 180),
    objective: String(input.objective || "").slice(0, 1200),
    status: input.status || "draft",
    priority: input.priority || "normal",
    owner: input.owner || "ARCHAIOS",
    created_at: now,
    updated_at: now,
    evidence: input.evidence || [],
    linked_events: input.linked_events || [],
    sources: input.sources || [],
    working_hypotheses: input.working_hypotheses || [],
    counterarguments: input.counterarguments || [],
    confidence: Number(input.confidence || 0.5),
    timeline: input.timeline || [],
    notes: input.notes || [],
    attachments_metadata: input.attachments_metadata || [],
    generated_assessments: input.generated_assessments || [],
    final_conclusions: input.final_conclusions || []
  };
  memory.researchMissions.unshift(mission);
  if (supabaseAdmin) {
    await supabaseAdmin.from("research_missions").insert(mission).catch?.(() => null);
  }
  return mission;
}

export async function listResearchMissions() {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin
      .from("research_missions")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100);
    if (!error) return data || [];
  }
  return memory.researchMissions;
}

function applySupabaseFilters(query, filters) {
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.severity) query = query.eq("severity", filters.severity);
  if (filters.source) query = query.eq("source_name", filters.source);
  if (filters.verifiedOnly) query = query.eq("is_verified", true);
  if (filters.since) query = query.gte("published_at", filters.since);
  if (filters.until) query = query.lte("published_at", filters.until);
  return query;
}

function applyMemoryFilters(events, filters) {
  return [...events]
    .filter((event) => !filters.category || event.category === filters.category)
    .filter((event) => !filters.severity || event.severity === filters.severity)
    .filter((event) => !filters.source || event.source_name === filters.source)
    .filter((event) => !filters.verifiedOnly || event.is_verified)
    .filter((event) => !filters.since || Date.parse(event.published_at || event.ingested_at) >= Date.parse(filters.since))
    .filter((event) => !filters.until || Date.parse(event.published_at || event.ingested_at) <= Date.parse(filters.until))
    .sort((left, right) => Date.parse(right.published_at || right.ingested_at) - Date.parse(left.published_at || left.ingested_at));
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 10);
}
