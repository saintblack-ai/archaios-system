# ARCHAIOS Stripe Test Prep

Generated: 2026-04-17

## Objective

Prepare and verify Stripe checkout in test mode only. Do not activate live billing in this phase.

## Verified Wiring Points

Client checkout wiring:

- `src/pages/revenue/PricingPage.jsx` -> checkout entry actions for Pro/Elite.
- `src/pages/Dashboard.jsx` -> upgrade CTAs and billing portal CTA visibility.
- `src/agents/stripeAgent.js` -> `startStripeCheckout(accessToken, tier)`.
- `src/lib/platform.js` -> `createCheckoutSession()` + fallback endpoint handling.

Backend endpoints expected by client:

- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/checkout`
- `POST /api/stripe/customer_portal`
- `POST /api/stripe/customer-portal`
- `POST /api/stripe/portal`
- `GET /api/subscription`

## Pricing ID / Config Placeholders

Client-side placeholder keys (optional for readiness visibility):

- `VITE_STRIPE_PRO_PRICE_ID`
- `VITE_STRIPE_ELITE_PRICE_ID`

Backend/worker keys required for real test checkout:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ELITE_PRICE_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

No secret values are stored in source files.

## Webhook Requirements

Stripe webhook flow must satisfy all conditions:

1. Worker endpoint is configured in Stripe test mode.
2. Signature verification uses `STRIPE_WEBHOOK_SECRET`.
3. Webhook handler writes subscription tier/status changes to Supabase.
4. Idempotency is enforced for duplicate event delivery.

## Post-Checkout Subscription Sync Path

1. Stripe returns user to app with `?checkout=success`.
2. App refreshes session and calls `GET /api/subscription`.
3. UI unlocks Pro/Elite only when backend reports active/trialing state.
4. If backend record is missing, UI remains locked and surfaces safe error messaging.

## Test-Mode Checklist

- Confirm both test prices exist and map to Pro/Elite.
- Confirm checkout URL is returned by Worker for signed-in users.
- Confirm checkout is blocked for guests.
- Complete Pro test checkout and verify `/api/subscription` update.
- Complete Elite test checkout and verify `/api/subscription` update.
- Confirm billing portal opens only for paid users with Stripe customer context.
- Confirm cancellation path returns `checkout=cancel` with no entitlement change.

## Hard Guardrails

- Do not activate live billing.
- Do not edit DNS.
- Do not modify secrets in repo files.
- Do not auto-deploy.
