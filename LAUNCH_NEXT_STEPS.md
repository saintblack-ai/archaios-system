# Launch Next Steps

Follow these steps in this exact order.

## 1. Secrets to set

### A. Set Cloudflare Worker secrets
Run these commands from the repo root:

```bash
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
```

When each command prompts you, paste the real secret value and press `Enter`.

### B. Set Cloudflare Worker vars
Click path:

`Cloudflare Dashboard -> Workers & Pages -> archaios-saas-worker -> Settings -> Variables`

Add these plain-text variables:

- `SUPABASE_URL` = your Supabase project URL
- `SUPABASE_ANON_KEY` = your Supabase anon key
- `STRIPE_PRICE_PRO` = your Stripe Pro price ID
- `STRIPE_PRICE_ELITE` = your Stripe Elite price ID
- `ADMIN_EMAIL` = your admin email address

### C. Set GitHub Pages frontend vars and secret
Click path:

`GitHub -> your repo -> Settings -> Secrets and variables -> Actions`

Add these under `Variables`:

- `VITE_SUPABASE_URL` = your Supabase project URL
- `VITE_BACKEND_URL` = `https://archaios-saas-worker.quandrix357.workers.dev`
- `VITE_ADMIN_EMAIL` = your admin email address

Add this under `Secrets`:

- `VITE_SUPABASE_ANON_KEY` = your Supabase anon key

## 2. Supabase SQL to apply

Open:

`Supabase Dashboard -> SQL Editor -> New query`

Then paste the full contents of this file:

`client/supabase/sql/2026-04-14_production_core_tables.sql`

Then click:

`Run`

## 3. Deploy command

### A. Deploy the backend worker
Run this from the repo root:

```bash
npx wrangler deploy --name archaios-saas-worker
```

### B. Deploy the frontend
Click path:

`GitHub -> your repo -> Actions -> Build and Deploy Frontend -> Run workflow -> Run workflow`

## 4. How to test after deploy

### A. Check backend health
Run:

```bash
curl https://archaios-saas-worker.quandrix357.workers.dev/api/health
```

You should see:

```json
{"ok":true}
```

### B. Check the frontend loads
Open:

`https://saintblack-ai.github.io/ai-assassins-client/`

### C. Check the new dashboard route
Open:

`https://saintblack-ai.github.io/ai-assassins-client/dashboard`

Sign in and confirm that:

- your plan and status show on screen
- `Upgrade to Pro` and `Upgrade to Elite` buttons appear
- locked content shows when the subscription is inactive
- unlocked content shows when the subscription is active

### D. Check the hidden admin route
Open:

`https://saintblack-ai.github.io/ai-assassins-client/admin`

Sign in with the same email you set in `ADMIN_EMAIL` and `VITE_ADMIN_EMAIL`.

Confirm that you can see:

- total users
- active subscriptions
- webhook logs
