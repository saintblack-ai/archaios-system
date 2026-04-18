alter table public.agent_logs
  add column if not exists category text not null default 'general',
  add column if not exists output jsonb not null default '{}'::jsonb;

update public.agent_logs
set output = result
where output = '{}'::jsonb
  and result <> '{}'::jsonb;

create index if not exists idx_agent_logs_category_created_at
  on public.agent_logs(category, created_at desc);

alter table public.briefs
  alter column user_id drop not null;

alter table public.briefs
  add column if not exists audience_tier text not null default 'free'
    check (audience_tier in ('free', 'pro', 'elite', 'enterprise'));

create table if not exists public.metrics (
  id bigserial primary key,
  metric_name text not null,
  metric_date date not null,
  value jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (metric_name, metric_date)
);

create table if not exists public.next_actions (
  action_key text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_events (
  id bigserial primary key,
  lead_identifier text not null,
  segment text not null default 'general',
  event_name text not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_metrics_name_date
  on public.metrics(metric_name, metric_date desc);

create index if not exists idx_app_events_segment_created_at
  on public.app_events(segment, created_at desc);

create index if not exists idx_app_events_event_name_created_at
  on public.app_events(event_name, created_at desc);

alter table public.metrics enable row level security;
alter table public.next_actions enable row level security;
alter table public.app_events enable row level security;

drop policy if exists metrics_service_role_all on public.metrics;
create policy metrics_service_role_all
on public.metrics
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists next_actions_service_role_all on public.next_actions;
create policy next_actions_service_role_all
on public.next_actions
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists app_events_service_role_all on public.app_events;
create policy app_events_service_role_all
on public.app_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
