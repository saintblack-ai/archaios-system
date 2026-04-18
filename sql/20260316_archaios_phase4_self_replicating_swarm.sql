create extension if not exists pgcrypto;

create table if not exists public.agents_registry (
  id uuid primary key default gen_random_uuid(),
  agent_type text not null,
  status text not null default 'active',
  performance_score integer not null default 0,
  tasks_completed integer not null default 0,
  revenue_generated integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agents_registry_agent_type_idx
  on public.agents_registry (agent_type);

create index if not exists agents_registry_status_idx
  on public.agents_registry (status);

create index if not exists agents_registry_performance_score_idx
  on public.agents_registry (performance_score desc);

create index if not exists agents_registry_revenue_generated_idx
  on public.agents_registry (revenue_generated desc);
