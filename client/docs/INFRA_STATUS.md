# ARCHAIOS Infrastructure Status

Generated: 2026-04-16

## Overall Status

Status: blocked at credential boundary.

The local codebase has enough structure to support a monetized AI Assassins / ARCHAIOS platform, but external service verification could not be completed because required service auth was not available in this terminal environment. No code, DNS, deployments, Stripe products, or Supabase resources were modified.

## Status Dashboard

| Area | Local Evidence | External Verification | Status |
|---|---|---:|---|
| Repositories | Four accessible repo/workspaces identified | GitHub workflow status not fetched | Partial |
| Frontend app | Vite React client with dashboard, pricing, landing, operator, book growth modules | Vercel/GitHub Pages live status not verified | Partial |
| Cloudflare Worker | Worker configs exist in current repo and `Ai-Assassins` | Cloudflare account, zones, DNS, logs not verified | Blocked |
| Supabase | SQL migrations and frontend/backend env references exist | Projects, auth, DB, storage/functions not verified | Blocked |
| Stripe | Checkout/webhook code and docs exist | Products/prices/webhook endpoints not verified | Blocked |
| Vercel | `vercel.json` exists in current repo | CLI missing; projects/deployments/env not verified | Blocked |
| GitHub Actions | Workflow YAML files found locally | Latest run status not fetched | Blocked/Partial |
| Daily briefing pipeline | Worker cron and daily brief code exist, especially in `Ai-Assassins` | Runtime execution not verified | Partial |
| Premium gating | Client and Worker code references free/pro/elite tiers | Live subscription sync not verified | Partial |
| Analytics/conversion | Lead, CTA, dashboard, and operator docs/code exist | Live events not verified | Partial |

## Credential Stop Condition

The audit stopped before external service reads because at least one required credential or CLI login was missing.

Missing or unavailable in shell:

- Vercel CLI: `vercel` command missing.
- Vercel auth: `VERCEL_TOKEN` missing and no local `~/.vercel` config found.
- Supabase auth: `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` missing from shell; no local `~/.supabase` config found.
- Cloudflare auth: `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` missing; no local `~/.wrangler` config found.
- Stripe env auth: `STRIPE_API_KEY` / `STRIPE_SECRET_KEY` missing. A local Stripe config folder exists, but prices were not listed because the audit stopped at the missing credential boundary.
- GitHub env token: `GITHUB_TOKEN` / `GH_TOKEN` missing. A local GitHub CLI config folder exists, but workflow status was not fetched after the broader credential boundary was reached.

## Issues By Severity

### Block

- External platform state cannot be verified until Vercel, Supabase, Cloudflare, Stripe, and GitHub auth are available through CLI login or environment variables.
- The requested `ARCHAIOS_INFRASTRUCTURE` root was not found locally, so exported ChatGPT archive classification could not be included in this service audit.
- `saintblack-ai.github.io` contains application-like Next/TypeScript code but no detected `package.json`, making deployment/build ownership unclear.
- `Ai-Assassins/worker/wrangler.toml` has empty Supabase and Stripe runtime vars, including price IDs.
- `Archaios OS/cloudflare_worker/wrangler.toml` still points to placeholder `https://example.com/api/archaios/daily`.

### Warning

- There are overlapping product surfaces across `ai-assassins-client`, `Ai-Assassins`, and `saintblack-ai.github.io`.
- Current repo uses multiple deployment surfaces: GitHub Pages, Vercel config, and Cloudflare Worker. That can work, but needs an authoritative production route map.
- Stripe variable naming differs across repos: `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`, `STRIPE_PRICE_ID_PRO`, and `STRIPE_PRICE_ID_ELITE`.
- GitHub Actions in `ai-assassins-client` use Node `24`; local/package compatibility should be verified before relying on CI.
- Some older docs/configs refer to placeholder Supabase values or older pricing vocabulary.

### Informational

- The current client has production-focused docs for Stripe, deployment, env vars, revenue implementation, and architecture.
- The current client has a working local build path in `package.json`.
- `Ai-Assassins` has a mature Worker and daily brief path that can be reused or consolidated into the current app.
- `Archaios OS` is suitable as internal operator/control-plane infrastructure after endpoint/token config is real.

## Next Actions

- Install and authenticate Vercel CLI or set `VERCEL_TOKEN`.
- Authenticate Supabase CLI or set `SUPABASE_ACCESS_TOKEN` plus project/database env vars for read-only verification.
- Authenticate Cloudflare Wrangler or set `CLOUDFLARE_API_TOKEN`.
- Authenticate Stripe CLI or set `STRIPE_API_KEY`/`STRIPE_SECRET_KEY` for read-only product/price checks.
- Authenticate GitHub CLI or set `GH_TOKEN`/`GITHUB_TOKEN` for workflow status checks.
- Re-run this audit after auth is present.
- Decide whether `ai-assassins-client` is the canonical production frontend and `Ai-Assassins` is the canonical briefing Worker source.
- Normalize Stripe price env names across repos.
- Replace placeholder Archaios OS remote endpoint with the real internal trigger route after approval.

## Top 5 Blockers

- Missing Vercel CLI/auth prevents deployment and environment verification.
- Missing Supabase auth/env prevents database, auth, functions, and storage verification.
- Missing Cloudflare auth prevents DNS, Worker, zone, security, and log verification.
- Missing Stripe auth prevents Pro/Elite prices and webhook wiring verification.
- Requested `ARCHAIOS_INFRASTRUCTURE` root is not available locally.

## Top 5 Quick Wins

- Add a `package.json` or deployment note to `saintblack-ai.github.io` if it is intended to build as an app.
- Normalize Stripe env names to `STRIPE_PRICE_ID_PRO` and `STRIPE_PRICE_ID_ELITE` everywhere.
- Mark `ai-assassins-client` as the canonical customer dashboard in docs.
- Mark `Ai-Assassins` as legacy/source Worker or migrate its daily brief logic deliberately.
- Replace placeholder Archaios OS Cloudflare endpoint with an env-driven checklist before deployment.

