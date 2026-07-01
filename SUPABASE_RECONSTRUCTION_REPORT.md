# Supabase Reconstruction Report

Generated: 2026-06-18T07:00:21Z

## Situation

Production is configured around Supabase project ref `pedymtymubpirhaikymj`, with the public URL:

`https://pedymtymubpirhaikymj.supabase.co`

The public backend health endpoint is live:

`https://archaios-saas-worker.quandrix357.workers.dev/api/health`

The Supabase project URL does not resolve from direct DNS checks. The backend can respond, but Supabase-backed routes fail.

## Analysis

### Local Environment Audit

Local files with Supabase configuration:

| Source | Supabase URL | Notes |
| --- | --- | --- |
| `client/.env` | `https://pedymtymubpirhaikymj.supabase.co` | URL and anon key present. |
| `client/.env.production` | `https://pedymtymubpirhaikymj.supabase.co` | URL and anon key present. |
| `client/.env.development` | `https://pedymtymubpirhaikymj.supabase.co` | URL and anon key present. |
| `server/.env` | `https://pedymtymubpirhaikymj.supabase.co` | `SUPABASE_SERVICE_ROLE_KEY` is present by name but decodes as an anon JWT. |
| `client/wrangler.jsonc` | `https://pedymtymubpirhaikymj.supabase.co` | Worker vars point to this project ref. |
| `.env.example`, `client/.env.example`, `server/.env.example` | Empty placeholders | No production values. |

JWT payload audit:

| Source | Variable | JWT role | Project ref |
| --- | --- | --- | --- |
| `client/.env` | `VITE_SUPABASE_ANON_KEY` | `anon` | `pedymtymubpirhaikymj` |
| `client/.env.production` | `VITE_SUPABASE_ANON_KEY` | `anon` | `pedymtymubpirhaikymj` |
| `server/.env` | `SUPABASE_SERVICE_ROLE_KEY` | `anon` | `pedymtymubpirhaikymj` |

Finding: `server/.env` does not contain a real service-role key. It contains an anon key under the service-role variable name.

### GitHub Secrets And Variables Audit

Repository: `saintblack-ai/archaios-system`

GitHub CLI auth is valid with `repo` and `workflow` scopes.

Findings:

| Scope | Result |
| --- | --- |
| Repo secrets | No entries returned by `gh secret list --repo saintblack-ai/archaios-system`. |
| Repo variables | No entries returned by `gh variable list --repo saintblack-ai/archaios-system`. |
| `github-pages` environment secrets | No entries returned. |
| `github-pages` environment variables | No entries returned. |

Active workflow:

`.github/workflows/deploy.yml` builds `client/` and deploys GitHub Pages, but does not inject `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, or `VITE_SUPABASE_ANON_KEY`.

Inactive/reference workflow:

`client/.github/workflows/deploy.yml` expects `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_BACKEND_URL`, and `VITE_ADMIN_EMAIL`, but workflows under `client/.github` are not active for the repository.

Recent GitHub Pages workflow runs show successful deploys on 2026-04-18, but those builds likely used missing or empty Vite env.

### Cloudflare Worker Secrets Audit

Worker name: `archaios-saas-worker`

Blocked: Wrangler requires `CLOUDFLARE_API_TOKEN` in this non-interactive environment.

Command attempted:

```bash
npx wrangler secret list --name archaios-saas-worker
```

Result:

```text
In a non-interactive environment, it's necessary to set a CLOUDFLARE_API_TOKEN environment variable for wrangler to work.
```

Repository evidence:

| Source | Worker config |
| --- | --- |
| `wrangler.toml` | Root worker `worker.js`, name `archaios-saas-worker`; comments require `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, Stripe secrets, OpenAI key. |
| `client/wrangler.jsonc` | Worker `client/worker/index.js`, name `archaios-saas-worker`; vars include dead Supabase URL and table names. |

Live evidence:

`GET /api/health` returns HTTP 200 and confirms backend config is partially present.

### Vercel Environment Audit

Project: `ai-assassins-client`

Project ID: `prj_O4pTRDr5EglSjPNzMVyOzF4icY7B`

Team ID: `team_1X955N2NaejVA7KZC2thJ3ja`

Vercel project is linked and latest production deployment is READY, but `live` is false.

Production env keys exist by name:

| Key | Target |
| --- | --- |
| `VITE_SUPABASE_URL` | production |
| `VITE_SUPABASE_ANON_KEY` | production |
| `VITE_BACKEND_URL` | production |
| `STRIPE_CHECKOUT_URL_PRO` | preview, production |
| `STRIPE_CHECKOUT_URL_ELITE` | preview, production |
| `STRIPE_CHECKOUT_URL_ONE_OFF_5` | preview, production |
| `STRIPE_CHECKOUT_URL_ONE_OFF_7` | preview, production |

Production env pull result:

| Key | Pulled value state |
| --- | --- |
| `VITE_SUPABASE_URL` | Empty |
| `VITE_SUPABASE_ANON_KEY` | Empty |
| `VITE_BACKEND_URL` | Empty |

Finding: Vercel is not currently a reliable production frontend environment.

### Live Endpoint Verification

| Endpoint | Result | Interpretation |
| --- | --- | --- |
| `GET /api/health` | HTTP 200 | Worker is deployed and reachable. |
| `POST /api/leads` | HTTP 500, `supabase_http_530` | Worker attempted Supabase operation against a broken/unavailable project. |
| `POST /api/stripe/checkout` without bearer token | HTTP 500, `Unauthorized` | Auth protection is active. Signed-out checkout is blocked server-side. |
| `GET /api/subscription` without bearer token | HTTP 401, `Unauthorized` | Auth protection is active. |
| `https://pedymtymubpirhaikymj.supabase.co/rest/v1/` | DNS failure | Original Supabase ref is not reachable. |
| `https://pedymtymubpirhaikymj.supabase.co/auth/v1/settings` | DNS failure | Original Supabase ref is not reachable. |

## Opportunities

1. Rebuild Supabase cleanly instead of trying to recover a dead ref.
2. Correct the service-role key issue during reconstruction.
3. Consolidate frontend deployment around the active root GitHub Pages workflow.
4. Move all production environment configuration into auditable deployment systems.
5. Create a repeatable recovery runbook for future infrastructure survivability.

## Risks

1. The original Supabase project likely no longer exists or the ref is incorrect.
2. Local `server/.env` has an anon key mislabeled as a service-role key.
3. GitHub Pages production currently has no repo or environment secrets/vars configured.
4. Vercel production env keys exist but pulled as empty values.
5. Cloudflare Worker secret audit and redeploy are blocked without `CLOUDFLARE_API_TOKEN`.
6. Supabase project creation and migrations are blocked without `SUPABASE_ACCESS_TOKEN` or interactive `supabase login`.
7. Stripe checkout cannot be fully verified without a signed-in Supabase user and valid Stripe price/secret configuration.

## Recommendations

1. Treat `pedymtymubpirhaikymj` as lost unless Supabase dashboard confirms otherwise.
2. Create a new production Supabase project.
3. Generate a new anon key and service-role key.
4. Apply migrations in this order:
   - `client/supabase/sql/2026-04-14_production_core_tables.sql`
   - `client/supabase/sql/2026-04-25_profiles_tier_alignment.sql`
   - `client/supabase/sql/2026-03-31_backend_cron_tables.sql`
   - `client/supabase/sql/2026-03-30_production_scheduled_jobs.sql`
   - `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`
   - then root `sql/` platform/revenue migrations as needed after table dependency review.
5. Update Cloudflare Worker secrets:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - confirm `STRIPE_SECRET_KEY`
   - confirm `STRIPE_WEBHOOK_SECRET`
   - confirm `STRIPE_PRICE_PRO`
   - confirm `STRIPE_PRICE_ELITE`
6. Update GitHub Actions configuration for the active root workflow:
   - repo/environment variable `VITE_SUPABASE_URL`
   - repo/environment secret `VITE_SUPABASE_ANON_KEY`
   - repo/environment variable `VITE_BACKEND_URL`
   - optional variable `VITE_ADMIN_EMAIL`
7. Fix the active `.github/workflows/deploy.yml` to pass Vite env into the `client/` build or move the checked env workflow from `client/.github/workflows` into the active root `.github/workflows` path.
8. Ignore or repair Vercel unless it becomes the actual production frontend. Current doctrine says deploy frontend from `client/` with GitHub Pages.

## Immediate Actions

Blocked actions that require credentials:

```bash
export SUPABASE_ACCESS_TOKEN=...
export CLOUDFLARE_API_TOKEN=...
```

Then:

```bash
supabase projects list
supabase projects create archaios-production --org-id <org-id> --region <region>
supabase link --project-ref <new-ref>
supabase db push
```

Set Cloudflare secrets:

```bash
npx wrangler secret put SUPABASE_URL --name archaios-saas-worker
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --name archaios-saas-worker
npx wrangler secret put STRIPE_SECRET_KEY --name archaios-saas-worker
npx wrangler secret put STRIPE_WEBHOOK_SECRET --name archaios-saas-worker
npx wrangler secret put STRIPE_PRICE_PRO --name archaios-saas-worker
npx wrangler secret put STRIPE_PRICE_ELITE --name archaios-saas-worker
```

Deploy Worker:

```bash
npx wrangler deploy --name archaios-saas-worker
```

Set GitHub Actions values:

```bash
gh variable set VITE_SUPABASE_URL --repo saintblack-ai/archaios-system --body "https://<new-ref>.supabase.co"
gh secret set VITE_SUPABASE_ANON_KEY --repo saintblack-ai/archaios-system
gh variable set VITE_BACKEND_URL --repo saintblack-ai/archaios-system --body "https://archaios-saas-worker.quandrix357.workers.dev"
```

Redeploy frontend:

```bash
gh workflow run deploy.yml --repo saintblack-ai/archaios-system --ref main
```

Verification:

```bash
curl --fail https://archaios-saas-worker.quandrix357.workers.dev/api/health
curl --fail -X POST https://archaios-saas-worker.quandrix357.workers.dev/api/leads \
  -H 'content-type: application/json' \
  --data '{"email":"recovery-test@example.com","source":"supabase-reconstruction"}'
```

Authenticated checks require a real Supabase session bearer token:

```bash
curl --fail -X POST https://archaios-saas-worker.quandrix357.workers.dev/api/stripe/checkout \
  -H "authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>" \
  -H 'content-type: application/json' \
  --data '{"tier":"pro"}'

curl --fail https://archaios-saas-worker.quandrix357.workers.dev/api/subscription \
  -H "authorization: Bearer <SUPABASE_USER_ACCESS_TOKEN>"
```

Webhook verification should be performed through Stripe CLI or Stripe Dashboard with a signed event because the Worker verifies signatures.

## Long-Term Impact

The recovery path strengthens survivability by replacing a dead Supabase dependency, separating anon and service-role credentials correctly, and moving deployment configuration into auditable systems. Once rebuilt, the AI Assassins revenue path can again store leads, complete checkout, process Stripe webhooks, and unlock paid dashboard access.

The strategic lesson is clear: production refs, keys, migrations, and deployment variables must be archived as recoverable infrastructure assets, not just scattered runtime state.

## Verification Pass: 2026-06-18T07:13Z

### Supabase Recovery Status

FAIL.

Command:

```bash
curl -sS -i https://pedymtymubpirhaikymj.supabase.co/auth/v1/health
```

Result:

```text
curl: (6) Could not resolve host: pedymtymubpirhaikymj.supabase.co
```

The project ref remains correct according to local env files and JWT payload metadata, but it is not reachable from direct network checks.

### Env Parity Matrix

| Required key | Local repo env | GitHub repo/env secrets or vars | Cloudflare Worker secrets | Status |
| --- | --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | Present in `client/.env*`; points to unreachable ref | Missing | Not applicable for browser build | FAIL |
| `VITE_SUPABASE_ANON_KEY` | Present in `client/.env*`; JWT role `anon` | Missing | Not applicable for browser build | FAIL |
| `SUPABASE_SERVICE_ROLE_KEY` | Present in `server/.env`, but JWT role is `anon` | Missing | Blocked: no `CLOUDFLARE_API_TOKEN` for audit | FAIL |
| `STRIPE_SECRET_KEY` | Present in `server/.env` | Missing | Blocked: no `CLOUDFLARE_API_TOKEN` for audit | PARTIAL |
| `STRIPE_WEBHOOK_SECRET` | Present in `server/.env` | Missing | Blocked: no `CLOUDFLARE_API_TOKEN` for audit | PARTIAL |
| `STRIPE_PRICE_PRO` | Present in `server/.env` | Missing | Blocked: no `CLOUDFLARE_API_TOKEN` for audit | PARTIAL |
| `STRIPE_PRICE_ELITE` | Present in `server/.env` | Missing | Blocked: no `CLOUDFLARE_API_TOKEN` for audit | PARTIAL |

GitHub audit commands returned no configured repo-level or `github-pages` environment-level secrets/variables.

Cloudflare audit command:

```bash
npx wrangler secret list --name archaios-saas-worker
```

Result: blocked because Wrangler requires `CLOUDFLARE_API_TOKEN` in this non-interactive environment.

### Build And Endpoint Results

| Check | Result | Notes |
| --- | --- | --- |
| `npm run build` in `client/` | PASS | Vite production build completed. |
| `GET /api/health` | PASS | HTTP 200. Worker is live. |
| `GET /api/pricing` | PASS | HTTP 200 with free/pro/elite pricing payload. |
| `POST /api/leads` | FAIL | HTTP 500 `supabase_http_530`; Supabase dependency unavailable. |
| `POST /api/stripe/webhook` unsigned payload | PASS | HTTP 400 `Missing Stripe signature`; signature enforcement is active. |
| `POST /api/stripe/checkout` unsigned request | BLOCKED/PASS-GUARD | HTTP 500 `Unauthorized`; signed-out checkout is blocked. |
| Dashboard paid unlock | BLOCKED | Requires reachable Supabase, valid service-role key, Stripe webhook sync, and signed user session. |

### E2E Readiness Score

45 / 100.

Passing:

- Worker is live.
- Pricing endpoint is live.
- Frontend build passes.
- Webhook signature guard is active.
- Checkout blocks unsigned access.

Failing or blocked:

- Supabase project is still unreachable.
- Lead write cannot complete.
- Service-role key is not valid locally.
- GitHub production env is absent.
- Cloudflare Worker secret parity cannot be audited without `CLOUDFLARE_API_TOKEN`.
- Signed checkout and dashboard unlock cannot be proven until Supabase auth and subscription persistence are restored.

### Minimal Patch

Applied to `.github/workflows/deploy.yml`:

- Injects `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` into the active GitHub Pages build job.
- Adds a production environment verification step before `npm run build`.
- Prevents future GitHub Pages deploys from silently shipping without required Vite config.

### PR Plan

1. Branch: `codex/supabase-recovery-readiness`
2. Commit the workflow guardrail and this recovery report.
3. Before merge, set GitHub values:
   - variable `VITE_BACKEND_URL`
   - variable `VITE_SUPABASE_URL`
   - secret `VITE_SUPABASE_ANON_KEY`
4. Resume or recreate Supabase project `pedymtymubpirhaikymj`.
5. Replace any mislabeled anon key under `SUPABASE_SERVICE_ROLE_KEY` with a real `service_role` key.
6. With `CLOUDFLARE_API_TOKEN`, audit and update Worker secrets.
7. Redeploy Worker and frontend.
8. Re-run endpoint verification with a real authenticated user and Stripe test checkout.
