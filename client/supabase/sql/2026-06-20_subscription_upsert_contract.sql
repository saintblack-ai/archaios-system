-- Required by worker.js and server/lib/stripe.js, both of which upsert subscriptions
-- with PostgREST's `on_conflict=user_id` contract.
do $$
begin
  if exists (
    select 1
    from public.subscriptions
    group by user_id
    having count(*) > 1
  ) then
    raise exception using
      message = 'Cannot create subscriptions(user_id) unique index while duplicate subscription rows exist.',
      hint = 'Resolve duplicate subscriptions intentionally, then rerun this migration.';
  end if;
end;
$$;

create unique index if not exists subscriptions_user_id_uidx
  on public.subscriptions (user_id);
