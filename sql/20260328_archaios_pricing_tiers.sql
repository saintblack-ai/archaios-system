alter table if exists public.profiles
  add column if not exists tier text not null default 'free';

alter table if exists public.subscriptions
  add column if not exists tier text not null default 'free';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_tier_archaios_check'
  ) then
    alter table public.profiles
      add constraint profiles_tier_archaios_check
      check (tier in ('free', 'pro', 'elite'));
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'subscriptions_tier_archaios_check'
  ) then
    alter table public.subscriptions
      add constraint subscriptions_tier_archaios_check
      check (tier in ('free', 'pro', 'elite'));
  end if;
end $$;
