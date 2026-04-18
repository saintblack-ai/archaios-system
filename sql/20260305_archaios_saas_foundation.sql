create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'elite', 'enterprise')),
  status text not null default 'inactive',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_subscriptions_user_id on public.subscriptions(user_id);
create index if not exists idx_subscriptions_status on public.subscriptions(status);

create table if not exists public.briefs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.agent_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  agent_name text not null,
  status text not null default 'success',
  trigger text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_briefs_user_id_created_at
  on public.briefs(user_id, created_at desc);

create index if not exists idx_agent_logs_agent_name_created_at
  on public.agent_logs(agent_name, created_at desc);

alter table public.briefs enable row level security;
alter table public.agent_logs enable row level security;

drop policy if exists briefs_select_own on public.briefs;
create policy briefs_select_own
on public.briefs
for select
using (auth.uid() = user_id);

drop policy if exists briefs_insert_own on public.briefs;
create policy briefs_insert_own
on public.briefs
for insert
with check (auth.uid() = user_id);

drop policy if exists briefs_update_own on public.briefs;
create policy briefs_update_own
on public.briefs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists briefs_delete_own on public.briefs;
create policy briefs_delete_own
on public.briefs
for delete
using (auth.uid() = user_id);

drop policy if exists briefs_service_role_all on public.briefs;
create policy briefs_service_role_all
on public.briefs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_logs_service_role_all on public.agent_logs;
create policy agent_logs_service_role_all
on public.agent_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_logs_select_own on public.agent_logs;
create policy agent_logs_select_own
on public.agent_logs
for select
using (auth.uid() = user_id);
