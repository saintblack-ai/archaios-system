# Commander Production Monitor

Date: 2026-07-02

Mission constraint: no new agent, no feature expansion, no redesign. This document defines how the existing Commander should monitor live production every morning.

## Purpose

Commander acts as the Executive Officer for production readiness. Its daily job is to collect verified operational signals, classify risk, and produce one concise morning report.

Commander must not expose secrets. It reports only health, presence, status, counts, and actionable failures.

## Morning Executive Brief

Required sections:

1. Readiness Score
2. Cloudflare
3. GitHub
4. Supabase
5. Stripe
6. Deployments
7. Revenue
8. Errors
9. Security
10. Health
11. Required Actions

## Signal Contract

Every monitored system returns this structure:

```json
{
  "system": "cloudflare",
  "status": "green|yellow|red",
  "summary": "Short operational summary",
  "evidence": ["Verified check or endpoint"],
  "actionableFindings": [
    {
      "severity": "low|medium|high|critical",
      "finding": "Concrete problem",
      "recommendedFix": "Concrete next action"
    }
  ],
  "lastCheckedAt": "ISO-8601 timestamp"
}
```

Commander merges these reports into a single brief and suppresses non-actionable noise.

## Cloudflare Monitor

Checks:

- Public health endpoint responds
- Health service identity equals `archaios-saas-worker`
- `/api/pricing` responds
- Worker deployment history is reachable
- Worker secrets list is reachable
- Routes and custom domains are confirmed
- KV, D1, R2, and Durable Object bindings are inventoried

Commands:

```bash
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/pricing
npx wrangler deployments list --name archaios-saas-worker
npx wrangler secret list --name archaios-saas-worker
npx wrangler kv namespace list
npx wrangler d1 list
npx wrangler r2 bucket list
```

Red conditions:

- Health endpoint down
- Health reports any service other than `archaios-saas-worker`
- Required secrets missing
- Production route points to wrong Worker

Current known blocker:

- Public endpoint reports `archaios-daily-automation`, proving the live Worker artifact does not match the expected canonical service identity.

## GitHub Monitor

Checks:

- Latest Worker Heartbeat status
- Latest frontend deployment workflow status
- Default branch protection if available
- Open production-blocking issues or pull requests
- Recent failed CI runs

Commands or APIs:

```bash
gh run list --limit 10
gh workflow list
gh workflow run worker_heartbeat.yml
```

Red conditions:

- Worker Heartbeat fails
- Deployment workflow fails
- Default branch cannot produce a clean build

Current known risk:

- Recent green Worker Heartbeat runs predate the hardened service-identity check. A fresh run is required after Cloudflare correction.

## Supabase Monitor

Checks:

- Project DNS resolves
- Auth health responds
- Service-role environment variable is present in backend runtime
- Anon key is present in frontend runtime
- Required migrations are applied
- `vector` extension exists
- `match_archaios_memory_chunks` RPC exists
- Edge Functions are deployed
- Storage buckets are available if document ingestion is enabled

Commands:

```bash
curl -fsS https://<project-ref>.supabase.co/auth/v1/health
npx supabase functions list
```

SQL checks:

```sql
select extname from pg_extension where extname = 'vector';
select proname from pg_proc where proname = 'match_archaios_memory_chunks';
```

Red conditions:

- Project URL fails DNS
- Auth health fails
- pgvector is missing
- Subscription tables are missing
- Webhook writes cannot update subscription state

Current known blocker:

- Configured project `pedymtymubpirhaikymj.supabase.co` fails DNS resolution.

## Stripe Monitor

Checks:

- Production mode confirmed
- Pro product exists
- Elite product exists
- Pro price ID configured
- Elite price ID configured
- Webhook endpoint configured
- Required webhook events enabled
- Recent webhook failures
- Monthly recurring revenue
- Active subscription count
- Failed invoice count

Required webhook endpoint:

```text
https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/webhook
```

Required events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Red conditions:

- Stripe secret missing
- Price ID missing
- Webhook secret missing
- Webhook endpoint points to non-production backend
- Subscription events fail to sync Supabase

Current known risk:

- Stripe live account state has not been verified because no authenticated Stripe access was available during Skybridge inspection.

## Deployment Monitor

Checks:

- Cloudflare Worker production deployment identity
- GitHub Pages production deployment status
- Vercel production deployment status
- Vercel runtime errors
- Frontend production env values
- Backend production env values

Known Vercel production state:

- Project `ai-assassins-client`
- Latest production deployment inspected: READY
- Runtime errors in last seven days: none found

Yellow condition:

- Vercel deploys from `saintblack-ai/ai-assassins-client` while this operational audit runs in `saintblack-ai/archaios-system`. Commander should report cross-repository drift until both repos are reconciled for production.

## Revenue Monitor

Checks:

- `/api/pricing` returns Free, Pro, and Elite plans
- Stripe active subscriptions
- Stripe MRR
- Failed payments
- Recent checkout sessions
- Supabase subscription records updated in the last 24 hours

Red conditions:

- Pricing endpoint down
- Checkout cannot create a session for a signed-in user
- Webhook sync does not update Supabase

## Security Monitor

Checks:

- Sentinel actionable findings
- npm audit result
- Missing production secrets
- Leaked secrets in tracked files
- Broken imports
- Dead production routes
- Duplicate Worker names

Commands:

```bash
npm --prefix client run archaios:sentinel
npm --prefix client run security:audit
```

Current known finding:

- Sentinel previously reported one medium finding: raw export inbox requires quarantine scanning because `client/ARCHAIOS_INFRASTRUCTURE/inbox` exists.

## Readiness Scoring

Commander should score production readiness from 0 to 100:

- Cloudflare identity and routing: 20 points
- Supabase project health: 20 points
- Stripe billing health: 15 points
- Deployment integrity: 15 points
- Security checks: 10 points
- GitHub and CI health: 10 points
- Documentation and runbook completeness: 5 points
- Revenue smoke test: 5 points

Automatic red cap:

- If Cloudflare health reports the wrong service identity, maximum score is 75.
- If Supabase project DNS fails, maximum score is 70.
- If Stripe checkout cannot be verified, maximum score is 85.
- If both Cloudflare identity and Supabase DNS fail, maximum score is 68.

## Morning Report Template

```markdown
# Commander Executive Brief

Date:
Readiness Score:
Recommendation: GO | NO-GO

## Situation

One-paragraph operational summary.

## System Status

| System | Status | Evidence | Action |
| --- | --- | --- | --- |
| Cloudflare |  |  |  |
| GitHub |  |  |  |
| Supabase |  |  |  |
| Stripe |  |  |  |
| Deployments |  |  |  |
| Revenue |  |  |  |
| Security |  |  |  |

## Required Actions

1. Highest priority action.
2. Next action.
3. Next action.
```

## Current Skybridge Morning Brief

Readiness recommendation: NO-GO until external infrastructure is corrected.

Action order:

1. Restore Cloudflare Wrangler authentication.
2. Deploy canonical root Worker to `archaios-saas-worker`.
3. Verify health reports `service: "archaios-saas-worker"`.
4. Replace or confirm the Supabase project ref because `pedymtymubpirhaikymj.supabase.co` fails DNS.
5. Verify Stripe production products, prices, and webhook endpoint.
6. Trigger hardened GitHub Worker Heartbeat.
7. Run signed-in checkout and webhook smoke tests.
