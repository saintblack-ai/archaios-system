# AGENTS.md

## Deployment

- Frontend repo: `client/`
- Frontend host: `https://saintblack-ai.github.io/ai-assassins-client/`
- Backend host: `https://archaios-saas-worker.quandrix357.workers.dev`
- Frontend production env must set `VITE_BACKEND_URL` to the public backend URL.
- Frontend production code must not rely on `localhost` fallback behavior.
- Deploy frontend from `client/` with the existing GitHub Pages workflow.
- Deploy backend from repo root with `npx wrangler deploy --name archaios-saas-worker`.

## Auth Workflow

- Frontend auth uses Supabase browser auth only.
- Client code must use `import.meta.env` for browser configuration.
- Signed-out users can view the dashboard shell but must not start paid checkout.
- If sign-up requires confirmation, keep the requested checkout tier in local storage and retry after confirmation and sign-in.
- Backend auth-protected routes expect a Supabase bearer token from the frontend session.

## Payment Workflow

- Paid plans are `pro` and `elite`.
- Frontend starts checkout through `POST /api/stripe/checkout`.
- Signed-out checkout requests should be blocked in the UI before redirect.
- Stripe webhook endpoint: `POST /api/stripe/webhook`
- Required Stripe events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Webhook processing must upsert Supabase subscription state and keep `profiles.tier` aligned with active access.

## Health Checks

- Public health endpoint: `https://archaios-saas-worker.quandrix357.workers.dev/api/health`
- Use the health endpoint first when checkout, leads, or dashboard panels fail.
- If health is up and checkout still fails, verify Stripe secrets and price ids.
- If health is up and dashboard auth fails, verify Supabase service-role configuration and bearer-token handling.
