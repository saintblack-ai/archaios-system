# Sprint 19 Deployment Readiness Report

## Audit
- Audit date: 2026-07-16
- Release-candidate branch: `codex/sprint-19-runtime-release-candidate`
- Base commit: `f1b7c1382eb10b9121edf605a6c657fddbc4a3a9`
- Release-candidate runtime commit: `aaae07e`
- Source PR reviewed: PR #16 / `origin/codex/connect-canonical-runtime`

## Architecture Status
The release candidate preserves the established architecture:

Vite frontend -> shared runtime/API contracts -> Cloudflare Worker -> gated Supabase and Stripe integrations.

No production deployment was performed. Supabase and Stripe activation gates remain closed by default through `SUPABASE_ACTIVE=false` and `STRIPE_CHECKOUT_ACTIVE=false` behavior.

## Why PR #16 Was Not Release-Candidate Clean
PR #16 mixed canonical runtime work with broad unrelated additions, including iOS app work, QX material, Black Vault/research documents, books/music/knowledge archives, historical reports, and legacy documentation. It was also behind `origin/main`, whose latest commit was `f1b7c1382eb10b9121edf605a6c657fddbc4a3a9`.

## Files Included In Release Scope
- `.github/workflows/deploy.yml`
- `.github/workflows/worker_heartbeat.yml`
- `.dev.vars.example`
- `.env.example`
- `package.json`
- `package-lock.json`
- `worker.js`
- `wrangler.toml`
- `vercel.json`
- `shared/api-contracts.js`
- `shared/archivist.js`
- `shared/production-config.js`
- `shared/runtime-routes.js`
- `scripts/check-env.sh`
- `scripts/phoenix-smoke-dry-run.sh`
- `scripts/rollback-backend.mjs`
- `scripts/validate-runtime-contract.mjs`
- `scripts/verify-production.mjs`
- `scripts/verify-runtime.mjs`
- `tests/*.test.mjs`
- `client/package.json`
- `client/package-lock.json`
- `client/.env.example`
- `client/FRONTEND_ENV_VARS.md`
- `client/src` runtime/API/navigation/page files required by the Vite build
- `client/archaios-core/interfaces/daily-command-center.json`
- `client/supabase/sql/2026-06-20_subscription_upsert_contract.sql`
- Minimal `server/intelligence/*` event validation helpers required by canonical SITREP tests

## Protected Files Intentionally Excluded
The release candidate intentionally excludes unrelated and protected categories:
- iOS app sprint work
- QX research and AI chip material
- Black Vault research archives
- books and music assets
- personal founder documents
- historical archive reports not required for runtime release
- broad knowledge/archive directories not required by the canonical runtime

## Production-Blocking Fixes Made
- Created a clean RC branch from latest `origin/main` rather than attempting to merge the polluted PR branch.
- Added only missing frontend runtime modules required by `client/src/App.jsx`.
- Added the single JSON interface required by the production Vite build.
- Added minimal SITREP helper modules required by canonical runtime tests.
- Added the subscription upsert migration contract required by revenue readiness tests.
- Added the missing root typecheck step to CI.
- Reduced CI permissions so Pages write/id-token permissions exist only on the deploy job.
- Strengthened the Worker smoke verifier to check health, version, status, pricing, SITREP, CORS, JSON 404 behavior, degraded subscription behavior, and secret-like field leakage.
- Resolved `npm audit --audit-level=moderate` findings with a targeted `postcss` override and lockfile refresh.

## GitHub Actions Status
Workflow validates pull requests without deploying. Main pushes and manual dispatch can still publish GitHub Pages after validation. CI now performs checkout, Node 20 setup, root install, client install, runtime contract validation, root lint, root typecheck, canonical runtime tests, client lint, client tests, client production build, and Worker dry-run.

## Vercel Configuration Status
`vercel.json` uses:
- Install command: `npm --prefix client ci`
- Build command: `npm --prefix client run build`
- Output directory: `client/dist`
- SPA rewrite that avoids intercepting `/api/*`

## Cloudflare Worker Status
- Worker name: `archaios-saas-worker`
- Main entry: `worker.js`
- Compatibility date: `2026-03-05`
- `WORKER_RELEASE` exposed as a safe environment variable
- Supabase and Stripe activation gates are disabled unless deliberately configured
- Worker dry-run passed

## Frontend/Backend Contract Status
- Canonical frontend API variable: `VITE_API_BASE_URL`
- Legacy compatible variable: `VITE_BACKEND_URL`
- Canonical fallback Worker URL: `https://archaios-saas-worker.quandrix357.workers.dev`
- Duplicate `/api/api/` path prevention is implemented in `client/src/lib/api.js`
- JSON error parsing supports canonical and legacy formats

## Command Results
- `npm ci`: passed
- `npm --prefix client ci`: passed
- `npm run lint`: passed
- `npm run typecheck`: passed
- `npm test`: passed, 27 tests
- `npm run test:canonical-runtime`: passed, 20 tests
- `npm run check:runtime-contract`: passed
- `npm run build`: passed
- `npm --prefix client run lint`: passed
- `npm --prefix client test`: passed, 7 tests
- `npm --prefix client run build`: passed
- `node --check worker.js`: passed
- `npm run deploy:backend:dry-run`: passed
- `npm audit --audit-level=moderate`: passed, 0 vulnerabilities
- `npm run verify:runtime`: failed against live public Worker because `/api/health` currently reports `service: archaios-daily-automation`, not `archaios-core-api`

## Security Findings
- No `.env`, `.dev.vars`, token, key, credential, private certificate, or secret files were intentionally included.
- Secret-like values were not printed or committed.
- Runtime contract validation scans for obvious OpenAI, Stripe, Supabase JWT, and private Vite credential patterns.
- Stripe checkout remains activation-gated.
- Supabase writes remain activation-gated.

## Remaining Blockers
The RC code is locally validated, but the live public Worker host is currently serving the daily automation Worker identity. Controlled promotion should not proceed until the canonical Worker is deployed to `archaios-saas-worker` and `/api/health` reports `service: archaios-core-api`.

## Rollback Procedure
If controlled promotion fails:
1. Do not merge the release-candidate PR.
2. Keep the current production Worker untouched.
3. Use `npm run rollback:backend` only with an explicitly approved previous Worker version.
4. Re-run `npm run verify:runtime` against the target Worker before promoting again.

## Production Readiness
- Readiness percentage: 92%
- Recommendation: conditional approval for a controlled promotion after live Worker identity is corrected

## Next Engineering Milestone
Sprint 20 should focus on controlled promotion, live endpoint verification, and post-promotion monitoring without broad architecture changes.
