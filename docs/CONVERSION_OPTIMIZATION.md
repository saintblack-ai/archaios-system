# Conversion Optimization (Local Only)

Updated: 2026-04-17 (America/Chicago)

## Objective
Maximize conversion readiness in local UX before enabling real billing.

## Completed UX Hardening

### Dashboard
- Tier state is now more explicit for Guest / Signed-In Free / Pro / Elite.
- Locked-state messaging now explains exactly why access is limited.
- Upgrade CTAs now include pricing directly:
  - `Upgrade to Pro ($49/mo)`
  - `Upgrade to Elite ($99/mo)`
- Signals UX now distinguishes:
  - preview signals (visible)
  - locked priority lanes (upgrade-gated)
- Checkout blocked-by-auth guidance is clearer and action-oriented.

### Pricing
- Value proposition and urgency language tightened around daily signal windows.
- Added local email capture persistence (`localStorage`) for "Save your access".
- Added explicit confirmation feedback after saving email locally.
- Added checkout simulation panel that shows:
  - selected upgrade intent tier
  - what unlocks at that tier
  - what remains locked
  - auth requirement status
- Added intent persistence for upgrade tier selection in local browser storage.

## Storage Keys Used
- `archaios_saved_access_email`
- `archaios_saved_access_timestamp`
- `archaios_upgrade_intent_tier`

## Safety Constraints Preserved
- No deploy
- No DNS changes
- No environment/secret changes
- No Stripe live activation

## Validation
- Build must pass locally via `npm run build` in `client/`.
