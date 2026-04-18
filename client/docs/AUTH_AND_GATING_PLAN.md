# ARCHAIOS Auth and Gating Plan

Generated: 2026-04-17

## Host Assumption

Primary app host is Vercel:

- `https://ai-assassins-client.vercel.app`

GitHub Pages remains a static backup shell:

- `https://saintblack-ai.github.io/ai-assassins-client/`

Cloudflare Worker remains backend/API/health only:

- `https://archaios-saas-worker.quandrix357.workers.dev/api/health`

## Goal

Finalize a clear Free / Pro / Elite experience model before activating live billing. The frontend should never imply a user has paid access unless the backend subscription record says the subscription is active or trialing.

## Current Client Model

The client now separates account state into four modes:

| Mode | Source | Behavior |
| --- | --- | --- |
| Guest Preview | No Supabase session | Can view public shell and pricing, cannot start checkout |
| Signed-In Free | Supabase session, no active paid subscription | Can preserve account state, paid features stay locked |
| Pro Active | Active/trialing Pro subscription | Full daily briefing, premium categories, paid AI surfaces |
| Elite Active | Active/trialing Elite subscription | Pro access plus priority signals and elite reports |

## Source of Truth

The subscription source of truth remains the Cloudflare Worker backed by Supabase and Stripe webhook sync.

Client-side gating is only a display and navigation layer. It should mirror backend entitlement state, not replace it.

## Implemented Locally

- Centralized tier experience definitions in `src/lib/subscription.js`.
- Added `getAccountExperienceState()` for guest vs signed-in vs paid modes.
- Added explicit flags for:
  - preview shell
  - full briefing
  - AI tools
  - billing management
  - elite signals
  - elite reports
- Dashboard now displays current mode and experience layer with targeted upgrade prompts.
- Locked content now explains what tier unlocks the module and whether the user must sign in first.
- Billing portal button is disabled when there is no active paid plan.
- Operator page copy now clarifies it is infrastructure-only and customer upgrade state is handled by Pricing/Dashboard.

## Remaining Safe Work

- Share one tier matrix component between `/pricing` and `/dashboard`.
- Add operator readiness rows for Supabase auth, Stripe checkout, Stripe webhook, and Worker health.
- Add signed-out checkout redirect that preserves intended tier until login.
- Add UI copy for email confirmation state on `/pricing`.

## Approval Boundary

Do not activate billing, change Stripe products, change DNS, deploy, or update secrets without explicit approval.
