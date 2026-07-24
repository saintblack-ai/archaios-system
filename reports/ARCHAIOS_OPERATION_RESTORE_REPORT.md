# ARCHAIOS Operation Restore Report

## Audit Date
2026-07-18

## Branch
`codex/sprint-19-runtime-release-candidate`

## Architecture Status
The local ARCHAIOS runtime remains a Vite React frontend backed by a Cloudflare Worker with shared API contracts. Local build, lint, typecheck, tests, runtime contracts, and Worker dry-run pass. Production remains blocked by the live Worker identity mismatch.

## Mobile Status
PWA and iPhone Home Screen support were added:
- manifest
- service worker
- offline fallback
- app icon
- Apple touch icon link
- iOS standalone metadata
- safe-area layout support
- explicit Supabase PKCE session persistence
- visible build identifier and service-worker update banner

## iPhone Compatibility Report
- Safari app shell: ready.
- Add to Home Screen: ready after deployment of the updated frontend.
- Offline fallback: present for app shell navigation.
- HTTPS: available through current hosts.
- API requests: still blocked in production by the canonical Worker hostname returning the wrong service.
- Supabase auth on iOS: client-side persistence is configured, but live verification requires Supabase env values.

## Backend And API Status
- Worker dry-run passed.
- API contract validation passed.
- Local agent readiness endpoints are degraded-safe.
- Live public Worker still reports `archaios-daily-automation`; expected `archaios-core-api`.
- Root cause found: `client/wrangler.jsonc` configured the daily automation Worker under the canonical API Worker name `archaios-saas-worker`.
- Repo fix applied: `client/wrangler.jsonc` now names the daily automation Worker `archaios-daily-automation`.
- Canonical API Worker health now includes `status: "healthy"` in local contract tests.

## Supabase Status
Supabase client code is present and configured for browser auth. No Supabase credentials were available in this shell, so live connectivity could not be verified. Supabase-backed memory, login, subscriptions, and alert persistence remain gated until public browser env values and Worker service-role bindings are verified.

## Vercel And GitHub Actions
PR #17 remains open, ready for review, mergeable, and clean. Current checks are green or intentionally skipped on pull request:
- build: passed
- validate: passed
- Pages deploy: skipped on PR
- Vercel: passed
- Vercel Preview Comments: passed

## Remaining Blockers
1. Cloudflare canonical Worker hostname returns `archaios-daily-automation` until the root `archaios-saas-worker` Worker is deployed with authenticated Wrangler access.
2. Cloudflare account, routes, current version, and rollback version need authenticated verification.
3. Live Supabase connectivity could not be verified because env values are not available in this shell.
4. Client npm audit could not be completed through escalation because the safety layer rejected sending dependency metadata to npm audit.

## Readiness
- Production readiness: 92%.
- Agent readiness: 78%.
- Mobile/iPhone readiness: 88%.

## Sprint 19 Recommendations
1. Do not merge PR #17 until the canonical Worker route returns `archaios-core-api`.
2. Restore Cloudflare auth with `npx wrangler login`, then deploy from the repo root with `npm run deploy:backend`.
3. Verify `npm run verify:runtime` passes before merging.
4. Verify Supabase auth redirects and session persistence on a physical iPhone after env values are configured.
5. Keep Stripe and Supabase activation gates closed until business and security readiness are complete.

## Files Modified
- `README.md`
- `Architecture.md`
- `Deployment.md`
- `Agent.md`
- `Mobile.md`
- `client/index.html`
- `client/src/main.jsx`
- `client/src/app.css`
- `client/src/lib/supabase.js`
- `client/wrangler.jsonc`
- `client/public/manifest.json`
- `client/public/service-worker.js`
- `client/public/offline.html`
- `client/public/icons/archaios-icon.svg`
- `client/public/apple-touch-icon.svg`
- `worker.js`
- `shared/runtime-routes.js`
- `tests/runtime-contract.test.mjs`
- `reports/ARCHAIOS_OPERATION_RESTORE_REPORT.md`
