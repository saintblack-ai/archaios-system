# SYSTEM ARCHITECTURE

Status: Phoenix Phase Zero
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Purpose

This document describes the Archaios / AI Assassins production architecture as prepared for controlled recovery. It is safe-prep documentation only. It does not authorize production deployment, Supabase creation, Stripe activity, or revenue collection.

## Frontend

Primary frontend:

- Repository/workspace path: `client/`
- Framework: Vite / React
- Production doctrine host: `https://saintblack-ai.github.io/ai-assassins-client/`
- Active deployment workflow: `.github/workflows/deploy.yml`
- Required browser env:
  - `VITE_BACKEND_URL`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`

Responsibilities:

- Public landing, pricing, dashboard shell, operator views.
- Supabase browser auth through `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Sends backend calls to Cloudflare Worker through `VITE_BACKEND_URL`.
- Signed-out users may view dashboard shell but must not start paid checkout.

Hardening notes:

- Browser bundle must never receive `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, or `STRIPE_WEBHOOK_SECRET`.
- GitHub Pages workflow now validates required Vite env before build.
- Vercel may remain linked, but GitHub Pages is the doctrine production frontend path unless changed by operator decision.

## Worker

Primary Worker:

- Name: `archaios-saas-worker`
- Host: `https://archaios-saas-worker.quandrix357.workers.dev`
- Root config: `wrangler.toml`
- Client Worker config: `client/wrangler.jsonc`

Primary routes:

- `GET /api/health`
- `GET /api/pricing`
- `POST /api/leads`
- `POST /api/cta-click`
- `GET /api/subscription`
- `GET /api/platform/dashboard`
- `GET /api/alerts`
- `DELETE /api/alerts`
- `POST /api/stripe/checkout`
- `POST /api/stripe/webhook`
- `POST /api/stripe/customer-portal`
- `GET /api/admin/dashboard`
- `POST /api/internal/cron/dashboard-signals`
- `POST /api/internal/cron/activity-feed`
- `POST /api/internal/cron/metrics-snapshots`

Required Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_ELITE`
- `ADMIN_EMAIL`

Worker vars:

- `BACKEND_BASE_URL`
- `SUPABASE_REQUEST_TIMEOUT_MS`
- `SUPABASE_CRON_RUNS_TABLE`
- `SUPABASE_DASHBOARD_SIGNALS_TABLE`
- `SUPABASE_ACTIVITY_FEED_TABLE`
- `SUPABASE_METRICS_SNAPSHOTS_TABLE`
- cron path/schedule vars in `client/wrangler.jsonc`

## Database

Database platform: Supabase Postgres.

Original ref under investigation:

- `pedymtymubpirhaikymj`
- URL: `https://pedymtymubpirhaikymj.supabase.co`
- Current status: unreachable/DNS failure from recent checks.

Expected runtime tables:

- `auth.users`
- `public.profiles`
- `public.subscriptions`
- `public.leads`
- `public.alerts`
- `public.cta_events`
- `public.revenue_events`

Supporting tables:

- `public.cron_job_runs`
- `public.dashboard_signal_runs`
- `public.activity_feed_runs`
- `public.metrics_snapshots`
- `public.archaios_command_entries`
- `public.archaios_division_snapshots`
- `public.archaios_archive_assets`
- `public.archaios_projects`
- `public.archaios_agent_runs`

Schema source of truth:

- Minimum production manifest: `docs/ARCHAIOS_MIGRATION_MANIFEST.md`
- Primary migration directory: `client/supabase/sql/`
- Legacy/expansion migrations: `sql/`, `archaios-agents/sql/`

## Stripe

Purpose:

- Test-mode subscription checkout for Pro and Elite.
- Webhook-driven subscription state sync into Supabase.

Required objects:

- Pro test price id.
- Elite test price id.
- Webhook endpoint: `POST /api/stripe/webhook`.
- Test secret key and webhook secret stored only in Worker/platform secrets.

Pre-license restrictions:

- No live-mode Stripe keys.
- No real payments.
- No live checkout.
- No production revenue collection.

## GitHub

Primary repository:

- `https://github.com/saintblack-ai/archaios-system.git`

Primary workflow:

- `.github/workflows/deploy.yml`

Supporting workflow:

- `.github/workflows/worker_heartbeat.yml`

Required GitHub Actions configuration:

- Variable: `VITE_BACKEND_URL`
- Variable: `VITE_SUPABASE_URL`
- Secret: `VITE_SUPABASE_ANON_KEY`

GitHub must not store:

- Supabase service-role key for browser builds.
- Stripe secret key.
- Stripe webhook secret.
- Cloudflare API token except as an intentional deployment secret with restricted scope.

## Cloudflare

Primary Cloudflare asset:

- Worker: `archaios-saas-worker`
- Host: `https://archaios-saas-worker.quandrix357.workers.dev`

Cloudflare stores:

- Worker runtime secrets.
- Worker runtime vars.
- Cron triggers.

Cloudflare access needed later:

- `CLOUDFLARE_API_TOKEN` or authenticated Wrangler session.

Phase Zero restriction:

- Do not mutate Worker secrets.
- Do not redeploy Worker.

## Vercel

Linked Vercel project:

- Project: `ai-assassins-client`
- Project id: `prj_O4pTRDr5EglSjPNzMVyOzF4icY7B`
- Team id: `team_1X955N2NaejVA7KZC2thJ3ja`
- Known domains:
  - `ai-assassins-client.vercel.app`
  - `ai-assassins-client-saintblack-ais-projects.vercel.app`
  - `ai-assassins-client-git-main-saintblack-ais-projects.vercel.app`

Role:

- Secondary/linked frontend deployment platform.
- Not the doctrine production frontend unless explicitly promoted.

Required if kept aligned:

- `VITE_BACKEND_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Restriction:

- Do not store service-role or Stripe secrets in Vite browser env.

## Critical Data Flow

1. Browser loads GitHub Pages frontend.
2. Browser initializes Supabase auth with anon key.
3. User session produces bearer token.
4. Frontend calls Worker with bearer token for protected routes.
5. Worker validates user through Supabase.
6. Worker reads/writes `subscriptions`, `profiles`, `alerts`, `leads`, `cta_events`, and `revenue_events`.
7. Stripe webhook updates Supabase subscription state through service-role key.
8. Dashboard unlocks Pro/Elite features based on active subscription state.

## Phase Zero Status

Ready:

- Architecture is documentable.
- Migration manifest exists.
- Phoenix runbook exists.
- Dry-run smoke script exists.

Blocked:

- Supabase replacement project.
- Production Worker secret mutation.
- Production frontend launch.
- Stripe checkout.
- Revenue collection.
