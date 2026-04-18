# ARCHAIOS Stripe Preparation Plan

Generated: 2026-04-17

## Current Status

Stripe checkout is prepared in the client but not live-activated by this work.

The app has a checkout wrapper and pricing UI for:

- Pro: `$49/month`
- Elite: `$99/month`

The frontend does not store or require Stripe secret keys. It sends authenticated checkout requests to the Cloudflare Worker.

## Required Checkout Flow

1. User visits Vercel primary app host.
2. User signs in through Supabase.
3. User clicks Pro or Elite checkout.
4. Client sends the request to Cloudflare Worker.
5. Worker creates Stripe Checkout Session.
6. Stripe redirects back with `checkout=success` or `checkout=cancel`.
7. Stripe webhook updates Supabase subscription state.
8. Dashboard refreshes `/api/subscription` and unlocks Pro or Elite.

## Client Routes

| Route | Purpose |
| --- | --- |
| `/pricing` | Plan comparison and checkout entry point |
| `/dashboard` | Signed-in state, subscription state, and premium gate visibility |
| `/operator` | Internal readiness and admin/operator surface |

## Backend Endpoints Expected

The client currently expects the Cloudflare Worker to support:

- `GET /api/health`
- `GET /api/subscription`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/checkout`
- `POST /api/stripe/customer-portal`
- `POST /api/stripe/portal`

Compatibility route fallback remains in the client for older Worker endpoint names.

## Environment Variables Needed Later

Do not commit these values.

Client-side:

- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Worker/server-side:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_ELITE_PRICE_ID`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any allowed CORS/app origin settings for the Vercel production host

## Manual Test Checklist Before Live Billing

- Confirm Stripe products and prices exist in test mode.
- Confirm Cloudflare Worker secrets are set in test mode.
- Confirm webhook endpoint receives Stripe events.
- Complete a Pro test checkout.
- Complete an Elite test checkout.
- Verify Supabase subscription row updates after checkout.
- Verify `/api/subscription` returns active Pro/Elite.
- Verify dashboard gates unlock only after subscription sync.
- Verify customer portal opens only for paid users with Stripe customer data.

## Implemented Locally

- `/pricing` now displays the host mode and billing mode.
- `/pricing` now lists Stripe activation requirements as manual verification items.
- No Stripe secret, product, price, webhook, or billing setting was changed.

## Approval Boundary

Activating live billing requires explicit approval after test-mode checkout passes end to end.
