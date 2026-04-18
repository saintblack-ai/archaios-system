create table if not exists public.agents (
  name text primary key,
  description text,
  tags jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.agent_runs (
  id bigserial primary key,
  agent_name text not null references public.agents(name) on delete cascade,
  scheduled_tag text,
  status text not null default 'queued',
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_runs_agent_name_created_at
  on public.agent_runs(agent_name, created_at desc);

alter table public.agents enable row level security;
alter table public.agent_runs enable row level security;

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

drop policy if exists agent_runs_select_own on public.agent_runs;
create policy agent_runs_select_own
on public.agent_runs
for select
using (false);
