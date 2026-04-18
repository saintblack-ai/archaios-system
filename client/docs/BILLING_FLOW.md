# Billing Flow

## Checkout Flow

```text
Dashboard Upgrade Button
  -> startStripeCheckout()
  -> POST /api/stripe/create-checkout-session or /api/stripe/checkout
  -> Worker creates Stripe Checkout Session
  -> Browser redirects to Stripe
  -> Stripe redirects to success/cancel URL
  -> Dashboard polls subscription state
  -> Stripe webhook persists subscription
```

## Webhook Flow

```text
Stripe event
  -> POST /api/stripe/webhook
  -> Verify stripe-signature
  -> Extract user_id and tier from metadata
  -> Normalize subscription status
  -> Upsert public.subscriptions
  -> Log webhook result
```

## Billing Portal Flow

```text
Dashboard Manage Billing
  -> POST /api/stripe/customer-portal
  -> Worker finds latest subscription/customer
  -> Stripe creates billing portal session
  -> Browser redirects to Stripe portal
```

## Gating Flow

```text
Supabase session
  -> GET /api/subscription
  -> normalizeSubscriptionRecord()
  -> getContentAccessState()
  -> ProtectedContent / dashboard feature locks
```

## Upgrade / Downgrade Path

Use the Stripe Customer Portal for phase one. Direct in-app upgrade/downgrade APIs can be added later if needed, but the Portal reduces compliance and billing edge cases.

