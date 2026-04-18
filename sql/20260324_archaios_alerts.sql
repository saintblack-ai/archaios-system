create table if not exists public.alerts (
  id bigserial primary key,
  type text not null,
  severity text not null check (severity in ('high', 'medium', 'normal')),
  message text not null,
  timestamp timestamptz not null default now()
);

create index if not exists idx_alerts_timestamp_desc
  on public.alerts (timestamp desc);

create index if not exists idx_alerts_severity_timestamp
  on public.alerts (severity, timestamp desc);

alter table public.alerts enable row level security;

drop policy if exists alerts_anon_select on public.alerts;
create policy alerts_anon_select
on public.alerts
for select
using (true);

drop policy if exists alerts_anon_insert on public.alerts;
create policy alerts_anon_insert
on public.alerts
for insert
with check (true);

drop policy if exists alerts_anon_delete on public.alerts;
create policy alerts_anon_delete
on public.alerts
for delete
using (true);
