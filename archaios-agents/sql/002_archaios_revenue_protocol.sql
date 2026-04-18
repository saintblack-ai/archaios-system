create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  company text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free',
  status text not null default 'active',
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text,
  status text not null default 'draft',
  generated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete cascade,
  agent_name text not null,
  status text not null check (status in ('success', 'error')),
  trigger text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  amount numeric(12,2),
  currency text not null default 'USD',
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_briefs_user_id on public.briefs(user_id);
create index if not exists idx_agent_logs_user_id on public.agent_logs(user_id);
create index if not exists idx_agent_logs_agent_name_created_at on public.agent_logs(agent_name, created_at desc);
create index if not exists idx_revenue_events_user_id_occurred_at on public.revenue_events(user_id, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.briefs enable row level security;
alter table public.agent_logs enable row level security;
alter table public.revenue_events enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (auth.uid() = id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists profiles_delete_own on public.profiles;
create policy profiles_delete_own
on public.profiles for delete
using (auth.uid() = id);

drop policy if exists subscriptions_select_own on public.subscriptions;
create policy subscriptions_select_own
on public.subscriptions for select
using (auth.uid() = user_id);

drop policy if exists subscriptions_insert_own on public.subscriptions;
create policy subscriptions_insert_own
on public.subscriptions for insert
with check (auth.uid() = user_id);

drop policy if exists subscriptions_update_own on public.subscriptions;
create policy subscriptions_update_own
on public.subscriptions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists subscriptions_delete_own on public.subscriptions;
create policy subscriptions_delete_own
on public.subscriptions for delete
using (auth.uid() = user_id);

drop policy if exists briefs_select_own on public.briefs;
create policy briefs_select_own
on public.briefs for select
using (auth.uid() = user_id);

drop policy if exists briefs_insert_own on public.briefs;
create policy briefs_insert_own
on public.briefs for insert
with check (auth.uid() = user_id);

drop policy if exists briefs_update_own on public.briefs;
create policy briefs_update_own
on public.briefs for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists briefs_delete_own on public.briefs;
create policy briefs_delete_own
on public.briefs for delete
using (auth.uid() = user_id);

drop policy if exists agent_logs_select_own on public.agent_logs;
create policy agent_logs_select_own
on public.agent_logs for select
using (auth.uid() = user_id);

drop policy if exists agent_logs_insert_own on public.agent_logs;
create policy agent_logs_insert_own
on public.agent_logs for insert
with check (auth.uid() = user_id);

drop policy if exists agent_logs_update_own on public.agent_logs;
create policy agent_logs_update_own
on public.agent_logs for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists agent_logs_delete_own on public.agent_logs;
create policy agent_logs_delete_own
on public.agent_logs for delete
using (auth.uid() = user_id);

drop policy if exists revenue_events_select_own on public.revenue_events;
create policy revenue_events_select_own
on public.revenue_events for select
using (auth.uid() = user_id);

drop policy if exists revenue_events_insert_own on public.revenue_events;
create policy revenue_events_insert_own
on public.revenue_events for insert
with check (auth.uid() = user_id);

drop policy if exists revenue_events_update_own on public.revenue_events;
create policy revenue_events_update_own
on public.revenue_events for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists revenue_events_delete_own on public.revenue_events;
create policy revenue_events_delete_own
on public.revenue_events for delete
using (auth.uid() = user_id);
