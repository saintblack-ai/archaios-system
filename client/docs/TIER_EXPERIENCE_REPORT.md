# ARCHAIOS Tier Experience Report

Generated: 2026-04-17

## Summary

Free, Pro, and Elite are now represented as explicit experience layers in the client. This makes the paid product easier to reason about before live Stripe activation.

## Tier Definitions

| Tier | Experience Name | Product Promise |
| --- | --- | --- |
| Free | Free Preview | Preview intelligence and upgrade when ready |
| Pro | Pro Command | Full daily briefing and premium dashboard access |
| Elite | Elite Priority | Priority signals, elite reports, and deeper analysis |

## Access Separation

| Capability | Guest | Signed-In Free | Pro | Elite |
| --- | --- | --- | --- | --- |
| Public landing | yes | yes | yes | yes |
| Pricing page | yes | yes | yes | yes |
| Dashboard shell | preview | preview | full | full |
| Checkout | no | yes | upgrade only | current/portal |
| Full daily briefing | no | no | yes | yes |
| AI tools | no | no | yes | yes |
| Saved history | no | limited | yes | yes |
| Priority signals | no | no | no | yes |
| Elite reports | no | no | no | yes |
| Billing portal | no | no | yes, when backend returns Stripe customer | yes, when backend returns Stripe customer |

## Local Code Changes

- `src/lib/subscription.js`
  - Added `TIER_EXPERIENCES`.
  - Added `getTierExperience()`.
  - Added `getAccountExperienceState()`.
  - Added `getFeatureGateState()`.
  - Added clearer capability flags for Pro and Elite access.

- `src/components/ProtectedContent.jsx`
  - Locked cards now use tier-aware messaging instead of generic inactive-subscription copy.

- `src/pages/Dashboard.jsx`
  - Displays current experience mode.
  - Separates guest preview from signed-in free mode.
  - Disables billing management unless paid billing is active.

- `src/pages/revenue/PricingPage.jsx`
  - Adds tier-specific experience copy.
  - Adds Stripe preparation status and manual verification requirements.

- `src/lib/platform.js`
  - Added `getRuntimeHostRoles()` to expose the host-role and checkout-prep state to the UI.

## Validation

Local validation to run:

- `node --test src/lib/subscription.test.js`
- `npm run build`

Expected result:

- Subscription tests pass.
- Vite production build completes.
- No billing is activated.
- No secrets are required in the frontend.

## What Still Depends On Stripe Setup

- Real checkout session creation.
- Real customer portal session creation.
- Stripe webhook processing.
- Supabase subscription row sync.
- Real Pro/Elite unlock after checkout.
- Production CORS/origin validation from the Vercel host.

## Recommended Next Test

Use Vercel primary host for live smoke testing once deployed:

- `/landing`
- `/pricing`
- `/dashboard`
- `/operator`

Use GitHub Pages only as a static backup route check.
