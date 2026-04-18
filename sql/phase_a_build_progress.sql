create table if not exists public.build_progress (
  milestone text primary key,
  status text not null,
  updated_at timestamptz not null default now()
);

insert into public.build_progress (milestone, status)
values
  ('auth_complete', 'complete'),
  ('brief_history_complete', 'complete'),
  ('stripe_checkout_complete', 'complete'),
  ('webhook_complete', 'complete'),
  ('gating_complete', 'complete')
on conflict (milestone)
do update set
  status = excluded.status,
  updated_at = now();

