# Stripe Setup

## Target Plans

- Pro: `$49/month`
- Elite: `$99/month`

## Required Stripe Objects

Create in Stripe test mode first:

1. Product: `AI Assassins Pro`
2. Recurring monthly Price: `$49`
3. Product: `AI Assassins Elite`
4. Recurring monthly Price: `$99`

Store resulting price IDs:

```text
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_ELITE=price_...
```

## Required Worker Secrets

```bash
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
```

## Required Worker Vars

```text
SUPABASE_URL=
SUPABASE_ANON_KEY=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_ELITE=
```

## Webhook Events

Configure the Stripe webhook endpoint to the deployed Worker route:

```text
https://<worker-domain>/api/stripe/webhook
```

Subscribe to:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Test Checklist

1. Use Stripe test mode.
2. Start Pro checkout from dashboard.
3. Complete checkout with test card.
4. Verify webhook delivery succeeds.
5. Verify `public.subscriptions` has tier `pro`, status `active` or `trialing`.
6. Repeat for Elite.
7. Verify dashboard unlocks paid content after `/api/subscription` refresh.
8. Verify Billing Portal opens for active customer.
9. Verify cancellation updates subscription status.
10. Only then prepare production mode.

