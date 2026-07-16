# ARCHAIOS Frontend/Backend Runtime

## Canonical Runtime

- Frontend: `client/` Vite React application.
- Backend: root `worker.js` Cloudflare Worker.
- Frontend host: GitHub Pages/static host for `client/dist`.
- Backend host: Cloudflare Worker named `archaios-saas-worker`.

Secondary systems are not production runtime targets: `server/`, `app/`, `ai-assassins/`, `ai-assassins-app/`, Supabase Edge Functions, legacy JavaScript/Python agents, and Swift applications.

## API Base URL

Browser code must use `VITE_API_BASE_URL`.

`VITE_BACKEND_URL` remains a legacy compatibility fallback only. Production frontend builds must not depend on localhost fallback behavior.

Centralized client module:

- `client/src/lib/api.js`
- `client/src/lib/platform.js`

## Local Development

```bash
npm ci
npm --prefix client ci
npm run dev:backend
npm run dev:frontend
```

Local frontend `.env` should set `VITE_API_BASE_URL` to the local Worker URL when testing locally. Do not commit local `.env` or `.dev.vars` files.

## Production Build

```bash
npm --prefix client ci
npm --prefix client run build
```

Worker validation:

```bash
node --check worker.js
npm run check:runtime-contract
npx wrangler deploy --config wrangler.toml --name archaios-saas-worker --dry-run
```

## Deployment Targets

- Frontend: deploy `client/dist` through the existing GitHub Pages workflow.
- Vercel preview frontend: repository root project using `npm --prefix client ci`, `npm --prefix client run build`, and `client/dist`.
- Backend: deploy `worker.js` with `npx wrangler deploy --config wrangler.toml --name archaios-saas-worker`.
- Pull requests run validation only. Do not deploy from pull requests.

## Required Variable Names

Frontend public variables:

- `VITE_API_BASE_URL`
- `VITE_BACKEND_URL` legacy fallback
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ADMIN_EMAIL`
- `VITE_PUBLIC_BUSINESS_LEGAL_NAME`
- `VITE_PUBLIC_EIN_STATUS`
- `VITE_PUBLIC_PRIVACY_POLICY_URL`
- `VITE_PUBLIC_TERMS_URL`
- `VITE_PUBLIC_REFUND_POLICY_URL`
- `VITE_PUBLIC_CONTACT_EMAIL`
- `VITE_ALPHA_VANTAGE_API_KEY`
- `VITE_NEWS_API_KEY`
- `VITE_ACLED_API_URL`
- `VITE_ACLED_API_KEY`
- `VITE_ACLED_EMAIL`
- `VITE_ALERT_WEBHOOK_URL`
- `VITE_ALERT_WEBHOOK_TOKEN`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_STRIPE_PRO_PRICE_ID`
- `VITE_STRIPE_ELITE_PRICE_ID`

Worker variables/secrets:

- `ALLOWED_ORIGINS`
- `ADMIN_EMAIL`
- `AUTH_TOKEN`
- `FRONTEND_URL`
- `LOCAL_TIMEZONE`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_USE_RESPONSES`
- `STRIPE_CHECKOUT_ACTIVE`
- `STRIPE_PRICE_ELITE`
- `STRIPE_PRICE_PRO`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_ANON_KEY`
- `SUPABASE_ACTIVE`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_URL`
- `WORKER_BASE_URL`
- `WORKER_RELEASE`

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, OpenAI server keys, or private paid-feed keys through `VITE_` variables.

`SUPABASE_ACTIVE` and `STRIPE_CHECKOUT_ACTIVE` must remain unset or false until the business, security, and infrastructure activation steps are approved.

## Degraded Mode

Public functions available without Supabase:

- Landing page
- Pricing display
- Architecture/status information
- Public demonstration SITREP data
- Frontend navigation
- `/api/health`, `/api/version`, `/api/status`

Supabase-dependent functions return controlled unavailable responses until activation:

- User authentication
- Personal dashboard data
- Subscriptions
- Alerts
- Persisted agent memory
- Stripe subscription synchronization

Controlled response:

```json
{
  "ok": false,
  "status": "temporarily_unavailable",
  "service": "supabase",
  "message": "This feature is awaiting infrastructure activation."
}
```

## Health Endpoints

- `GET /api/health`
- `GET /api/version`
- `GET /api/status`
- `GET /api/sitrep/latest`
- `GET /api/sitrep/sources`
- `GET /api/sitrep/map`

Post-deployment verification:

```bash
npm run verify:runtime
```

## Rollback

Frontend rollback:

1. Re-run the last known good GitHub Pages deployment from GitHub Actions, or revert the merge commit and let the Pages workflow redeploy.
2. Confirm frontend loads and points at the intended Worker URL.

Worker rollback:

1. Identify the last known good Worker version in Cloudflare.
2. Roll back through Cloudflare dashboard or redeploy the last known good commit with Wrangler.
3. Run `npm run verify:runtime` after rollback.

## Legacy And Experimental Systems

These systems may remain in the repository but are not production runtime targets for the public ARCHAIOS stack:

- `server/` Express APIs
- `app/` Next.js application
- `ai-assassins/`
- `ai-assassins-app/`
- Supabase Edge Functions
- Legacy JavaScript/Python agents
- Swift applications
