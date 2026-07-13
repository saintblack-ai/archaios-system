create extension if not exists pgcrypto;

create table if not exists public.sitrep_events (
  id text primary key,
  headline text not null,
  summary text not null,
  category text not null check (category in ('ai', 'cyber', 'defense', 'markets', 'space', 'weather', 'energy', 'science', 'geopolitics', 'research', 'infrastructure', 'archaios')),
  severity text not null check (severity in ('informational', 'low', 'guarded', 'elevated', 'high', 'critical')),
  confidence numeric not null check (confidence >= 0 and confidence <= 1),
  status text not null check (status in ('live', 'cached', 'sample', 'stale', 'unavailable')),
  source_name text not null,
  source_url text,
  source_type text not null,
  published_at timestamptz,
  ingested_at timestamptz not null default now(),
  latitude numeric,
  longitude numeric,
  country_code text,
  region text,
  tags text[] not null default array[]::text[],
  entities text[] not null default array[]::text[],
  related_event_ids text[] not null default array[]::text[],
  research_mission_id text,
  analysis text,
  recommended_actions text[] not null default array[]::text[],
  is_live boolean not null default false,
  is_verified boolean not null default false,
  raw_payload_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sitrep_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source_key text not null,
  source_name text,
  status text not null check (status in ('completed', 'failed')),
  fetched_count integer not null default 0,
  stored_count integer not null default 0,
  store text,
  error text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sitrep_reports (
  id text primary key,
  report_type text not null,
  generated_at timestamptz not null,
  model_identifier text not null,
  threat_level text not null,
  executive_summary text not null,
  confirmed_developments jsonb not null default '[]'::jsonb,
  uncertain_developments jsonb not null default '[]'::jsonb,
  system_health_status text not null default 'unknown',
  priority_research_questions jsonb not null default '[]'::jsonb,
  mission_queue_updates jsonb not null default '[]'::jsonb,
  recommended_next_actions jsonb not null default '[]'::jsonb,
  source_list jsonb not null default '[]'::jsonb,
  confidence_note text not null
);

create table if not exists public.research_missions (
  id text primary key,
  title text not null,
  objective text,
  status text not null check (status in ('draft', 'active', 'monitoring', 'blocked', 'review', 'complete', 'archived')),
  priority text not null default 'normal',
  owner text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  evidence jsonb not null default '[]'::jsonb,
  linked_events text[] not null default array[]::text[],
  sources jsonb not null default '[]'::jsonb,
  working_hypotheses jsonb not null default '[]'::jsonb,
  counterarguments jsonb not null default '[]'::jsonb,
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  timeline jsonb not null default '[]'::jsonb,
  notes jsonb not null default '[]'::jsonb,
  attachments_metadata jsonb not null default '[]'::jsonb,
  generated_assessments jsonb not null default '[]'::jsonb,
  final_conclusions jsonb not null default '[]'::jsonb
);

create index if not exists idx_sitrep_events_category_published on public.sitrep_events (category, published_at desc);
create index if not exists idx_sitrep_events_severity_published on public.sitrep_events (severity, published_at desc);
create index if not exists idx_sitrep_events_verified on public.sitrep_events (is_verified, published_at desc);
create index if not exists idx_sitrep_events_geo on public.sitrep_events (latitude, longitude) where latitude is not null and longitude is not null;
create index if not exists idx_sitrep_ingestion_runs_created on public.sitrep_ingestion_runs (created_at desc);

alter table public.sitrep_events enable row level security;
alter table public.sitrep_ingestion_runs enable row level security;
alter table public.sitrep_reports enable row level security;
alter table public.research_missions enable row level security;

drop policy if exists sitrep_events_authenticated_read on public.sitrep_events;
create policy sitrep_events_authenticated_read on public.sitrep_events
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists sitrep_events_service_role_all on public.sitrep_events;
create policy sitrep_events_service_role_all on public.sitrep_events
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists sitrep_ingestion_runs_service_role_all on public.sitrep_ingestion_runs;
create policy sitrep_ingestion_runs_service_role_all on public.sitrep_ingestion_runs
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists sitrep_reports_authenticated_read on public.sitrep_reports;
create policy sitrep_reports_authenticated_read on public.sitrep_reports
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists sitrep_reports_service_role_all on public.sitrep_reports;
create policy sitrep_reports_service_role_all on public.sitrep_reports
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists research_missions_service_role_all on public.research_missions;
create policy research_missions_service_role_all on public.research_missions
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
