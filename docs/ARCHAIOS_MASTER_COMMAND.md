# Archaios Master Command

**Operating scope:** Archaios, AI Assassins, QX Technology, The Black Vault, and the Saint Black Legacy System.  
**Purpose:** Maintain the existing ecosystem, restore production correctness, create a repeatable customer path, and preserve institutional records. This is an operating map, not a feature plan.

## System Overview

| System | Role | Current authority | Status |
| --- | --- | --- | --- |
| Archaios | Core operating stack, dashboard, research memory, subscription data | Repository root and `client/` | Partially implemented; production recovery required |
| AI Assassins | Customer-facing Vite/React frontend and Pro/Elite offer | `client/` | Build/deploy workflow exists; live buyer journey not verified |
| QX Technology | Business and technical umbrella | This repository and account ownership | Active operating identity |
| The Black Vault | Long-term research, assets, source records, and recovery materials | Versioned archive plus external backup | Documentation exists; independent archival copy is incomplete |
| Saint Black Legacy System | Creative works, journals, music, provenance, family continuity | Black Vault preservation protocol | Material is distributed; transfer package not yet assembled |

## Repositories And Working Areas

| Location | Purpose | Operating rule |
| --- | --- | --- |
| `https://github.com/saintblack-ai/archaios-system` | Canonical Git repository | Treat `main` as production source only after review and successful checks. |
| Repository root | Next.js Vercel application, canonical Worker source, shared docs and scripts | Do not mix unreviewed legacy changes into production deployments. |
| `client/` | Canonical Vite/React frontend for GitHub Pages | Deploy through `.github/workflows/deploy.yml`. |
| `worker.js` and `wrangler.toml` | Intended `archaios-saas-worker` Cloudflare backend | Verify live health identity after every deployment. |
| `client/supabase/sql/` | Canonical production migration chain | Apply only through the migration manifest and record the applied revision. |
| `docs/` | Operating manuals, runbooks, recovery plans | Keep human-operable documents here. |
| `archaios-agents/`, `supabase/functions/`, `server/`, `Archaios OS/` | Supporting or legacy surfaces | Do not deploy or expand unless a documented production decision requires it. |

## Services And Deployment Surfaces

| Service | Existing endpoint or project | Responsibility | Verified state |
| --- | --- | --- | --- |
| GitHub | `saintblack-ai/archaios-system` | Source control and GitHub Pages workflow | Repository reachable; open issue and PR search returned none; local worktree is dirty. |
| GitHub Pages | `https://saintblack-ai.github.io/ai-assassins-client/` | Doctrine Vite frontend | Workflow exists; current production route check not performed in this session. |
| Vercel | `archaios-core` / `archaios-system.vercel.app` | Next.js deployment | Deployment is `READY`; `/dashboard` remains `500` because Supabase variables are absent. |
| Cloudflare Workers | `https://archaios-saas-worker.quandrix357.workers.dev` | API, auth, checkout, webhook, scheduled jobs | Endpoint returns `200`, but identifies itself as `archaios-daily-automation`, not the intended SaaS Worker. |
| Supabase | `pedymtymubpirhaikymj.supabase.co` | Auth, Postgres, subscription state | Repository points here; independent DNS/health verification is unresolved. |
| Stripe | QX Technology account | Products, subscriptions, checkout, webhooks | Connected account is reachable; product, price, subscription, and dispute inventory remains unverified. |
| Notion | Second-brain workspace | Human knowledge organization | No repository integration or connected API was found; treat as manual until independently verified. |

## Domains

| Domain or URL | Owner platform | Intended use | Decision |
| --- | --- | --- | --- |
| `archaios-system.vercel.app` | Vercel | Next.js administrative application | Recover or explicitly retire as a production surface. |
| `saintblack-ai.github.io/ai-assassins-client/` | GitHub Pages | Canonical Vite customer frontend | Keep as the customer-facing fallback until an intentional platform decision changes it. |
| `archaios-saas-worker.quandrix357.workers.dev` | Cloudflare | Public backend API | Restore intended Worker identity before any paid flow. |
| Branded custom domain | Not connected | Future customer trust and stable API/app URLs | Do not purchase or change DNS under this command. |

## Deployment Flow

1. Work in a short-lived branch; keep unrelated local changes out of the deployment.
2. Run targeted checks: `npm run check:env`, `npm run build:client`, and the applicable Node tests.
3. Review the diff and merge to `main` only when the production contract is verified.
4. GitHub Actions builds `client/` and deploys the GitHub Pages artifact using `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY`.
5. Deploy the intended backend from repository root with `npx wrangler deploy --name archaios-saas-worker` only after a secret/configuration audit.
6. Vercel requires an explicit redeploy after Production environment-variable changes.
7. Verify external identities and routes: frontend, Worker `/api/health`, Supabase auth, signed-out dashboard, signed-in dashboard, and test-mode checkout.
8. Record deployment commit, deployment ID, health response, and rollback point in Notion and the weekly operations log.

## Critical Dependencies

| Dependency | Required for | Current constraint |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel route rendering and dashboard middleware | Missing from Vercel Production. |
| `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | GitHub Pages frontend | Required by the workflow; values not audited here. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side data, subscriptions, admin status | Must remain server-only; production state unverified. |
| `STRIPE_SECRET_KEY`, webhook secret, Pro/Elite price IDs | Checkout and subscription sync | Integration exists in code but live configuration is unverified. |
| Correct Worker deployment | API, checkout, Archivist and cron routes | Current health identity is wrong. |
| Backup vault and named successor | 100-year preservation | Not yet operationally proven. |

## Command Principles

- One canonical customer frontend, one intended Worker, one migration chain, and one documented release record.
- No production claim without a live route or platform verification.
- Never expose service-role, Stripe, OpenAI, or Worker credentials in browser configuration, Git, Notion, or tickets.
- Preserve source records before cleanup, migration, or recovery action.
- Stop feature work until the launch blockers in `ARCHAIOS_NEXT_90_DAYS.md` are closed.
