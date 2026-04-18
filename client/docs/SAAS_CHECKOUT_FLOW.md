# SaaS Checkout Flow (Prep Only)

## Checkout Mapping (Test/Placeholder)
- Free: no checkout session
- Pro: maps to `STRIPE_PRICE_PRO_MONTHLY` (placeholder env var)
- Elite: maps to `STRIPE_PRICE_ELITE_MONTHLY` (placeholder env var)

## User Flows
1. Free -> Pro
   - User clicks Pro CTA
   - Frontend posts to `/api/stripe/checkout` with `tier=pro`
   - Backend validates session and resolves test price ID
   - Backend returns checkout URL/session ID
   - Post-checkout redirect to dashboard with tier sync check

2. Free -> Elite
   - Same flow with `tier=elite`

3. Pro -> Elite
   - Billing management or plan-upgrade checkout path
   - Sync subscription status before unlocking Elite views

4. Paid -> downgrade/cancel
   - Route user through billing management link
   - Keep downgrade logic non-destructive; apply at next billing boundary

## Webhook Prep
- Required endpoint: `/api/stripe/webhook`
- Required event handling (test mode):
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- On event:
  - Resolve user
  - Update tier record
  - Update entitlement flags

## Local-only Status
- Flow fully documented and wired for test placeholders.
- No live billing activation.
