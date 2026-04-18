# Vercel And Local Environment Variables

## Vercel

Add these in:

`Vercel Dashboard -> Project -> Settings -> Environment Variables`

Required:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ELITE`
- `ADMIN_EMAIL`
- `OPENAI_API_KEY`

Optional:

- `OPENAI_MODEL`
  - Example: `gpt-4o-mini`
- `WORKER_BASE_URL`
- `WORKER_AUTH_TOKEN`
- `STRIPE_PRICE_ENTERPRISE`
- `STRIPE_PRICE_ID`
- `PRICE_ID`

## Local `.env`

Add these to your local `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ELITE=
ADMIN_EMAIL=
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
WORKER_BASE_URL=
WORKER_AUTH_TOKEN=
```

## Worker

No new worker variables are required for this phase.

The new AI endpoint runs in the Vercel app, not in the Cloudflare worker.
