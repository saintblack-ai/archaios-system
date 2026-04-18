create extension if not exists pgcrypto;

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  agent_type text not null default 'general',
  description text,
  status text not null default 'idle' check (status in ('idle', 'queued', 'running', 'paused', 'disabled', 'error')),
  enabled boolean not null default true,
  schedule_cron text,
  config jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  last_heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.agents
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists agent_type text not null default 'general',
  add column if not exists description text,
  add column if not exists status text not null default 'idle',
  add column if not exists enabled boolean not null default true,
  add column if not exists schedule_cron text,
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists last_run_at timestamptz,
  add column if not exists last_heartbeat_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.agents
set id = gen_random_uuid()
where id is null;

alter table public.agents
  alter column id set default gen_random_uuid(),
  alter column id set not null;

create unique index if not exists idx_agents_id_unique
  on public.agents (id);

create unique index if not exists idx_agents_name_unique
  on public.agents (name);

create index if not exists idx_agents_status_enabled
  on public.agents (status, enabled);

create index if not exists idx_agents_type_status
  on public.agents (agent_type, status);

create table if not exists public.agent_jobs (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid not null references public.agents(id) on delete cascade,
  agent_name text not null,
  job_type text not null default 'run',
  trigger text not null default 'manual',
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  priority integer not null default 100,
  attempts integer not null default 0,
  max_attempts integer not null default 3,
  scheduled_for timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  lease_expires_at timestamptz,
  claimed_by text,
  input jsonb not null default '{}'::jsonb,
  context jsonb not null default '{}'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_agent_jobs_queue
  on public.agent_jobs (status, scheduled_for, priority, created_at);

create index if not exists idx_agent_jobs_agent_status
  on public.agent_jobs (agent_id, status, created_at desc);

create index if not exists idx_agent_jobs_claimed_by
  on public.agent_jobs (claimed_by, status, lease_expires_at);

create index if not exists idx_agent_jobs_created_at
  on public.agent_jobs (created_at desc);

create table if not exists public.agent_outputs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.agent_jobs(id) on delete cascade,
  agent_id uuid not null references public.agents(id) on delete cascade,
  agent_name text not null,
  output_type text not null default 'result',
  status text not null default 'success' check (status in ('success', 'error', 'partial')),
  summary text,
  content jsonb not null default '{}'::jsonb,
  token_usage integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_outputs_job_id
  on public.agent_outputs (job_id);

create index if not exists idx_agent_outputs_agent_created_at
  on public.agent_outputs (agent_id, created_at desc);

create index if not exists idx_agent_outputs_status_created_at
  on public.agent_outputs (status, created_at desc);

alter table public.agents enable row level security;
alter table public.agent_jobs enable row level security;
alter table public.agent_outputs enable row level security;

drop policy if exists agents_service_role_all on public.agents;
create policy agents_service_role_all
on public.agents
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agents_authenticated_read on public.agents;
create policy agents_authenticated_read
on public.agents
for select
using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists agent_jobs_service_role_all on public.agent_jobs;
create policy agent_jobs_service_role_all
on public.agent_jobs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_jobs_authenticated_read on public.agent_jobs;
create policy agent_jobs_authenticated_read
on public.agent_jobs
for select
using (auth.role() in ('authenticated', 'service_role'));

drop policy if exists agent_outputs_service_role_all on public.agent_outputs;
create policy agent_outputs_service_role_all
on public.agent_outputs
for all
using (auth.role() = 'service_role')
with check (auth.role() = 'service_role');

drop policy if exists agent_outputs_authenticated_read on public.agent_outputs;
create policy agent_outputs_authenticated_read
on public.agent_outputs
for select
using (auth.role() in ('authenticated', 'service_role'));

create or replace function public.claim_agent_jobs(
  p_worker_name text,
  p_limit integer default 5
)
returns setof public.agent_jobs
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  with candidates as (
    select j.id
    from public.agent_jobs j
    join public.agents a on a.id = j.agent_id
    where j.status = 'queued'
      and j.scheduled_for <= now()
      and j.attempts < j.max_attempts
      and a.enabled = true
    order by j.priority asc, j.scheduled_for asc, j.created_at asc
    for update skip locked
    limit greatest(coalesce(p_limit, 0), 0)
  ),
  updated as (
    update public.agent_jobs j
    set status = 'running',
        attempts = j.attempts + 1,
        started_at = coalesce(j.started_at, now()),
        claimed_by = p_worker_name,
        lease_expires_at = now() + interval '5 minutes',
        updated_at = now()
    from candidates c
    where j.id = c.id
    returning j.*
  ),
  touched_agents as (
    update public.agents a
    set status = 'running',
        last_heartbeat_at = now(),
        updated_at = now()
    where a.id in (select distinct agent_id from updated)
    returning a.id
  )
  select * from updated;
end;
$$;

create or replace function public.complete_agent_job(
  p_job_id uuid,
  p_job_status text,
  p_output_type text default 'result',
  p_output_status text default 'success',
  p_summary text default null,
  p_content jsonb default '{}'::jsonb,
  p_error_message text default null,
  p_token_usage integer default null
)
returns public.agent_jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_job public.agent_jobs%rowtype;
begin
  update public.agent_jobs
  set status = p_job_status,
      completed_at = case when p_job_status in ('completed', 'failed', 'cancelled') then now() else completed_at end,
      lease_expires_at = null,
      error_message = p_error_message,
      updated_at = now()
  where id = p_job_id
  returning * into v_job;

  if v_job.id is null then
    raise exception 'agent_jobs row not found for id %', p_job_id;
  end if;

  insert into public.agent_outputs (
    job_id,
    agent_id,
    agent_name,
    output_type,
    status,
    summary,
    content,
    token_usage
  )
  values (
    v_job.id,
    v_job.agent_id,
    v_job.agent_name,
    p_output_type,
    p_output_status,
    p_summary,
    coalesce(p_content, '{}'::jsonb),
    p_token_usage
  );

  update public.agents
  set status = case
      when enabled = false then 'disabled'
      when exists (
        select 1
        from public.agent_jobs j
        where j.agent_id = v_job.agent_id
          and j.status = 'running'
          and j.id <> v_job.id
      ) then 'running'
      when exists (
        select 1
        from public.agent_jobs j
        where j.agent_id = v_job.agent_id
          and j.status = 'queued'
      ) then 'queued'
      when p_job_status = 'failed' then 'error'
      else 'idle'
    end,
    last_run_at = case when p_job_status = 'completed' then now() else last_run_at end,
    last_heartbeat_at = now(),
    updated_at = now()
  where id = v_job.agent_id;

  return v_job;
end;
$$;

create or replace view public.agent_lifecycle_overview as
select
  a.id,
  a.name,
  a.agent_type,
  a.status,
  a.enabled,
  a.schedule_cron,
  a.last_run_at,
  a.last_heartbeat_at,
  coalesce(job_counts.queued_jobs, 0) as queued_jobs,
  coalesce(job_counts.running_jobs, 0) as running_jobs,
  coalesce(job_counts.completed_jobs, 0) as completed_jobs,
  coalesce(job_counts.failed_jobs, 0) as failed_jobs,
  job_counts.latest_job_created_at,
  output_counts.latest_output_at
from public.agents a
left join (
  select
    agent_id,
    count(*) filter (where status = 'queued') as queued_jobs,
    count(*) filter (where status = 'running') as running_jobs,
    count(*) filter (where status = 'completed') as completed_jobs,
    count(*) filter (where status = 'failed') as failed_jobs,
    max(created_at) as latest_job_created_at
  from public.agent_jobs
  group by agent_id
) job_counts on job_counts.agent_id = a.id
left join (
  select
    agent_id,
    max(created_at) as latest_output_at
  from public.agent_outputs
  group by agent_id
) output_counts on output_counts.agent_id = a.id;

comment on function public.claim_agent_jobs(text, integer) is
'Claims the next available queued jobs for an orchestrator worker.';

comment on function public.complete_agent_job(uuid, text, text, text, text, jsonb, text, integer) is
'Completes or fails a job and records its output.';

comment on view public.agent_lifecycle_overview is
'Basic lifecycle snapshot for ARCHAIOS agents.';
