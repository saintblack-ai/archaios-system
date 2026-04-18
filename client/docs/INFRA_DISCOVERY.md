# ARCHAIOS Infrastructure Discovery

Generated: 2026-04-16

Scope requested: Supabase, Cloudflare, Vercel, GitHub, Stripe, and local repositories under `ARCHAIOS_INFRASTRUCTURE`.

## Discovery Boundary

- Requested root `ARCHAIOS_INFRASTRUCTURE` was not found in the accessible local filesystem.
- The active workspace is `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/client`.
- Additional accessible repos/folders found:
  - `/Users/quandrixblackburn/projects/Ai-Assassins`
  - `/Users/quandrixblackburn/saintblack-ai.github.io`
  - `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS`
- `/Users/quandrixblackburn/saintblack-ai.github.io/Ai-Assassins` is a static subfolder, not a separate detected Git repo.

## Repository Inventory

### ai-assassins-client

- Path: `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/client`
- Git remote: `https://github.com/saintblack-ai/ai-assassins-client.git`
- Purpose guess: current premium ARCHAIOS / AI Assassins React client with Cloudflare Worker backend, Supabase auth, Stripe checkout, operator views, book growth modules, and monetization UI.
- Package manager: npm
- Package name: `ai-assassins-client`
- Framework/runtime:
  - Frontend: Vite + React
  - Backend: Cloudflare Worker at `worker/index.js`
  - Database/auth: Supabase
  - Payments: Stripe Checkout + webhooks
- Scripts found:
  - `npm run dev` -> `vite`
  - `npm run build` -> `vite build`
  - `npm run preview` -> `vite preview`
  - `npm run worker:dev` -> `wrangler dev --test-scheduled`
  - `npm run worker:check` -> `wrangler check`
  - `npm run worker:deploy` -> `wrangler deploy`
- CI/CD config:
  - `.github/workflows/deploy.yml`
  - `vercel.json`
  - `wrangler.jsonc`
- Build command found: `npm run build`
- Deploy targets found:
  - GitHub Pages workflow
  - Vercel config
  - Cloudflare Worker config
- Notable API surface in local instructions:
  - `GET /api/subscription`
  - `GET /api/alerts`
  - `DELETE /api/alerts`
  - `POST /api/stripe/checkout`
  - `POST /api/leads`
  - `GET /api/platform/dashboard`

### Ai-Assassins

- Path: `/Users/quandrixblackburn/projects/Ai-Assassins`
- Git remote: not fetched during this audit from local output, but folder is a Git-style product repo based on files.
- Purpose guess: older or parallel AI Assassins backend/product root with Cloudflare Worker, static docs dashboard, mobile wrappers, daily brief automation, Supabase migrations, billing hooks, and app-store/mobile release support.
- Package manager: npm at root, npm in `worker/`, npm in `docs/`, npm in `mobile/`; Python metadata also present through `pyproject.toml`.
- Package name: `ai-assassins`
- Worker package name: `ai-assassins-api`
- Framework/runtime:
  - Worker API: `worker/src/index.ts`
  - Static frontend: `docs/`
  - Mobile: Capacitor-style mobile package
  - Database/auth: Supabase
  - Payments: Stripe
  - Email: Resend references
- Root scripts found:
  - `npm run build` -> `npm --prefix docs run build`
  - `npm run sitrep:dev`
  - `npm run sitrep:send-test`
  - `npm run sitrep:test-auth`
  - `npm run supabase:secrets`
  - `npm run worker:deploy`
  - `npm run pages:deploy`
  - `npm run mobile:sync`
  - `npm run mobile:prepare:ios`
  - `npm run mobile:prepare:android`
  - `npm run mobile:release:prep`
- Worker scripts found:
  - `npm run deploy` -> `wrangler deploy`
  - `npm run dev` -> `wrangler dev`
- CI/CD config:
  - `.github/workflows/mobile-build.yml`
  - `.github/workflows/pages-deploy.yml`
  - `.github/workflows/security-check.yml`
  - `.github/workflows/supabase-heartbeat.yml`
  - `.github/workflows/worker-deploy.yml`
- Cloudflare config:
  - `worker/wrangler.jsonc`
  - `worker/wrangler.toml`
- Daily cron found:
  - `0 7 * * *`
- Important finding:
  - Several production vars in `worker/wrangler.toml` are committed as empty placeholders, including Supabase and Stripe price IDs.

### saintblack-ai.github.io

- Path: `/Users/quandrixblackburn/saintblack-ai.github.io`
- Git remote: `https://github.com/saintblack-ai/saintblack-ai.github.io.git`
- Purpose guess: public marketing/static GitHub Pages layer plus experimental Next-style agent/admin code and static AI Assassins subsite.
- Package manager: none detected at root.
- Package manifest: none detected.
- Build command: none detected.
- CI/CD config: none detected under `.github/workflows`.
- Runtime files found:
  - Static pages in `docs/`, root `index.html`, and `Ai-Assassins/`.
  - Next-style `app/` code with API routes, agents, Stripe and Supabase helpers.
  - SQL migrations in `sql/`.
- Important finding:
  - This repo contains TypeScript/Next-like code but no root `package.json`, which means local or Vercel builds are not currently self-describing from this checkout.

### Archaios OS

- Path: `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS`
- Git remote: `https://github.com/saintblack-ai/archaios-os.git`
- Purpose guess: internal ARCHAIOS operator/control-plane repo with Python orchestration, Streamlit dashboard, daily jobs, metrics/logs, and Cloudflare remote trigger worker.
- Package manager: pip/manual Python setup
- Package manifest: none detected
- README setup:
  - `pip install streamlit`
  - `streamlit run dashboard/streamlit_app.py`
  - `python jobs/daily/run_daily.py`
- CI/CD config:
  - `.github/workflows/archaios_daily.yml`
  - `.github/workflows/codex_pr_review.yml`
- Cloudflare config:
  - `cloudflare_worker/wrangler.toml`
- Important finding:
  - `cloudflare_worker/wrangler.toml` uses placeholder endpoint `https://example.com/api/archaios/daily`.

## CI/CD Config Summary

- GitHub Actions present:
  - `ai-assassins-client`: frontend build/deploy to GitHub Pages plus health checks.
  - `Ai-Assassins`: Pages deploy, Worker deploy, mobile build, Supabase heartbeat, security audit.
  - `Archaios OS`: daily Python job and Codex PR review.
  - `saintblack-ai.github.io`: no workflow detected.
- Vercel config present:
  - `ai-assassins-client`: `vercel.json`.
  - `saintblack-ai.github.io`: no `vercel.json` or package manifest detected.
- Cloudflare Worker config present:
  - `ai-assassins-client`: `wrangler.jsonc`.
  - `Ai-Assassins`: `worker/wrangler.jsonc` and `worker/wrangler.toml`.
  - `Archaios OS`: `cloudflare_worker/wrangler.toml`.

## Local Tool Availability

- `gh`: present
- `wrangler`: present
- `supabase`: present
- `stripe`: present
- `vercel`: missing

## External Service Check Status

External service state was not fetched because required credentials/logins are missing or incomplete. See `ENV_GAPS.md`.

