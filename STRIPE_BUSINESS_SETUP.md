# STRIPE BUSINESS SETUP

Audit date: 2026-06-10
Purpose: Prepare Stripe for ARCHAIOS / AI Assassins recurring revenue after business formation.

## Current Stripe Status

Live billing remains paused.

Technical evidence exists for:

- `POST /api/stripe/checkout`
- `POST /api/stripe/create-checkout-session`
- `POST /api/stripe/webhook`
- `POST /api/stripe/customer-portal`
- `POST /api/stripe/customer_portal`
- subscription tier sync to Supabase
- Pro and Elite pricing references

Known risks:

- Stripe products/prices are not externally verified.
- Stripe webhook endpoint/signing secret are not externally verified.
- Unauthenticated checkout probe previously returned HTTP `500` with `Unauthorized` body.
- Env names drift across repos.
- Live activation is correctly blocked until business formation is complete.

## Product Plan

| Product | Price | Billing | Status |
| --- | ---: | --- | --- |
| AI Assassins Free | $0 | No checkout | Preview shell |
| AI Assassins Pro | $49/mo | Recurring subscription | Pending Stripe verification |
| AI Assassins Elite | $99/mo | Recurring subscription | Pending Stripe verification |

## Required Stripe Business Profile Data

Stripe verification requirements vary by country, business type, capability, and risk. Stripe can require information about the company, the representative, beneficial owners, tax ID, ID documents, address proof, and bank account details.

Source: https://docs.stripe.com/connect/identity-verification

| Field | Status | Notes |
| --- | --- | --- |
| Legal business name | Waiting | Must match LLC |
| Business type | Waiting | Company/LLC after formation |
| EIN / tax ID | Waiting | Obtain after LLC acceptance |
| Business address | Needed | Must be consistent |
| Business website | Partial | Needs policies |
| Product description | Drafted | AI SaaS intelligence dashboard and automation tools |
| Representative name/DOB/address | Needed | Do not store in repo |
| Beneficial owner data | Needed if applicable | Depends on ownership |
| Bank account | Waiting | Business checking required |
| Support email | Needed | Publish before activation |
| Support phone/address | Needed or optional depending setup | Use consistent business contact |
| Statement descriptor | Needed | Example: `AI ASSASSINS` or `ARCHAIOS AI` |

## Required Stripe Technical Configuration

| Item | Desired Standard | Current Finding |
| --- | --- | --- |
| Pro price env | `STRIPE_PRICE_PRO` or normalized `STRIPE_PRICE_ID_PRO` | Both naming patterns appear |
| Elite price env | `STRIPE_PRICE_ELITE` or normalized `STRIPE_PRICE_ID_ELITE` | Both naming patterns appear |
| Secret key | Worker secret only | Referenced in docs/code |
| Webhook secret | Worker secret only | Referenced in docs/code |
| Publishable key | Frontend only if Stripe.js used | Optional |
| Webhook URL | `https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/webhook` or branded API domain | Needs Stripe dashboard verification |

## Required Webhook Events

Required by ARCHAIOS operating instructions:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Additional event referenced in docs/functions:

- `invoice.payment_succeeded`

## Live Activation Gate

Do not enable live checkout until:

1. LLC accepted.
2. EIN issued.
3. Business bank connected.
4. Stripe business profile verified.
5. Public website has Terms, Privacy, Refund/Cancellation, and support contact.
6. Pro and Elite products/prices exist in Stripe.
7. Worker secrets are set in production.
8. Test checkout creates a checkout session for authenticated user.
9. Signed webhook updates Supabase `subscriptions`.
10. `profiles.tier` aligns with subscription state.
11. Customer portal opens for a paid user.
12. Failed payment handling is documented.

## Recommended Stripe Env Standard

Choose one internal standard before go-live:

| Purpose | Recommended Env |
| --- | --- |
| Pro monthly price | `STRIPE_PRICE_PRO` |
| Elite monthly price | `STRIPE_PRICE_ELITE` |
| Stripe secret | `STRIPE_SECRET_KEY` |
| Webhook signing secret | `STRIPE_WEBHOOK_SECRET` |
| Optional publishable key | `VITE_STRIPE_PUBLISHABLE_KEY` |

Do not put `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in frontend env files.

## Readiness Assessment

Stripe business setup readiness: 45 / 100

Blockers:

- LLC/EIN/bank are not complete.
- Product/price IDs are not externally verified.
- Webhook endpoint/signing secret are not externally verified.
- Policies and support contact are not published.
- Test checkout/webhook sync are not complete.
