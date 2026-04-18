alter table public.alerts
  add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_alerts_user_timestamp
  on public.alerts (user_id, timestamp desc);

drop policy if exists alerts_anon_select on public.alerts;
drop policy if exists alerts_anon_insert on public.alerts;
drop policy if exists alerts_anon_delete on public.alerts;

drop policy if exists alerts_user_insert on public.alerts;
create policy alerts_user_insert
on public.alerts
for insert
to authenticated
with check (auth.uid() = user_id);
