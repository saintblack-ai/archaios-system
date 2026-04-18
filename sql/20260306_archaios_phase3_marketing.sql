create table if not exists public.marketing_calendar (
  id bigserial primary key,
  date date not null,
  theme text not null,
  target_channel text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (date, target_channel)
);

create table if not exists public.marketing_drafts (
  id bigserial primary key,
  channel text not null,
  content text not null default '',
  status text not null default 'draft'
    check (status in ('draft', 'approved', 'scheduled', 'sent')),
  scheduled_for timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id bigserial primary key,
  email text not null,
  source text not null default 'unknown',
  created_at timestamptz not null default now()
);

create index if not exists idx_marketing_calendar_plan_date
  on public.marketing_calendar(date desc, target_channel);

create index if not exists idx_marketing_drafts_status_scheduled
  on public.marketing_drafts(status, scheduled_for desc nulls last, created_at desc);

create index if not exists idx_marketing_drafts_channel_created_at
  on public.marketing_drafts(channel, created_at desc);

create index if not exists idx_leads_source_created_at
  on public.leads(source, created_at desc);

alter table public.marketing_calendar enable row level security;
alter table public.marketing_drafts enable row level security;
alter table public.leads enable row level security;

drop policy if exists marketing_calendar_service_role_all on public.marketing_calendar;
create policy marketing_calendar_service_role_all
on public.marketing_calendar
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists marketing_drafts_service_role_all on public.marketing_drafts;
create policy marketing_drafts_service_role_all
on public.marketing_drafts
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists leads_service_role_insert on public.leads;
create policy leads_service_role_insert
on public.leads
for insert
with check (auth.role() = 'service_role');

drop policy if exists leads_service_role_select on public.leads;
create policy leads_service_role_select
on public.leads
for select
using (auth.role() = 'service_role');

drop policy if exists leads_service_role_update on public.leads;
create policy leads_service_role_update
on public.leads
for update
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
