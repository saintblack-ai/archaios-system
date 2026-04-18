# Stripe Product Mapping (Prep Only)

Generated: 2026-04-17

## Billing State

- Live billing activated: no
- Test billing activated: no
- This file is preparation only.

## Tier Mapping

| Tier | Intended Price | Stripe Product Key | Stripe Price Env Placeholder | Status |
| --- | --- | --- | --- | --- |
| Free | $0 | `archaios_free` | n/a | active preview |
| Pro | $49/mo | `archaios_pro` | `VITE_STRIPE_PRO_PRICE_ID` | pending test key wiring |
| Elite | $99/mo | `archaios_elite` | `VITE_STRIPE_ELITE_PRICE_ID` | pending test key wiring |

## Webhook Requirements

1. Checkout completed event handling for subscription tier sync.
2. Subscription updated/canceled event handling for downgrade safety.
3. Signature verification via `STRIPE_WEBHOOK_SECRET`.

## Safety

- No billing activation until explicit user approval.
- No secret values stored in repo.
