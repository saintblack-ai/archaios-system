create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  schedule text not null default 'daily',
  status text not null default 'ready',
  last_run timestamptz,
  description text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists schedule text not null default 'daily',
  add column if not exists status text not null default 'ready',
  add column if not exists last_run timestamptz,
  add column if not exists description text,
  add column if not exists enabled boolean not null default true,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create table if not exists public.agent_runs (
  id bigserial primary key,
  agent_name text not null,
  scheduled_tag text,
  status text not null default 'queued',
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agent_runs
  add column if not exists agent_name text,
  add column if not exists scheduled_tag text,
  add column if not exists status text not null default 'queued',
  add column if not exists result jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_agent_runs_agent_name_created_at
  on public.agent_runs(agent_name, created_at desc);

create table if not exists public.agent_logs (
  id bigserial primary key,
  agent_name text not null,
  created_at timestamptz not null default now(),
  result jsonb not null default '{}'::jsonb,
  status text not null default 'success'
);

alter table public.agent_logs
  add column if not exists agent_name text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists result jsonb not null default '{}'::jsonb,
  add column if not exists status text not null default 'success';

create index if not exists idx_agent_logs_agent_name_created_at
  on public.agent_logs(agent_name, created_at desc);

alter table public.agents enable row level security;
alter table public.agent_runs enable row level security;
alter table public.agent_logs enable row level security;

drop policy if exists agents_service_role_all on public.agents;
create policy agents_service_role_all
on public.agents
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_runs_service_role_all on public.agent_runs;
create policy agent_runs_service_role_all
on public.agent_runs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_logs_service_role_all on public.agent_logs;
create policy agent_logs_service_role_all
on public.agent_logs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');
