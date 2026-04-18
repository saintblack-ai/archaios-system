create table if not exists public.intelligence_reports (
  id bigserial primary key,
  topic text not null,
  report text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.content_drafts (
  id bigserial primary key,
  channel text not null,
  content_type text not null default 'general',
  content text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'scheduled', 'sent')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
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

create table if not exists public.sales_content (
  id bigserial primary key,
  content_type text not null,
  content text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'scheduled', 'sent')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_intelligence_reports_created_at
  on public.intelligence_reports(created_at desc);

create index if not exists idx_content_drafts_status_created_at
  on public.content_drafts(status, created_at desc);

create index if not exists idx_marketing_queue_status_scheduled
  on public.marketing_queue(status, scheduled_time desc nulls last);

create index if not exists idx_sales_content_status_created_at
  on public.sales_content(status, created_at desc);

alter table public.intelligence_reports enable row level security;
alter table public.content_drafts enable row level security;
alter table public.marketing_queue enable row level security;
alter table public.sales_content enable row level security;

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

drop policy if exists sales_content_service_role_all on public.sales_content;
create policy sales_content_service_role_all
on public.sales_content
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
