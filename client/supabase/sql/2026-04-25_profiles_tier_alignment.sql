alter table public.profiles
add column if not exists tier text not null default 'free';

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_tier_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_tier_check
    check (tier in ('free', 'pro', 'elite'));
  end if;
end;
$$;

update public.profiles p
set tier = coalesce(active_subscription.tier, 'free')
from (
  select distinct on (user_id)
    user_id,
    case
      when status in ('active', 'trialing') then tier
      else 'free'
    end as tier
  from public.subscriptions
  order by user_id, updated_at desc nulls last, created_at desc
) active_subscription
where p.id = active_subscription.user_id
  and p.tier is distinct from coalesce(active_subscription.tier, 'free');
