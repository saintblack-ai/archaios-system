create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.handle_profile_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.handle_profile_updated_at();

create or replace function public.handle_auth_user_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = excluded.email,
        updated_at = timezone('utc', now());

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of email on auth.users
for each row
execute function public.handle_auth_user_created();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do update
  set email = excluded.email,
      updated_at = timezone('utc', now());

create table if not exists public.subscriptions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tier text not null default 'free' check (tier in ('free', 'pro', 'elite')),
  plan text generated always as (tier) stored,
  status text not null default 'inactive',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_user_created_idx
  on public.subscriptions (user_id, created_at desc);

create unique index if not exists subscriptions_stripe_subscription_uidx
  on public.subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.handle_profile_updated_at();

create table if not exists public.alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null,
  severity text not null,
  message text not null,
  timestamp timestamptz not null default timezone('utc', now())
);

create index if not exists alerts_user_timestamp_idx
  on public.alerts (user_id, timestamp desc);

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text not null default 'dashboard',
  captured_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.cta_events (
  id bigint generated always as identity primary key,
  cta text not null,
  location text not null,
  tier text not null default 'free' check (tier in ('free', 'pro', 'elite')),
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists cta_events_created_at_idx
  on public.cta_events (created_at desc);

create table if not exists public.revenue_events (
  id bigint generated always as identity primary key,
  event_type text not null,
  status text not null default 'ok',
  occurred_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists revenue_events_occurred_at_idx
  on public.revenue_events (occurred_at desc);

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.alerts enable row level security;
alter table public.leads enable row level security;
alter table public.cta_events enable row level security;
alter table public.revenue_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "subscriptions_select_own" on public.subscriptions;
create policy "subscriptions_select_own"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "alerts_select_own" on public.alerts;
create policy "alerts_select_own"
on public.alerts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "alerts_delete_own" on public.alerts;
create policy "alerts_delete_own"
on public.alerts
for delete
to authenticated
using (auth.uid() = user_id);
