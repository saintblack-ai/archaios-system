# Revenue Execution Map

Generated: 2026-04-17

## Objective

Track revenue-oriented systems prepared for build execution without enabling live billing.

## Execution Artifacts

- `revenue/execution/saas-tier-system.md`
- `revenue/execution/saint-black-music-funnels.md`
- `revenue/execution/apple-books-funnels.md`
- `revenue/execution/intelligence-report-products.md`
- `revenue/execution/digital-bundle-products.md`

## Revenue Systems and Ownership

| Revenue System | Primary Agent | Build Readiness | Dependency Level | Notes |
| --- | --- | --- | --- | --- |
| SaaS tier system (Free/Pro/Elite) | Revenue Agent | High | Medium | UI and gating scaffolds exist; Stripe test config placeholders required. |
| Apple Books funnel | Content Agent + Revenue Agent | High | Low | Messaging and CTA flows can run with link placeholders now. |
| Saint Black music funnel | Content Agent + Revenue Agent | Medium | Medium | Needs unified content cadence and landing variant tracking. |
| Intelligence report products | Product Agent + Revenue Agent | Medium | Medium | Requires packaging cadence and operator workflow. |
| Digital bundle products | Revenue Agent + Product Agent | Medium | Medium | Requires bundle definitions and entitlement matrix. |

## Build Readiness Definitions

- High: can be implemented now with current local architecture and placeholders.
- Medium: requires one additional internal dependency alignment pass.
- Low: requires external integration approval boundary.

## Current Dependencies

- Stripe test mode planning docs only (no live billing):
  - `docs/STRIPE_PREP_PLAN.md`
  - `docs/STRIPE_TEST_PREP.md`
  - `docs/STRIPE_TEST_RESULTS.md`
- Tier/gating planning:
  - `docs/AUTH_AND_GATING_PLAN.md`
  - `docs/TIER_EXPERIENCE_REPORT.md`
- Project/revenue maps:
  - `projects/project_index.md`
  - `revenue/revenue_streams.md`

## Permission Boundary Status

- Allowed now:
  - local pricing logic
  - tier separation wiring
  - checkout placeholder interfaces
  - conversion content pipeline
- Blocked until explicit approval:
  - live billing activation
  - real payment processing
  - production credential changes

## Next Revenue Build Sequence

1. Finalize tier entitlement JSON used by dashboard lock/unlock rules.
2. Wire Stripe test checkout endpoint placeholders to Pro and Elite actions.
3. Add subscription sync simulation path for post-checkout state.
4. Add conversion event logs into `logs/` and dashboard metrics model.
5. Create operator checklist for pre-live billing activation.

