# Archaios Phase II Current State Report

Generated: 2026-06-19

## Executive Status

Archaios is a partially deployed SaaS/intelligence platform with a working Vite client, a Cloudflare Worker API, Supabase-backed auth/subscription design, Stripe checkout/webhook code, and several legacy or parallel runtimes. It is close to a paid beta, but it is not ready to accept paying customers without a final Stripe/Supabase production verification pass.

Current readiness estimate: 72%.

## What Exists

### Canonical Production Surface

- Frontend: `client/`, React + Vite, deployed through GitHub Pages workflow.
- Frontend host: `https://saintblack-ai.github.io/ai-assassins-client/`.
- Backend: root `worker.js`, Cloudflare Worker configured by root `wrangler.toml`.
- Backend host: `https://archaios-saas-worker.quandrix357.workers.dev`.
- Auth: Supabase browser auth in `client/src/lib/supabase.js`.
- Paid checkout: frontend calls `POST /api/stripe/checkout` through `client/src/agents/stripeAgent.js` and `client/src/lib/platform.js`.
- Stripe webhook: `POST /api/stripe/webhook` in root `worker.js`.
- Database migrations: root `sql/` plus `client/supabase/sql/`.
- GitHub Pages deploy workflow: `.github/workflows/deploy.yml`.

### Secondary / Legacy Surfaces

- Root Next.js app in `app/` with API routes, agents, Stripe routes, and Supabase libraries.
- Express backend in `server/`.
- Python agent/runtime modules under `archaios/`, `Archaios OS/`, `ai-assassins/`, and top-level agent files.
- Supabase edge functions under `supabase/functions/`.
- Additional Cloudflare/Worker packages under `archaios-agents/`, `client/worker/`, and `Archaios OS/cloudflare_worker/`.
- Static docs under `docs/` and `client/docs/`.
- macOS Swift control apps under `ArchaiosControl/` and `Archaios OS/archaios_mac_app/`.

## What Works

- `npm run build` in `client/` passes.
- Public Cloudflare Worker health endpoint returns HTTP 200.
- Public Cloudflare Worker pricing endpoint returns `free`, `pro`, and `elite` pricing.
- GitHub Pages root returns HTTP 200.
- Vercel alias `https://ai-assassins-client.vercel.app/` returns HTTP 200, but AGENTS.md marks GitHub Pages as canonical.
- `npm run check:env` passes for local OpenAI key presence without exposing the key.
- The frontend blocks signed-out checkout attempts in the UI.
- The Worker verifies Supabase bearer tokens for protected routes.
- The Worker has Stripe Checkout Session creation logic.
- The Worker verifies Stripe webhook signatures with HMAC and handles required events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Supabase migrations define the core launch tables: `profiles`, `subscriptions`, `alerts`, `leads`, `cta_events`, `revenue_events`, agent logs, content drafts, marketing queue, and related agent tables.

## What Is Broken Or Risky

- The public Worker health response does not match the local root `worker.js` health payload. The deployed Worker appears to be a different or newer daily automation Worker than the local checkout-focused Worker.
- Root `npm run build` starts `next build` but produced no further output for more than two minutes and was interrupted. Treat the root Next app as not verified.
- The frontend still displays launch-gated/business-onboarding copy in pricing, landing, dashboard, and app shell.
- Client diagnostics still report `billingMode: "prepared-not-activated"`.
- The live checkout path has not been verified with a real Supabase user and Stripe test subscription in this audit.
- `upsertSubscriptionRecord()` uses `on_conflict=user_id`. Some migrations create a unique `subscriptions(user_id)` index, but `client/supabase/sql/2026-04-14_production_core_tables.sql` only creates a non-unique index. If production lacks the unique constraint, webhook subscription upserts can fail.
- Public dashboard payload contains projected/sample revenue numbers. This is useful for demo mode but risky if shown as live revenue.
- Several social/news/stock/sitrep integrations still have mock or fallback behavior.
- Multiple runtimes define overlapping billing, agent, and API concepts, increasing deploy confusion.

## Missing Dependencies

No missing JavaScript dependencies were found for the canonical Vite client because `client` builds successfully.

Unverified dependency areas:

- Root Next app build did not complete.
- Python agent packages were not installed or tested.
- Swift/macOS app was not built.
- `wrangler deploy` was not executed during this audit.

## Missing Environment Variables

Required for frontend production:

- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Required for Cloudflare Worker:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY` or service role fallback for auth lookup
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ELITE`
- `OPENAI_API_KEY`

Recommended / optional:

- `ADMIN_EMAIL`
- `AUTH_TOKEN`
- `WORKER_BASE_URL`
- `FRONTEND_URL`
- `OPENAI_MODEL`
- `PRO_PRICE_USD`
- `ELITE_PRICE_USD`

Legal/business launch placeholders in `.env.example` are still empty:

- `BUSINESS_LEGAL_NAME`
- `PUBLIC_PRIVACY_POLICY_URL`
- `PUBLIC_TERMS_OF_SERVICE_URL`
- `PUBLIC_REFUND_POLICY_URL`
- `PUBLIC_CONTACT_EMAIL`

## Security Concerns

- Supabase service role key is used from the Worker, which is correct server-side, but must never be exposed to Vite client env.
- CORS behavior is inconsistent in observed output: local `worker.js` restricts to GitHub Pages, while the public Worker response returned `access-control-allow-origin: *`.
- Admin dashboard access depends on exact `ADMIN_EMAIL`; ensure this is set in Worker secrets or vars.
- Several agent execution routes depend on `AUTH_TOKEN`; if unset or weak, internal agent actions are exposed to risk.
- Public demo revenue projections should be clearly separated from real metrics.
- Stripe webhook signature verification exists, but idempotency/event logging should be hardened before scale.
- Deployment ambiguity across GitHub Pages, Vercel, root Next, server, and multiple Workers increases the chance of shipping the wrong artifact.

## Deployment Status

Observed on 2026-06-19:

| Surface | URL | Status | Notes |
|---|---|---:|---|
| GitHub Pages frontend | `https://saintblack-ai.github.io/ai-assassins-client/` | 200 | Canonical per AGENTS.md |
| Cloudflare Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` | 200 | Response differs from local root Worker health payload |
| Cloudflare Worker pricing | `https://archaios-saas-worker.quandrix357.workers.dev/api/pricing` | 200 | Returns current tier data |
| Vercel alias | `https://ai-assassins-client.vercel.app/` | 200 | Secondary/deprecated unless product strategy changes |
| Vercel pricing | `https://ai-assassins-client.vercel.app/pricing` | 200 | Static app response |

## Immediate Diagnosis

Archaios has enough infrastructure to begin a controlled test-mode checkout verification. It should not be marketed as live self-serve SaaS until:

1. The deployed Cloudflare Worker is confirmed to be the same Worker that contains checkout/webhook code.
2. Stripe test keys and price IDs are installed in Worker secrets.
3. Supabase production has the exact required schema and unique constraints.
4. A real Free -> Pro and Free -> Elite checkout cycle is completed.
5. Webhook sync proves `subscriptions.tier/status` and `profiles.tier` update correctly.
6. Launch-gated copy is replaced with production-ready legal/policy language.
