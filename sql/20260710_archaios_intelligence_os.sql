create extension if not exists pgcrypto;
create extension if not exists vector;

do $$
begin
  create type public.intelligence_section as enum (
    'global',
    'us',
    'markets',
    'ai',
    'cybersecurity',
    'defense',
    'space',
    'energy',
    'science',
    'weather',
    'osint'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.intelligence_event_type as enum (
    'ai',
    'cyber',
    'military',
    'economics',
    'weather',
    'breaking_news',
    'research',
    'space',
    'energy',
    'science',
    'status'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.intelligence_relationship_type as enum (
    'causes',
    'references',
    'same_topic',
    'same_location',
    'organization',
    'person',
    'country',
    'technology',
    'contradicts',
    'updates',
    'escalates',
    'deescalates'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.intelligence_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  name text not null,
  adapter text not null,
  url text,
  section public.intelligence_section,
  reliability_score numeric(4, 3) not null default 0.750 check (reliability_score >= 0 and reliability_score <= 1),
  enabled boolean not null default true,
  polling_interval_seconds integer not null default 300 check (polling_interval_seconds >= 60),
  last_polled_at timestamptz,
  last_success_at timestamptz,
  last_error text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.intelligence_events (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.intelligence_sources(id) on delete set null,
  external_id text,
  section public.intelligence_section not null,
  event_type public.intelligence_event_type not null,
  title text not null,
  summary text not null,
  content text,
  threat_level integer not null default 1 check (threat_level between 1 and 5),
  confidence numeric(4, 3) not null default 0.700 check (confidence >= 0 and confidence <= 1),
  occurred_at timestamptz,
  detected_at timestamptz not null default now(),
  published_at timestamptz,
  expires_at timestamptz,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  location_name text,
  countries text[] not null default array[]::text[],
  organizations text[] not null default array[]::text[],
  people text[] not null default array[]::text[],
  technologies text[] not null default array[]::text[],
  tags text[] not null default array[]::text[],
  source_url text,
  source_title text,
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_payload jsonb not null default '{}'::jsonb,
  related_event_ids uuid[] not null default array[]::uuid[],
  suggested_actions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'suppressed', 'archived')),
  content_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_id, external_id),
  unique (content_hash)
);

create table if not exists public.intelligence_reports (
  id uuid primary key default gen_random_uuid(),
  report_type text not null check (report_type in ('morning_sitrep', 'noon_update', 'evening_review', 'weekly_assessment', 'monthly_strategic_report', 'ad_hoc')),
  title text not null,
  executive_summary text not null,
  commander_notes text,
  sections jsonb not null default '{}'::jsonb,
  daily_priorities jsonb not null default '[]'::jsonb,
  research_queue jsonb not null default '[]'::jsonb,
  threat_level integer not null default 1 check (threat_level between 1 and 5),
  confidence numeric(4, 3) not null default 0.700 check (confidence >= 0 and confidence <= 1),
  event_ids uuid[] not null default array[]::uuid[],
  period_start timestamptz not null,
  period_end timestamptz not null,
  generated_by text not null default 'archaios-commander',
  model text,
  token_usage integer,
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.intelligence_research_assessments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.intelligence_events(id) on delete cascade,
  gpt_summary text not null,
  bias_estimate text not null,
  confidence numeric(4, 3) not null check (confidence >= 0 and confidence <= 1),
  counter_arguments jsonb not null default '[]'::jsonb,
  historical_context text,
  strategic_importance text,
  model text,
  assessed_at timestamptz not null default now(),
  unique (event_id)
);

create table if not exists public.intelligence_event_embeddings (
  event_id uuid primary key references public.intelligence_events(id) on delete cascade,
  embedding vector(1536) not null,
  embedding_model text not null default 'text-embedding-3-small',
  embedded_text text not null,
  embedded_at timestamptz not null default now()
);

create table if not exists public.intelligence_relationships (
  id uuid primary key default gen_random_uuid(),
  source_event_id uuid not null references public.intelligence_events(id) on delete cascade,
  target_event_id uuid not null references public.intelligence_events(id) on delete cascade,
  relationship_type public.intelligence_relationship_type not null,
  confidence numeric(4, 3) not null default 0.700 check (confidence >= 0 and confidence <= 1),
  evidence text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (source_event_id <> target_event_id),
  unique (source_event_id, target_event_id, relationship_type)
);

create table if not exists public.intelligence_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('organization', 'person', 'country', 'technology', 'location', 'topic')),
  name text not null,
  canonical_key text not null,
  aliases text[] not null default array[]::text[],
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, canonical_key)
);

create table if not exists public.intelligence_event_entities (
  event_id uuid not null references public.intelligence_events(id) on delete cascade,
  entity_id uuid not null references public.intelligence_entities(id) on delete cascade,
  relevance numeric(4, 3) not null default 0.700 check (relevance >= 0 and relevance <= 1),
  evidence text,
  created_at timestamptz not null default now(),
  primary key (event_id, entity_id)
);

create table if not exists public.intelligence_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  adapter text not null,
  source_id uuid references public.intelligence_sources(id) on delete set null,
  status text not null check (status in ('running', 'completed', 'failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  fetched_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_count integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists idx_intelligence_events_section_detected
  on public.intelligence_events (section, detected_at desc);

create index if not exists idx_intelligence_events_type_detected
  on public.intelligence_events (event_type, detected_at desc);

create index if not exists idx_intelligence_events_threat_detected
  on public.intelligence_events (threat_level desc, detected_at desc);

create index if not exists idx_intelligence_events_geo
  on public.intelligence_events (latitude, longitude)
  where latitude is not null and longitude is not null;

create index if not exists idx_intelligence_events_countries
  on public.intelligence_events using gin (countries);

create index if not exists idx_intelligence_events_tags
  on public.intelligence_events using gin (tags);

create index if not exists idx_intelligence_reports_type_created
  on public.intelligence_reports (report_type, created_at desc);

create index if not exists idx_intelligence_relationships_source
  on public.intelligence_relationships (source_event_id, relationship_type);

create index if not exists idx_intelligence_relationships_target
  on public.intelligence_relationships (target_event_id, relationship_type);

create index if not exists idx_intelligence_entities_key
  on public.intelligence_entities (entity_type, canonical_key);

create index if not exists idx_intelligence_embeddings_ivfflat
  on public.intelligence_event_embeddings
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

alter table public.intelligence_sources enable row level security;
alter table public.intelligence_events enable row level security;
alter table public.intelligence_reports enable row level security;
alter table public.intelligence_research_assessments enable row level security;
alter table public.intelligence_event_embeddings enable row level security;
alter table public.intelligence_relationships enable row level security;
alter table public.intelligence_entities enable row level security;
alter table public.intelligence_event_entities enable row level security;
alter table public.intelligence_ingestion_runs enable row level security;

drop policy if exists intelligence_sources_service_role_all on public.intelligence_sources;
create policy intelligence_sources_service_role_all on public.intelligence_sources
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_sources_authenticated_read on public.intelligence_sources;
create policy intelligence_sources_authenticated_read on public.intelligence_sources
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_events_service_role_all on public.intelligence_events;
create policy intelligence_events_service_role_all on public.intelligence_events
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_events_authenticated_read on public.intelligence_events;
create policy intelligence_events_authenticated_read on public.intelligence_events
for select using (auth.role() in ('authenticated', 'service_role') and status = 'active');

drop policy if exists intelligence_reports_service_role_all on public.intelligence_reports;
create policy intelligence_reports_service_role_all on public.intelligence_reports
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_reports_authenticated_read on public.intelligence_reports;
create policy intelligence_reports_authenticated_read on public.intelligence_reports
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_research_service_role_all on public.intelligence_research_assessments;
create policy intelligence_research_service_role_all on public.intelligence_research_assessments
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_research_authenticated_read on public.intelligence_research_assessments;
create policy intelligence_research_authenticated_read on public.intelligence_research_assessments
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_embeddings_service_role_all on public.intelligence_event_embeddings;
create policy intelligence_embeddings_service_role_all on public.intelligence_event_embeddings
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_relationships_service_role_all on public.intelligence_relationships;
create policy intelligence_relationships_service_role_all on public.intelligence_relationships
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_relationships_authenticated_read on public.intelligence_relationships;
create policy intelligence_relationships_authenticated_read on public.intelligence_relationships
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_entities_service_role_all on public.intelligence_entities;
create policy intelligence_entities_service_role_all on public.intelligence_entities
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_entities_authenticated_read on public.intelligence_entities;
create policy intelligence_entities_authenticated_read on public.intelligence_entities
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_event_entities_service_role_all on public.intelligence_event_entities;
create policy intelligence_event_entities_service_role_all on public.intelligence_event_entities
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists intelligence_event_entities_authenticated_read on public.intelligence_event_entities;
create policy intelligence_event_entities_authenticated_read on public.intelligence_event_entities
for select using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists intelligence_ingestion_runs_service_role_all on public.intelligence_ingestion_runs;
create policy intelligence_ingestion_runs_service_role_all on public.intelligence_ingestion_runs
for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create or replace function public.match_intelligence_events(
  query_embedding vector(1536),
  match_count integer default 20,
  section_filter public.intelligence_section default null,
  min_similarity numeric default 0.25
)
returns table (
  event_id uuid,
  title text,
  summary text,
  section public.intelligence_section,
  event_type public.intelligence_event_type,
  threat_level integer,
  confidence numeric,
  detected_at timestamptz,
  similarity numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    e.id as event_id,
    e.title,
    e.summary,
    e.section,
    e.event_type,
    e.threat_level,
    e.confidence,
    e.detected_at,
    (1 - (emb.embedding <=> query_embedding))::numeric as similarity
  from public.intelligence_event_embeddings emb
  join public.intelligence_events e on e.id = emb.event_id
  where e.status = 'active'
    and (section_filter is null or e.section = section_filter)
    and (1 - (emb.embedding <=> query_embedding)) >= min_similarity
  order by emb.embedding <=> query_embedding
  limit greatest(coalesce(match_count, 20), 1);
$$;

create or replace view public.intelligence_latest_sitrep as
select
  e.section,
  max(e.threat_level) as threat_level,
  avg(e.confidence)::numeric(4, 3) as confidence,
  max(e.detected_at) as latest_detected_at,
  count(*)::integer as event_count,
  jsonb_agg(
    jsonb_build_object(
      'id', e.id,
      'type', e.event_type,
      'title', e.title,
      'summary', e.summary,
      'threatLevel', e.threat_level,
      'confidence', e.confidence,
      'timestamp', e.detected_at,
      'source', coalesce(e.source_title, s.name),
      'sourceUrl', e.source_url,
      'relatedEvents', e.related_event_ids,
      'suggestedActions', e.suggested_actions
    )
    order by e.threat_level desc, e.detected_at desc
  ) filter (where e.id is not null) as events
from public.intelligence_events e
left join public.intelligence_sources s on s.id = e.source_id
where e.status = 'active'
  and e.detected_at >= now() - interval '48 hours'
group by e.section;

insert into public.intelligence_sources (source_key, name, adapter, url, section, reliability_score, polling_interval_seconds)
values
  ('newsapi-general', 'News API General', 'news', null, 'global', 0.700, 300),
  ('open-meteo-weather', 'Open-Meteo', 'weather', 'https://open-meteo.com', 'weather', 0.850, 600),
  ('nasa-api', 'NASA Open APIs', 'nasa', 'https://api.nasa.gov', 'space', 0.900, 900),
  ('usgs-earthquake', 'USGS Earthquake Hazards', 'usgs', 'https://earthquake.usgs.gov', 'science', 0.900, 300),
  ('github-activity', 'GitHub Activity', 'github', 'https://api.github.com', 'osint', 0.750, 600),
  ('openai-status', 'OpenAI Status', 'status', 'https://status.openai.com', 'ai', 0.950, 300),
  ('cloudflare-status', 'Cloudflare Status', 'status', 'https://www.cloudflarestatus.com', 'cybersecurity', 0.950, 300),
  ('supabase-status', 'Supabase Status', 'status', 'https://status.supabase.com', 'cybersecurity', 0.950, 300),
  ('stripe-status', 'Stripe Status', 'status', 'https://status.stripe.com', 'markets', 0.950, 300)
on conflict (source_key) do update
set name = excluded.name,
    adapter = excluded.adapter,
    url = excluded.url,
    section = excluded.section,
    reliability_score = excluded.reliability_score,
    polling_interval_seconds = excluded.polling_interval_seconds,
    updated_at = now();
