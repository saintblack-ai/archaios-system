create table if not exists public.intelligence_reports (
  id bigserial primary key,
  topic text not null,
  report text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.performance_metrics (
  id bigserial primary key,
  metric_type text not null,
  value jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.marketing_queue (
  id bigserial primary key,
  channel text not null,
  content text not null default '',
  scheduled_time timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'scheduled', 'sent')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_drafts
  add column if not exists content_type text not null default 'general',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_intelligence_reports_created_at
  on public.intelligence_reports(created_at desc);

create index if not exists idx_marketing_queue_status_scheduled
  on public.marketing_queue(status, scheduled_time desc nulls last);

create index if not exists idx_performance_metrics_type_created
  on public.performance_metrics(metric_type, created_at desc);

alter table public.intelligence_reports enable row level security;
alter table public.content_drafts enable row level security;
alter table public.marketing_queue enable row level security;
alter table public.performance_metrics enable row level security;

drop policy if exists intelligence_reports_service_role_all on public.intelligence_reports;
create policy intelligence_reports_service_role_all
on public.intelligence_reports
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists content_drafts_service_role_all on public.content_drafts;
create policy content_drafts_service_role_all
on public.content_drafts
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists marketing_queue_service_role_all on public.marketing_queue;
create policy marketing_queue_service_role_all
on public.marketing_queue
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists performance_metrics_service_role_all on public.performance_metrics;
create policy performance_metrics_service_role_all
on public.performance_metrics
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
