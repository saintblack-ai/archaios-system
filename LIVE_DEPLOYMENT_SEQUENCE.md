# Operation Skybridge Live Deployment Sequence

Date: 2026-07-02

Mission constraint: prepare live production without redesigning code or adding features. Do not deploy until the listed preflight checks pass.

## Deployment Goal

Make the public backend endpoint:

```text
https://archaios-saas-worker.quandrix357.workers.dev
```

serve the canonical `archaios-saas-worker` backend from root `wrangler.toml` and root `worker.js`.

## Preflight Requirements

- Cloudflare authentication restored
- Correct Supabase project ref confirmed
- Supabase Auth health passes
- Supabase service-role key available for Worker secret entry
- Stripe production products and prices confirmed
- Stripe webhook signing secret available for Worker secret entry
- Frontend production environment points to the public backend URL
- GitHub Actions Worker Heartbeat uses the hardened identity check
- No uncommitted production code changes

## Phase 1: Cloudflare Correction

Run from repository root:

```bash
npx wrangler --version
npx wrangler whoami
```

If `wrangler whoami` fails, restore authentication with one of these methods:

```bash
export CLOUDFLARE_API_TOKEN="<scoped-production-token>"
npx wrangler whoami
```

or:

```bash
npx wrangler login
npx wrangler whoami
```

Inspect the current production Worker:

```bash
npx wrangler deployments list --name archaios-saas-worker
npx wrangler secret list --name archaios-saas-worker
npx wrangler kv namespace list
npx wrangler d1 list
npx wrangler r2 bucket list
```

Inspect routes and custom domains in the Cloudflare dashboard or account API. The local configs do not declare routes or custom domains, so this state must be checked in the Cloudflare account.

Confirm the canonical root Worker bundle:

```bash
npx wrangler deploy --config wrangler.toml --name archaios-saas-worker --dry-run
```

Set production secrets on the Worker. Do not print secret values to the terminal.

```bash
npx wrangler secret put OPENAI_API_KEY --name archaios-saas-worker
npx wrangler secret put SUPABASE_URL --name archaios-saas-worker
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name archaios-saas-worker
npx wrangler secret put AUTH_TOKEN --name archaios-saas-worker
npx wrangler secret put STRIPE_SECRET_KEY --name archaios-saas-worker
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name archaios-saas-worker
```

If the canonical Worker uses Stripe price IDs directly, set them as secrets or vars according to the deployed code path:

```bash
npx wrangler secret put STRIPE_PRICE_PRO --name archaios-saas-worker
npx wrangler secret put STRIPE_PRICE_ELITE --name archaios-saas-worker
```

Deploy the canonical Worker from repository root:

```bash
npx wrangler deploy --config wrangler.toml --name archaios-saas-worker
```

Verify identity:

```bash
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
```

Required result:

```json
{
  "service": "archaios-saas-worker"
}
```

If the response still says `archaios-daily-automation`, check Cloudflare deployment history and routes. The production endpoint is still bound to the wrong artifact or route.

## Phase 2: Supabase Verification

Confirm the production project ref in Supabase before changing any environment variable.

Current configured ref:

```text
pedymtymubpirhaikymj
```

Current verified status:

```text
DNS ENOTFOUND for pedymtymubpirhaikymj.supabase.co
```

Verify the chosen project:

```bash
curl -fsS https://<project-ref>.supabase.co/auth/v1/health
```

Expected result:

```json
{
  "name": "GoTrue"
}
```

If the configured project ref is wrong, replace it in:

- Cloudflare Worker secret or var `SUPABASE_URL`
- Frontend production env `VITE_SUPABASE_URL`
- Any GitHub Pages or Vercel production env entry
- Any deployment documentation that still references `pedymtymubpirhaikymj`

Apply or verify migrations after the correct project is linked:

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push --linked
```

Verify pgvector and semantic memory with SQL in Supabase:

```sql
select extname from pg_extension where extname = 'vector';
select proname from pg_proc where proname = 'match_archaios_memory_chunks';
```

Verify Edge Functions:

```bash
npx supabase functions list
```

Required functions:

- `agent-orchestrator`
- `stripe-webhook`

## Phase 3: Stripe Verification

Confirm production mode in Stripe before setting Cloudflare secrets.

Required Stripe configuration:

- Product: Pro
- Product: Elite
- Price ID for Pro
- Price ID for Elite
- Webhook endpoint: `https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/webhook`
- Webhook events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`

Set or rotate production Worker secrets only after products and prices are confirmed:

```bash
npx wrangler secret put STRIPE_SECRET_KEY --name archaios-saas-worker
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name archaios-saas-worker
npx wrangler secret put STRIPE_PRICE_PRO --name archaios-saas-worker
npx wrangler secret put STRIPE_PRICE_ELITE --name archaios-saas-worker
```

Verification checks:

- `/api/pricing` returns Pro and Elite plans
- Signed-out frontend users cannot start checkout
- Signed-in users can create Checkout Sessions
- Stripe webhook events upsert Supabase subscription state
- `profiles.tier` aligns with active subscription access

## Phase 4: Frontend and Deployment Verification

GitHub Pages production requirements:

- Deploy from `client/`
- `VITE_BACKEND_URL=https://archaios-saas-worker.quandrix357.workers.dev`
- `VITE_SUPABASE_URL=https://<project-ref>.supabase.co`
- `VITE_SUPABASE_ANON_KEY` set as a secret
- No production fallback to localhost

Vercel production requirements:

- Project: `ai-assassins-client`
- Production deployment state: READY
- Runtime errors: none
- Environment variables match the same backend and Supabase project as GitHub Pages

Trigger the hardened GitHub Worker Heartbeat after Cloudflare correction:

```bash
gh workflow run worker_heartbeat.yml
```

or trigger it from the GitHub Actions UI.

Required result:

- Workflow succeeds only after `/api/health` reports `service: "archaios-saas-worker"`

## Deployment Sequence

1. Restore Cloudflare authentication.
2. Inventory Workers, routes, domains, secrets, KV, D1, R2, and Durable Object bindings.
3. Confirm the correct Supabase project ref.
4. Replace the unreachable Supabase ref everywhere production reads it.
5. Verify Supabase Auth, database migrations, pgvector, RPC, storage, and Edge Functions.
6. Confirm Stripe products, prices, webhook endpoint, and required events.
7. Set Cloudflare production secrets.
8. Dry-run the canonical root Worker deployment.
9. Deploy root `wrangler.toml` to `archaios-saas-worker`.
10. Verify `/api/health` service identity.
11. Verify `/api/pricing`.
12. Trigger GitHub Worker Heartbeat.
13. Verify frontend production env.
14. Run checkout smoke test with a signed-in account.
15. Run webhook test event from Stripe.
16. Confirm Supabase subscription and profile tier alignment.

## Rollback Strategy

Cloudflare Worker rollback:

```bash
npx wrangler deployments list --name archaios-saas-worker
npx wrangler rollback --name archaios-saas-worker
```

If rollback is not available for the target deployment, redeploy the last known good Worker artifact from the matching Git commit:

```bash
git checkout <last-known-good-commit>
npx wrangler deploy --config wrangler.toml --name archaios-saas-worker
```

Vercel rollback:

- Use the latest known READY production deployment as rollback candidate.
- Promote the rollback deployment from the Vercel dashboard or Vercel API.

Supabase rollback:

- Use migration rollback files where present.
- Take a database backup before applying production migrations.
- Roll back schema changes only after pausing webhook writes or confirming idempotent replay.

Stripe rollback:

- Do not delete products or prices.
- Disable incorrect prices from new purchases.
- Restore webhook endpoint secret if rotated incorrectly.
- Replay failed webhook events after backend recovery.

## Recovery Plan

If the backend is down:

1. Check Cloudflare Worker health.
2. Check Cloudflare deployment history.
3. Roll back Worker to last known good deployment.
4. Verify secrets still exist.
5. Run GitHub Worker Heartbeat.

If checkout fails:

1. Check `/api/health`.
2. Check `/api/pricing`.
3. Verify `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, and `STRIPE_PRICE_ELITE` are set.
4. Confirm user has a Supabase session.
5. Inspect Stripe Checkout Session creation errors without exposing secrets.

If webhooks fail:

1. Confirm endpoint URL.
2. Confirm webhook signing secret.
3. Replay failed events from Stripe.
4. Verify Supabase service-role secret.
5. Confirm subscription upsert table permissions.

If Supabase fails:

1. Confirm DNS for the project ref.
2. Confirm Auth health.
3. Confirm service-role key.
4. Confirm migrations.
5. Confirm pgvector and RPC.

## No-Go Conditions

- Public health still reports `archaios-daily-automation`
- Supabase project URL fails DNS
- Stripe price IDs are missing
- Stripe webhook secret is missing
- Frontend production env points to localhost
- GitHub Worker Heartbeat fails
- Supabase subscription state cannot be updated from webhook processing
