# ARCHAIOS Next Actions

Generated: 2026-04-17

## Current Safe State

- Vercel remains primary app host.
- GitHub Pages remains static backup shell.
- Cloudflare Worker remains backend/API/health layer.
- Free / Pro / Elite separation is implemented with explicit guest and signed-in free states.
- Stripe is in test-prep mode only.

## Immediate Validation Tasks

1. Verify guest flow:
   - Pricing loads.
   - Checkout prompts sign-in instead of proceeding.
2. Verify signed-in free flow:
   - Dashboard mode shows `Signed-In Free`.
   - Upgrade prompts target Pro first, then Elite.
3. Verify Pro/Elite messaging:
   - Pro explains full briefing and AI tool unlock.
   - Elite explains priority signals and elite reports.
4. Verify operator clarity:
   - Operator page messaging remains infrastructure-only.

## Stripe Test-Mode Tasks (No Activation)

1. Confirm Worker checkout endpoints respond in test mode.
2. Confirm webhook handler updates Supabase subscription state.
3. Confirm successful checkout reflects in `/api/subscription`.
4. Confirm customer portal routing works only for paid states.
5. Keep billing disabled in live mode until test checklist is fully green.

## Documentation and Reporting

- Keep `docs/AUTH_AND_GATING_PLAN.md` as source for account-state behavior.
- Keep `docs/STRIPE_TEST_PREP.md` as source for checkout/webhook/sync requirements.
- Update `system_status.md` after each live verification pass.
- Update `logs/live-route-check.log` after each network-enabled route check.

## Explicitly Blocked

- Deploying production changes without approval.
- DNS changes.
- Secret value edits in source files.
- Live Stripe billing activation.
