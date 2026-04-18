alter table if exists public.revenue_events
  alter column user_id drop not null,
  add column if not exists stripe_event_id text,
  add column if not exists revenue_delta numeric(12,2) not null default 0,
  add column if not exists customer_id text,
  add column if not exists customer_email text,
  add column if not exists subscription_id text,
  add column if not exists payment_intent_id text,
  add column if not exists invoice_id text,
  add column if not exists status text not null default 'recorded',
  add column if not exists currency text not null default 'USD',
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create unique index if not exists idx_revenue_events_stripe_event_id
  on public.revenue_events (stripe_event_id);

create index if not exists idx_revenue_events_occurred_at
  on public.revenue_events (occurred_at desc);

create index if not exists idx_revenue_events_subscription_id
  on public.revenue_events (subscription_id, occurred_at desc);

alter table if exists public.revenue_summary
  add column if not exists scope text default 'global',
  add column if not exists total_revenue numeric(12,2) not null default 0,
  add column if not exists mrr numeric(12,2) not null default 0,
  add column if not exists active_subscriptions integer not null default 0,
  add column if not exists failed_payments integer not null default 0,
  add column if not exists last_payment_at timestamptz,
  add column if not exists revenue_status text not null default 'Standby',
  add column if not exists source_event_id text,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists idx_revenue_summary_scope
  on public.revenue_summary (scope);

insert into public.revenue_summary (scope)
values ('global')
on conflict (scope) do nothing;
