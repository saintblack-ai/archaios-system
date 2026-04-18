# Pricing And Gating Plan

Generated: 2026-04-17

## Revenue Tiers

| Tier | Price | Role |
|---|---:|---|
| Free | `$0` | Funnel entry, teaser intelligence, delayed alerts, email capture. |
| Pro | `$49/month` | Core revenue plan with full daily briefing and premium dashboard access. |
| Elite | `$99/month` | Priority intelligence plan with deeper reports and urgency signals. |

## Implemented Skeleton

- `src/lib/pricing.js` now includes `summary` and `gates` metadata for each plan.
- `src/lib/subscription.js` now exposes `FEATURE_GATES`.
- `/pricing` renders a Free/Pro/Elite feature-gate matrix.
- `/dashboard` still uses real auth/subscription helpers and does not fake paid billing.
- Mock dashboard mode can test locked/unlocked UI structure without touching billing.

## Upgrade Flow

Current intended flow:

```text
Landing -> Pricing -> Sign in -> Stripe Checkout -> Worker webhook -> Supabase subscription -> Dashboard unlock
```

## Gating Rules

| Feature | Free | Pro | Elite |
|---|---|---|---|
| Full Daily Briefing | Delayed teaser | Unlocked | Priority unlocked |
| Premium Categories | Locked | Unlocked | Unlocked |
| Saved History | Limited | Unlocked | Unlocked |
| Priority Signals | Locked | Standard | Priority |
| Elite Reports | Locked | Locked | Unlocked |

## Safety Boundaries

- Checkout requires a signed-in Supabase session.
- Stripe secret keys remain Worker-only.
- Mock mode does not bypass feature gates or fake subscription state.
- Live Pro/Elite activation still depends on Stripe prices, Worker secrets, webhook setup, and Supabase subscription sync.

## Next Actions

- Verify `STRIPE_PRICE_ID_PRO` maps to `$49/month`.
- Verify `STRIPE_PRICE_ID_ELITE` maps to `$99/month`.
- Confirm checkout success returns to `/pricing?checkout=success` or `/dashboard?checkout=success`.
- Add a billing status banner after live webhook verification.

