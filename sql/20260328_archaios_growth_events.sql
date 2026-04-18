create table if not exists public.cta_events (
  id bigserial primary key,
  cta text not null,
  location text not null,
  tier text not null default 'free',
  created_at timestamptz not null default now()
);

create index if not exists idx_cta_events_created_at
  on public.cta_events(created_at desc);
