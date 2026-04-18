create extension if not exists pgcrypto;

alter table if exists public.revenue_events
  add column if not exists stripe_event_id text,
  add column if not exists revenue_delta numeric(12,2) not null default 0,
  add column if not exists customer_id text,
  add column if not exists customer_email text,
  add column if not exists subscription_id text,
  add column if not exists payment_intent_id text,
  add column if not exists invoice_id text,
  add column if not exists status text not null default 'recorded';

create unique index if not exists idx_revenue_events_stripe_event_id
  on public.revenue_events(stripe_event_id);

create index if not exists idx_revenue_events_occurred_at
  on public.revenue_events(occurred_at desc);

create index if not exists idx_revenue_events_subscription_id
  on public.revenue_events(subscription_id, occurred_at desc);

create table if not exists public.revenue_summary (
  scope text primary key default 'global',
  total_revenue numeric(12,2) not null default 0,
  mrr numeric(12,2) not null default 0,
  active_subscriptions integer not null default 0,
  failed_payments integer not null default 0,
  last_payment_at timestamptz,
  revenue_status text not null default 'Standby',
  source_event_id text,
  updated_at timestamptz not null default now()
);

alter table public.revenue_summary enable row level security;

drop policy if exists revenue_summary_service_role_all on public.revenue_summary;
create policy revenue_summary_service_role_all
on public.revenue_summary
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists revenue_summary_public_read on public.revenue_summary;
create policy revenue_summary_public_read
on public.revenue_summary
for select
using (true);

drop policy if exists revenue_events_service_role_all on public.revenue_events;
create policy revenue_events_service_role_all
on public.revenue_events
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

insert into public.revenue_summary (scope)
values ('global')
on conflict (scope) do nothing;
