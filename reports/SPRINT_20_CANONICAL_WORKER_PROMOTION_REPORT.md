# Sprint 20 Canonical Worker Promotion Report

## Audit
- Audit date: 2026-07-16
- Repository: `saintblack-ai/archaios-system`
- Branch: `codex/sprint-19-runtime-release-candidate`
- Commit: `379bad73c874a49e4b68c9bf32fe1892039faff7`
- Pull request: PR #17, `Sprint 19: Canonical Runtime Release Candidate`
- Production deployment performed: no
- Cloudflare deployment performed: no
- Frontend environment changed: no
- Stripe activated: no
- Supabase activated: no
- Canonical service contract changed: no

## PR State
- PR #17 state: open and ready for review
- Draft status: false
- Mergeability: `MERGEABLE`
- Merge state: `CLEAN`
- `build`: passed
- `validate`: passed
- `deploy`: skipped on pull request as intended
- `Vercel`: passed
- `Vercel Preview Comments`: passed

## Cloudflare Target Map
Repo-declared canonical target:
- Worker deployment name: `archaios-saas-worker`
- Canonical service identifier: `archaios-core-api`
- Repo-declared public URL: `https://archaios-saas-worker.quandrix357.workers.dev`
- Worker entrypoint: `worker.js`
- Wrangler config: `wrangler.toml`
- Release identifier: `2026-07-12-production-routing-contract`

Current public hostname observations:
- `https://archaios-saas-worker.quandrix357.workers.dev/api/health`
  - HTTP 200
  - `service`: `archaios-daily-automation`
  - Cron: `17 13 * * *`
  - Jobs: `dashboard-signals`, `activity-feed`, `metrics-snapshots`
- `https://archaios-daily-automation.quandrix357.workers.dev/api/health`
  - HTTP 200
  - `service`: `archaios-daily-automation`
  - Cron: `17 13 * * *`
  - Jobs: `dashboard-signals`, `activity-feed`, `metrics-snapshots`
- `https://ai-assassins-worker.quandrix357.workers.dev/api/health`
  - HTTP 200
  - Payload: `{"status":"ok","version":"phase-a"}`
- `https://ai-assassins-markets.quandrix357.workers.dev/api/health`
  - HTTP 404
- `https://archaios-agents.quandrix357.workers.dev/api/health`
  - HTTP 404, Cloudflare error code 1042

Wrangler account inspection:
- `npx wrangler whoami`: blocked because the stored auth token is expired and could not be refreshed non-interactively.
- `npx wrangler deployments list --name archaios-saas-worker`: blocked because `CLOUDFLARE_API_TOKEN` is not set in this non-interactive environment.
- `npx wrangler versions list --name archaios-saas-worker`: blocked because `CLOUDFLARE_API_TOKEN` is not set in this non-interactive environment.

Unknown until authenticated Cloudflare inspection:
- Cloudflare account ID
- Current production deployment version
- Previous rollback candidate
- Route and custom-domain bindings
- Whether `archaios-saas-worker` is an alias, route collision, stale script, or separate Worker currently serving daily automation code
- Whether `archaios-daily-automation` and `archaios-saas-worker` are separate Workers sharing code or one Worker bound to multiple hostnames

## Local Verification Results
- `npm ci`: passed
- `npm --prefix client ci`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed, 27 tests
- `npm run test:canonical-runtime`: passed, 20 tests
- `npm run check:runtime-contract`: passed
- `npm run build`: passed
- `node --check worker.js`: passed
- `npm run deploy:backend:dry-run`: passed

Wrangler dry-run result:
- Total upload: 109.31 KiB
- Gzip upload: 23.34 KiB
- No deployment occurred because `--dry-run` exited before upload.
- Printed bindings were public/non-secret vars only: `OPENAI_MODEL`, `LOCAL_TIMEZONE`, `WORKER_BASE_URL`, `FRONTEND_URL`, `WORKER_RELEASE`.

Local Wrangler dev:
- Command: `npx wrangler dev --config wrangler.toml --port 8787`
- Local URL: `http://localhost:8787`
- Local verification passed.

Local endpoint checks:
- `GET /api/health`: HTTP 200, `service` = `archaios-core-api`, release present.
- `GET /api/version`: HTTP 200, `service` = `archaios-core-api`.
- `GET /api/status`: HTTP 200, mode = `degraded_public`, Supabase inactive, Stripe test or inactive.
- `GET /api/pricing`: HTTP 200, pricing contract valid.
- `GET /api/sitrep`: HTTP 200, degraded public demo mode, `live` = false.
- `OPTIONS /api/health`: HTTP 204, CORS permits `https://saintblack-ai.github.io`.
- `GET /api/nonexistent-route`: HTTP 404, controlled JSON `not_found` response.
- `ARCHAIOS_API_URL=http://127.0.0.1:8787 ARCHAIOS_FRONTEND_URL=https://saintblack-ai.github.io/ai-assassins-client npm run verify:runtime`: passed after network access was available for the public frontend fetch.

## Promotion Path Decision
Selected path: Path C, routing ambiguity remains.

Reason:
- The canonical repo target is `archaios-saas-worker`.
- The public `archaios-saas-worker.quandrix357.workers.dev` hostname currently returns `archaios-daily-automation`.
- The separate `archaios-daily-automation.quandrix357.workers.dev` hostname also returns `archaios-daily-automation`.
- Authenticated Wrangler inspection is unavailable in this session, so account ID, deployment versions, rollback version, route bindings, and exact Worker ownership cannot be verified.
- Deploying now could overwrite or disturb a daily automation Worker without enough evidence that it is the intended canonical target.

## Deployment Safety Gate
Gate status: blocked.

Known:
- Target Worker name from repo: `archaios-saas-worker`
- Proposed release identifier: `2026-07-12-production-routing-contract`
- Canonical service expected after promotion: `archaios-core-api`
- Current public health service: `archaios-daily-automation`
- Secret values were not printed.
- Stripe and Supabase activation gates remain disabled.

Unknown:
- Cloudflare account ID
- Current production version ID
- Rollback version ID
- Actual route/custom-domain bindings
- Whether `archaios-saas-worker` can be safely promoted without impacting `archaios-daily-automation`
- Whether the canonical Worker should be created under a separate verified target first

Deployment decision: no deployment.

## Live Verification Results
Current live canonical URL from repo:
- `https://archaios-saas-worker.quandrix357.workers.dev`

Current live health result:
- `service`: `archaios-daily-automation`

Required canonical health result:
- `service`: `archaios-core-api`

Live runtime verification against the public canonical URL remains blocked by the service mismatch.

## Frontend Environment Impact
- No frontend environment was changed.
- Current frontend contract still points at `VITE_API_BASE_URL` with fallback `https://archaios-saas-worker.quandrix357.workers.dev`.
- Production frontend configuration should not be updated until the canonical Worker target is verified and `/api/health` returns `archaios-core-api`.
- `VITE_BACKEND_URL` compatibility should remain in place.

## Rollback Status
- Rollback script exists: `scripts/rollback-backend.mjs`.
- Rollback command requires an explicit previous version ID.
- No rollback candidate can be selected in this session because `wrangler versions list --name archaios-saas-worker` is blocked by Cloudflare authentication.
- Rollback is not safe to rely on until the previous version ID and target Worker identity are confirmed.

## Security And Scope
- Secret values were not printed.
- No API keys were added.
- No `.env` or `.dev.vars` files were modified.
- No production deployment occurred.
- No Cloudflare secret changes occurred.
- No Stripe or Supabase activation occurred.
- No QX, Black Vault, research, books, music, iOS, founder, archive, or legacy documents were modified.

## Remaining Blocker
The live public `archaios-saas-worker.quandrix357.workers.dev` hostname still reports `archaios-daily-automation`, while the canonical runtime contract requires `archaios-core-api`.

Manual Cloudflare dashboard or authenticated Wrangler confirmation is required before deployment:
1. Confirm the Cloudflare account ID.
2. Confirm whether `archaios-saas-worker` and `archaios-daily-automation` are separate Workers.
3. Confirm which Worker owns `archaios-saas-worker.quandrix357.workers.dev`.
4. Confirm all routes and custom domains attached to each Worker.
5. Confirm the current production version ID and a previous rollback version ID.
6. Confirm whether `archaios-saas-worker` can be promoted safely without overwriting daily automation.
7. If the hostname belongs to daily automation, create or promote the canonical Worker as a separate verified `archaios-saas-worker` target instead of replacing unrelated automation code.

## Production Readiness
- Updated readiness percentage: 92%
- Reason readiness did not increase: local canonical runtime verification passed, but live Cloudflare account, target, route, and rollback identities remain unverified.

## Merge Recommendation For PR #17
PR #17 is ready for human review, but it is not ready to merge or promote.

Merge should remain blocked until:
- Authenticated Cloudflare inspection confirms the correct target and rollback path.
- The canonical Worker is safely promoted or separately created under the intended target.
- Live `/api/health` returns `service: archaios-core-api`.
- `npm run verify:runtime` passes against the confirmed live canonical Worker URL.
