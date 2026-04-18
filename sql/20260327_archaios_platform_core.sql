create table if not exists public.leads (
  id bigserial primary key,
  email text not null unique,
  source text not null default 'dashboard',
  captured_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  tier text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions
  add column if not exists stripe_customer_id text,
  add column if not exists stripe_subscription_id text,
  add column if not exists current_period_end timestamptz;

create unique index if not exists subscriptions_user_id_key on public.subscriptions(user_id);
create unique index if not exists subscriptions_stripe_subscription_id_key on public.subscriptions(stripe_subscription_id);

create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email,
      updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_archaios on auth.users;

create trigger on_auth_user_created_archaios
after insert on auth.users
for each row execute procedure public.handle_new_profile();
