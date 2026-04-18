# ARCHAIOS Stripe Status

Generated: 2026-04-16

Stripe products, prices, and webhook endpoints were not externally verified because Stripe API credentials were not available in the shell and the audit stopped at the credential boundary.

## Local Stripe Implementation Evidence

### ai-assassins-client

- Client pricing model exists in `src/lib/pricing.js`.
- Pricing targets documented locally:
  - Pro: `$49/month`
  - Elite: `$99/month`
- Checkout client path exists through `src/agents/stripeAgent.js` and `src/lib/platform.js`.
- Worker checkout/webhook/customer portal logic exists in `worker/index.js`.
- Setup docs exist:
  - `docs/STRIPE_SETUP.md`
  - `docs/BILLING_FLOW.md`
  - `docs/REVENUE_IMPLEMENTATION_STATUS.md`
- Expected Worker endpoint:
  - `POST /api/stripe/checkout`
  - `POST /api/stripe/webhook`
  - Billing portal route exists in Worker code.

### Ai-Assassins

- Worker Stripe integration exists under `worker/src/index.ts` and legacy worker modules.
- Expected endpoints from README:
  - `POST /api/stripe/checkout-session`
  - `POST /api/stripe/webhook`
- Required vars:
  - `STRIPE_PRICE_ID_PRO`
  - `STRIPE_PRICE_ID_ELITE`
- Required secrets:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
- Risk:
  - `worker/wrangler.toml` has empty Stripe price placeholders.

### saintblack-ai.github.io

- Next-style Stripe helpers detected:
  - `app/lib/stripe.ts`
  - `app/lib/stripeTier.ts`
  - `app/api/create-checkout-session/route.ts`
- Required env:
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_PRO`
  - `STRIPE_PRICE_ELITE`
  - `NEXT_PUBLIC_SITE_URL`
- Safety flag:
  - `ALLOW_STRIPE_LIVE_CREATE`

## Expected Stripe Setup

Products/prices expected:

- Product: AI Assassins Pro
  - Monthly recurring price: `$49.00`
  - Env name: `STRIPE_PRICE_ID_PRO`
- Product: AI Assassins Elite
  - Monthly recurring price: `$99.00`
  - Env name: `STRIPE_PRICE_ID_ELITE`

Webhook endpoint expected:

- `POST https://<canonical-worker-domain>/api/stripe/webhook`

Webhook events expected:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Verification Not Completed

Not verified:

- Whether Pro and Elite Stripe products exist.
- Whether Pro and Elite monthly recurring prices exist.
- Whether price IDs match repo environment variables.
- Whether webhook endpoint exists in Stripe.
- Whether webhook signing secret matches the deployed Worker.
- Whether Stripe customer portal is configured.

## Issues By Severity

### Block

- `STRIPE_API_KEY` / `STRIPE_SECRET_KEY` unavailable in shell.
- Price IDs are not externally verified.
- Webhook endpoint is not externally verified.

### Warning

- Multiple env naming patterns exist across repos:
  - `STRIPE_PRICE_PRO`
  - `STRIPE_PRICE_ELITE`
  - `STRIPE_PRICE_ID_PRO`
  - `STRIPE_PRICE_ID_ELITE`
- `Ai-Assassins` docs and code contain older or alternate billing references that need alignment with the `$49` / `$99` target.

### Informational

- The architecture uses the recommended subscription pattern: Stripe Billing plus Checkout Sessions.
- Customer portal support is present in current Worker code.

## Next Actions

- Authenticate Stripe read-only CLI/API access.
- List products and prices; confirm Pro is `$49/month` and Elite is `$99/month`.
- Confirm webhook URL points to the canonical Worker.
- Set `STRIPE_PRICE_ID_PRO` and `STRIPE_PRICE_ID_ELITE` consistently.
- Set `STRIPE_WEBHOOK_SECRET` only as a Worker secret, never in frontend code.

