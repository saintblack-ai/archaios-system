# Revenue Architecture

## Revenue Objective

AI Assassins monetizes premium intelligence through recurring subscriptions:

- Pro: `$49/month`
- Elite: `$99/month`

## Recommended Stripe Pattern

Use Stripe Billing APIs with Stripe Checkout Sessions in `mode=subscription`. This avoids manual renewal logic and lets Stripe handle subscription lifecycle, payment retries, invoices, and hosted payment UI.

Use Stripe Customer Portal for self-service:

- Payment method updates
- Cancellation
- Subscription management
- Billing history

## Required Revenue Flow

```text
Visitor -> pricing page -> Supabase sign in/sign up -> checkout session
  -> Stripe hosted checkout
  -> success URL with checkout=success
  -> Stripe webhook
  -> Worker verifies signature
  -> Supabase subscriptions table upsert
  -> dashboard refreshes /api/subscription
  -> tier-aware features unlock
```

## Product Tiers

### Free

- Delayed or limited daily intelligence.
- Teaser-level alerts.
- Email capture.
- Upgrade CTAs.

### Pro `$49/month`

- Full daily briefing.
- Expanded dashboards.
- Premium categories.
- Saved history.
- Member tools.

### Elite `$99/month`

- Everything in Pro.
- Priority intelligence feed.
- Deeper analysis panels.
- Elite reports.
- Higher urgency alerts.
- Future concierge/operator features.

## Data Model

Primary table:

```sql
public.subscriptions (
  id uuid primary key,
  user_id uuid references auth.users(id),
  tier text check (tier in ('free', 'pro', 'elite')),
  status text,
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz,
  updated_at timestamptz
)
```

Recommended revenue event table:

```sql
public.revenue_events (
  id uuid primary key,
  user_id uuid,
  event_type text,
  tier text,
  amount_cents integer,
  provider text default 'stripe',
  source text,
  metadata jsonb,
  created_at timestamptz default now()
)
```

## Metrics To Track

- Visitors
- Email signups
- Checkout starts
- Checkout completions
- Active Pro subscriptions
- Active Elite subscriptions
- Cancellations
- Failed payments
- Upgrade/downgrade events
- MRR
- Conversion rate
- Churn risk signals

## Permission Boundary

Do not create Stripe products, mutate live billing settings, set production webhook destinations, or switch to live mode without explicit approval.

