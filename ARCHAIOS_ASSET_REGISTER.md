# ARCHAIOS ASSET REGISTER

Status: Phoenix Phase Zero
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Purpose

Master asset inventory for Archaios, AI Assassins, QX Technology, Saint Black Media, City Zoo, and the Blackburn Legacy Archive support systems. This register tracks infrastructure needed for controlled recovery and future launch readiness.

## Repositories

| Repository/Workspace | Remote | Role | Status |
| --- | --- | --- | --- |
| `QX Technology 2019` | `https://github.com/saintblack-ai/archaios-system.git` | Mixed core workspace, Worker, docs, SQL, legacy systems | Active, dirty worktree |
| `client/` inside current repo | same repo | Vite/React frontend source | Active |
| `saintblack-ai/ai-assassins-client` | Vercel metadata references this repo | Linked Vercel frontend history | External/linked |
| `archaios-agents/` | same repo | Agent Worker/package | Not launch-critical |
| `supabase/functions/agent-orchestrator` | same repo | Supabase function source | Not deployed/verified |
| `supabase/functions/stripe-webhook` | same repo | Supabase function source | Superseded by Worker webhook unless revived |

## Domains And URLs

| URL | Platform | Role | Status |
| --- | --- | --- | --- |
| `https://saintblack-ai.github.io/ai-assassins-client/` | GitHub Pages | Doctrine production frontend | Active target |
| `https://saintblack-ai.github.io/ai-assassins-client/pricing` | GitHub Pages | Pricing route | Active target |
| `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | GitHub Pages | Dashboard route | Active target |
| `https://archaios-saas-worker.quandrix357.workers.dev` | Cloudflare Workers | Backend/API | Active health endpoint |
| `https://ai-assassins-client.vercel.app` | Vercel | Secondary linked frontend | Not doctrine production |
| `https://ai-assassins-client-saintblack-ais-projects.vercel.app` | Vercel | Project alias | Secondary |
| `https://ai-assassins-client-git-main-saintblack-ais-projects.vercel.app` | Vercel | Branch alias | Secondary |
| Branded custom domain | TBD | Customer trust, brand, policies | Missing |

## Workers

| Worker | Config | Role | Status |
| --- | --- | --- | --- |
| `archaios-saas-worker` | `wrangler.toml`, `client/wrangler.jsonc` | Main SaaS backend/API | Active target |
| `archaios-agents` | `archaios-agents/wrangler.toml` | Scheduled/agent Worker | Optional |

## Dashboards

| Dashboard | Location | Role | Status |
| --- | --- | --- | --- |
| Customer dashboard | `/dashboard` | Auth, subscription state, paid unlock surface | Pre-license dry-run only |
| Pricing dashboard | `/pricing` | Offer and checkout entry | Checkout disabled until licensed |
| Operator mode | `/operator` | Internal operator view | Prep |
| Archaios command center | `/archaios` assets and SQL | Strategic command interface | Schema planned |
| Cloudflare dashboard | Cloudflare account | Worker/secrets management | Access needed later |
| Supabase dashboard | Supabase account | Database/auth management | Access needed later |
| Stripe dashboard | Stripe account | Test products/webhooks | Test mode only after approval |
| GitHub Actions dashboard | GitHub repo | Frontend deploys and build verification | Active |
| Vercel dashboard | Vercel project | Secondary frontend/deploy metadata | Linked |

## APIs

| API | Source | Business Role | Readiness |
| --- | --- | --- | --- |
| `GET /api/health` | Worker | Health check | Safe to run |
| `GET /api/pricing` | Worker | Public pricing payload | Safe to run |
| `POST /api/leads` | Worker/Supabase | Lead capture | Skip/stub until licensed |
| `POST /api/cta-click` | Worker/Supabase | Funnel analytics | Skip/stub until licensed if user-derived |
| `GET /api/subscription` | Worker/Supabase | Subscription status | Requires auth/test user |
| `GET /api/platform/dashboard` | Worker/Supabase | Dashboard payload | Requires Supabase recovery |
| `GET /api/alerts` | Worker/Supabase | User alert feed | Requires auth/test user |
| `DELETE /api/alerts` | Worker/Supabase | Clear user alerts | Requires auth/test user |
| `POST /api/stripe/checkout` | Worker/Stripe | Checkout session | No live activity until licensed |
| `POST /api/stripe/webhook` | Worker/Stripe | Subscription sync | Unsigned rejection safe; signed test later |
| `POST /api/stripe/customer-portal` | Worker/Stripe | Billing portal | Later only |
| `GET /api/admin/dashboard` | Worker | Admin summary | Requires admin auth |
| `/api/internal/cron/*` | Worker | Scheduled telemetry | Internal |

## Migrations

Minimum production migration set:

1. `client/supabase/sql/2026-04-14_production_core_tables.sql`
2. `client/supabase/sql/2026-04-25_profiles_tier_alignment.sql`
3. `client/supabase/sql/2026-03-31_backend_cron_tables.sql`
4. `client/supabase/sql/2026-03-30_production_scheduled_jobs.sql`
5. `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`

Rollback/support:

- `client/supabase/sql/2026-03-30_production_scheduled_jobs_rollback.sql`

Legacy/expansion migration directories:

- `sql/`
- `archaios-agents/sql/`

Conflict warning:

- Root `sql/` includes overlapping definitions for `profiles`, `subscriptions`, `leads`, `alerts`, `cta_events`, and agent tables. Use `docs/ARCHAIOS_MIGRATION_MANIFEST.md` before applying any legacy file.

## Supabase Assets

| Asset | Role | Status |
| --- | --- | --- |
| Project ref `pedymtymubpirhaikymj` | Original auth/database | Unreachable/unknown |
| `auth.users` | Supabase auth identity | Required |
| `public.profiles` | User profile/tier | Required |
| `public.subscriptions` | Stripe subscription state | Required |
| `public.leads` | Lead capture | Required but no real writes pre-license |
| `public.alerts` | Paid dashboard alert history | Required |
| `public.cta_events` | Funnel analytics | Required |
| `public.revenue_events` | Revenue/webhook telemetry | Required |

## Cloudflare Assets

| Asset | Role | Status |
| --- | --- | --- |
| `archaios-saas-worker` | Main backend | Active target |
| Worker secrets | Supabase/Stripe/admin runtime secrets | Must be audited later |
| Workers.dev URL | Backend URL | Active target |
| Cron triggers | Internal scheduled jobs | Configured |

## Stripe Assets

| Asset | Role | Status |
| --- | --- | --- |
| Pro test price | Subscription checkout | Needed later |
| Elite test price | Subscription checkout | Needed later |
| Webhook endpoint | Subscription sync | Needs test-mode verification later |
| Customer portal | Billing management | Later |
| Live mode keys | Production revenue | Forbidden pre-license |

## Critical Asset Gaps

- Business/license approval.
- Approved vault.
- Supabase replacement project authorization.
- Cloudflare API access.
- GitHub Actions vars/secrets.
- Verified Stripe test-mode product/price/webhook setup.
- Branded custom domain.
- Published policies.
- Final decision on Vercel role.
- Final migration conflict decisions for legacy root SQL.
