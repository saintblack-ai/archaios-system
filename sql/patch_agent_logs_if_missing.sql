-- Run only if public.agent_logs is missing in your Supabase project.
create table if not exists public.agent_logs (
  id bigserial primary key,
  user_id uuid references auth.users(id) on delete set null,
  agent_name text not null,
  status text not null default 'success',
  trigger text,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_agent_logs_agent_name_created_at
  on public.agent_logs(agent_name, created_at desc);

alter table public.agent_logs enable row level security;

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
