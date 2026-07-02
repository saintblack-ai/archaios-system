# Production Deployment Checklist

Generated: 2026-07-02

## Current Gate

- Readiness score: 68/100
- Required score to deploy: 90/100
- Release decision: NO-GO

## Already Complete

- [x] Git worktree was clean before final Iron Gate execution.
- [x] Required runtime files are present.
- [x] Production-facing placeholder scan is clear.
- [x] Client npm audit passes with 0 moderate-or-higher vulnerabilities.
- [x] Automated tests pass through Iron Gate.
- [x] Client production build passes.
- [x] Live GitHub repository is reachable.
- [x] Vercel linked project is reachable.
- [x] Latest Vercel production deployment is READY.
- [x] Vercel runtime error clusters were not found for the selected 7-day window.
- [x] Root Worker dry-run packaging succeeds.
- [x] Client Worker dry-run packaging succeeds.
- [x] Worker Heartbeat now validates service identity, not only HTTP 200.
- [x] Project Sentinel runs and reports actionable findings only.

## Blocks Production

- [ ] Cloudflare public backend must serve `service: "archaios-saas-worker"` from `/api/health`.
- [ ] Cloudflare Worker inventory must be verified with authenticated Wrangler access.
- [ ] Supabase project URL must resolve and return auth health.
- [ ] Supabase anon key must be verified for browser auth.
- [ ] Supabase service-role key must be verified for backend writes.
- [ ] Supabase pgvector migration must be confirmed as applied in the live project.
- [ ] Supabase semantic memory RPC must be confirmed in the live project.
- [ ] Stripe secret key must be available in an approved backend environment.
- [ ] Stripe webhook secret must be available in an approved backend environment.
- [ ] Stripe Pro and Elite price ids must be verified.
- [ ] Stripe webhook endpoint must be verified in Stripe Dashboard.
- [ ] Stripe test event delivery must sync `subscriptions` and `profiles.tier` in Supabase.
- [ ] Raw export inbox must receive an offline redaction/secret quarantine scan before promotion to production knowledge or semantic memory.

## Cloudflare Remediation

1. Authenticate Wrangler:
   - `wrangler login`, or
   - export `CLOUDFLARE_API_TOKEN` with least-privilege Workers read/deploy permissions.
2. Inventory current Worker:
   - `npx wrangler whoami`
   - `npx wrangler deployments list --name archaios-saas-worker`
   - `npx wrangler secret list --name archaios-saas-worker`
3. Confirm the currently deployed artifact source.
4. Confirm required secrets are present before deploying.
5. Deploy canonical Worker only after Supabase and Stripe checks pass:
   - `npx wrangler deploy --name archaios-saas-worker`
6. Verify:
   - `curl -sS https://archaios-saas-worker.quandrix357.workers.dev/api/health`
   - Expected: `service` equals `archaios-saas-worker`.

## Supabase Remediation

1. Confirm whether project ref `pedymtymubpirhaikymj` exists and is active.
2. If the ref is wrong, obtain the approved canonical project URL.
3. Verify:
   - `curl -sS https://<project-ref>.supabase.co/auth/v1/health`
4. Update approved environments only:
   - GitHub Actions `VITE_SUPABASE_URL`
   - GitHub Actions `VITE_SUPABASE_ANON_KEY`
   - Cloudflare `SUPABASE_URL`
   - Cloudflare `SUPABASE_SERVICE_ROLE_KEY`
5. Confirm migrations:
   - core production tables
   - subscription upsert contract
   - Archivist tables
   - semantic memory tables
   - pgvector extension
   - `match_archaios_memory_chunks` RPC

## Stripe Remediation

1. Verify backend environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_PRICE_PRO`
   - `STRIPE_PRICE_ELITE`
2. Verify Stripe Dashboard products and prices match Pro and Elite.
3. Verify webhook endpoint:
   - `https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/webhook`
4. Send required test events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
5. Verify Supabase sync after events.
6. Rerun Iron Gate from the approved environment.

## Final Pre-Deployment Gate

- [ ] `npm --prefix client run archaios:sentinel`
- [ ] `npm --prefix client run security:audit`
- [ ] `npm --prefix client run build`
- [ ] `npm --prefix client run iron-gate -- --run-tests --run-build --run-security-audit`
- [ ] Confirm readiness score is at least 90/100.
- [ ] Confirm no production blockers remain.
- [ ] Confirm GitHub Actions pass on the release commit.
- [ ] Confirm Cloudflare health service identity.
- [ ] Confirm Supabase auth/table/RPC health.
- [ ] Confirm Stripe checkout/webhook/subscription sync.

## Release Decision

No deployment is authorized while readiness remains below 90/100.
