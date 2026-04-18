# Database Schema Proposal

## Existing Core Tables

The current client repo includes SQL for:

- `subscriptions`
- `alerts`
- `leads`
- `cta_clicks`
- production rollups

## Proposed Additions

```sql
create table public.briefings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text not null,
  tier_visibility text not null default 'free',
  status text not null default 'draft',
  payload jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.briefing_signals (
  id uuid primary key default gen_random_uuid(),
  briefing_id uuid references public.briefings(id) on delete cascade,
  category text not null,
  severity text not null default 'normal',
  title text not null,
  detail text not null,
  source_url text,
  tier_visibility text not null default 'free',
  created_at timestamptz not null default now()
);

create table public.revenue_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  event_type text not null,
  tier text,
  amount_cents integer,
  provider text not null default 'stripe',
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.operator_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  severity text not null default 'info',
  component text not null,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

## RLS Direction

- Users can read their own subscription and alert history.
- Public can insert leads and CTA events through controlled endpoints only.
- Briefings can be public-read only for published free-tier samples.
- Pro/Elite briefings should be returned by Worker endpoints after tier checks, not directly exposed through public anon policies.
- Operator tables should be admin-only.

