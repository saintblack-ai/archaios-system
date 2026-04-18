# Stripe Setup

## Cloudflare Worker webhook URL

Use this exact webhook URL in Stripe:

`https://archaios-saas-worker.<subdomain>.workers.dev/api/stripe/webhook`

The deployed Worker name is `archaios-saas-worker`.

## Stripe dashboard clicks

1. Open [Stripe Dashboard](https://dashboard.stripe.com/).
2. Open the payment link or checkout configuration for the AI Assassins membership product.
3. Set the post-checkout redirect to your deployed dashboard success URL:
   - `https://<your-domain>/dashboard.html?checkout=success`
4. Set the cancel redirect to:
   - `https://<your-domain>/dashboard.html?checkout=cancel`
5. Keep the price at `$19.99/month`.
6. Save the payment link.

## Stripe webhook clicks

1. Open [Stripe Dashboard](https://dashboard.stripe.com/).
2. Go to `Developers` -> `Webhooks/Event Destinations`.
3. Click `Add endpoint`.
4. Paste `https://archaios-saas-worker.<subdomain>.workers.dev/api/stripe/webhook`.
5. Click `Select events`.
6. Add these events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
7. Click `Add endpoint`.

## Signing secret

After the endpoint is created, open it and click `Reveal` under the signing secret. Copy the `whsec_...` value into `STRIPE_WEBHOOK_SECRET`.

For `STRIPE_SECRET_KEY`, go to `Developers` -> `API keys` and reveal the Secret key. In Sandbox it starts with `sk_test_...`. In Live mode it starts with `sk_live_...`.

Repeat the same setup in `Live` mode after you confirm it works in `Test` mode.

## Required Cloudflare Worker secrets

Set these on `archaios-saas-worker`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTH_TOKEN` (optional)

Set these Worker config values for tier mapping:

- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ELITE`
- `STRIPE_PRICE_ENTERPRISE`

## Wrangler secret setup + deploy

Run:

```bash
cd "/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019"
./scripts/stripe-cloudflare-setup.sh
./scripts/smoke-test-worker.sh
```

## Smoke test

```bash
curl -sS https://archaios-saas-worker.<subdomain>.workers.dev/api/health
curl -sS https://archaios-saas-worker.<subdomain>.workers.dev/api/agents/status
curl -i -X POST https://archaios-saas-worker.<subdomain>.workers.dev/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{}'
```
