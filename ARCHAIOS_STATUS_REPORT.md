# ARCHAIOS Status Report

Audit date: June 3, 2026

Prepared for: Colonel Saint Black

Mode: Read-only audit of repositories, configs, deployment signals, and live endpoints. No code, deployment, git history, or runtime state was intentionally changed during this audit apart from creation of this report file.

## Current Mission Status

ARCHAIOS is not in a clean single-runtime state. The stack is partially operational, but governance and runtime ownership are split across multiple repositories and workspaces:

- The deployed frontend is live at `https://saintblack-ai.github.io/ai-assassins-client/`.
- The deployed backend health endpoint is live at `https://archaios-saas-worker.quandrix357.workers.dev/api/health`.
- The backend can serve public pricing and guest dashboard payloads.
- Authenticated billing and full data-backed dashboard validation are not launch-ready.
- OpenClaw is installed and validated at the config level, but full agent execution is blocked by credential/runtime mismatches.

Estimated overall completion: 68%

## 1. Repository Structure

### Active repositories identified

1. `~/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019`
   - Git remote: `https://github.com/saintblack-ai/archaios-system.git`
   - Current branch: `fix/github-pages-spa-fallback`
   - Status: dirty working tree
   - Function: current mixed workspace containing the Cloudflare worker, `client/`, `server/`, Supabase SQL, and legacy ARCHAIOS material

2. `~/ARCHAIOS/ai-assassins-client`
   - Git remote: `https://github.com/saintblack-ai/ai-assassins-client.git`
   - Current branch: `main`
   - Status: clean and aligned with `origin/main`
   - Function: active deployed frontend repository for GitHub Pages

3. `~/ARCHAIOS/archaios-core`
   - No remote configured
   - Current branch: `main`
   - Status: untracked `ARCHAIOS_COMMAND_BRIEFING/`
   - Function: self-declared canonical ARCHAIOS core repository

4. `~/openclaw-work`
   - Local git repo with no remote
   - Status: no commits yet, many staged and untracked files
   - Function: OpenClaw worker workspace and operator scratchpad

5. `~/openclaw-work/archaios-dashboard`
   - Local git repo with no remote
   - Status: clean on `main`
   - Function: nested dashboard project inside OpenClaw workspace

6. `~/.openclaw/workspace`
   - Local git repo
   - Status: dirty working tree
   - Function: OpenClaw-generated workspace containing prior ARCHAIOS reports

### Duplicate or overlapping projects

- `client/` inside `archaios-system` and `~/ARCHAIOS/ai-assassins-client` are overlapping frontend tracks.
- `client/archaios-core/` inside `archaios-system` and `~/ARCHAIOS/archaios-core` both claim core runtime territory.
- `server/`, root `worker.js`, and `client/worker/index.js` represent overlapping backend/API implementations.
- `app/` is a separate Next.js surface overlapping with the Vite frontend.
- `ai-assassins/` and `ai-assassins-app/` are legacy or alternate product lines.
- `Archaios OS/`, root Python agent folders, and `ARCHAIOS_Codex_AI_Agent_Pack/` are additional legacy parallel systems.

### Likely abandoned or sidelined paths

These look historical, experimental, or no longer primary:

- `ai-assassins-app/`
- `ai-assassins/`
- `Archaios OS/`
- root Python role-agent folders: `Author_AI/`, `Executor_AI/`, `Mentor_AI/`, `Scholar_AI/`
- `ARCHAIOS_Codex_AI_Agent_Pack/`
- `app/` as a parallel Next.js shell
- `~/openclaw-work/archaios-dashboard` as a nested local-only dashboard

### Canonical runtime assessment

There is a governance conflict:

- `~/ARCHAIOS/archaios-core/AGENTS.md` explicitly declares `~/ARCHAIOS/archaios-core` as canonical.
- `runtime-consolidation-report.md` inside the current workspace recommends `client/archaios-core/` as the official local/runtime orchestration layer.
- The actual deployed frontend currently traces to the separate repository `~/ARCHAIOS/ai-assassins-client`.
- The active deployed backend is the Cloudflare worker hosted as `archaios-saas-worker`.

Conclusion:

- Declared canonical repository: `~/ARCHAIOS/archaios-core`
- Actual deployed frontend repository: `~/ARCHAIOS/ai-assassins-client`
- Actual deployed backend source of record appears to be the `archaios-system` workspace
- Operationally, there is no single clean canonical ARCHAIOS runtime today

## 2. OpenClaw Status

### Installation

- `openclaw` binary present at `~/.npm-global/bin/openclaw`
- Installed version: `OpenClaw 2026.4.21`
- Profile validation succeeded: `openclaw --profile archaios-worker config validate`

### Gateway configuration

Verified in `~/.openclaw-archaios-worker/openclaw.json`:

- mode: `local`
- bind: `loopback`
- port: `18789`
- auth mode: `token`
- tools allowlist: empty
- gateway tools allowlist: empty
- plugin allowlist includes `acpx`, `openai`, `memory-core`

Assessment: gateway config is valid and intentionally constrained.

### TUI configuration

- No active TUI-specific workflow is configured in the worker profile.
- The setup notes in `client/OPENCLAW_ARCHAIOS_SETUP.md` indicate onboarding was done with `--skip-ui`.

Assessment: OpenClaw is installed as a headless/local gateway worker, not as a configured TUI operator surface.

### Agent execution capability

Current status: partially blocked.

- Worker scripts are present under `~/openclaw-work/scripts/`.
- `research.sh` and related wrappers require `OPENAI_API_KEY` in the current shell.
- The current shell `OPENAI_API_KEY` is present but rejected by the OpenAI API with HTTP `401`.
- The ARCHAIOS bridge defaults to `http://localhost:3000/api/ai/chat`, while the active production backend is a Cloudflare Worker host, not a local app on port 3000.

Assessment:

- Config validation: pass
- Real model inference from current shell credentials: fail
- ARCHAIOS bridge target alignment: fail
- End-to-end OpenClaw task execution: not ready

### Broken dependencies or blockers

- Invalid or unusable shell OpenAI credential
- OpenClaw bridge points to local `localhost:3000` instead of the active backend architecture
- Sandboxing remains `off`
- No container isolation because Docker/Podman is not installed

## 3. Codex Readiness

### OpenAI connectivity

Two different readiness states were found:

- Current shell `OPENAI_API_KEY`: present, but live OpenAI API check returned HTTP `401`
- `server/.env` `OPENAI_API_KEY`: present with valid-looking prefix, but live OpenAI API check also returned HTTP `401`

Assessment: OpenAI credential material exists, but the tested keys are not currently accepted by the API.

### Model configuration

- Worker/backend defaults consistently reference `gpt-4o-mini`
- Root worker config sets `OPENAI_MODEL = "gpt-4o-mini"`
- OpenClaw profile primary model is `openai/gpt-4o-mini`

Assessment: model selection is consistent.

### API key configuration without exposing secrets

- Shell key exists but is invalid in practice
- `server/.env` contains a key value but it also failed live API authentication
- Root `.env.example`, `server/.env.example`, and bootstrap docs all expect OpenAI env configuration

### Codex blockers

- OpenAI API authentication failure
- No confirmed valid local shell key for OpenClaw/Codex-driven execution
- Local shell lacks the broader Supabase and Stripe env expected by the Node and Next surfaces
- Runtime ownership is split across multiple repos, which makes "the" Codex target ambiguous

## 4. GitHub Status

### Repository health

`archaios-system`:

- Remote reachable and public
- Default branch: `main`
- Open issues: 11
- Last pushed to GitHub: May 31, 2026

`ai-assassins-client`:

- Remote reachable and public
- Default branch: `main`
- Open issues: 0
- Last pushed to GitHub: May 11, 2026

### Branch status

`archaios-system` local workspace:

- Current branch: `fix/github-pages-spa-fallback`
- Local `main` is behind `origin/main` by 3 commits
- Current working branch is based on the older local main state

`ai-assassins-client`:

- Local `main` is aligned with `origin/main`

### Uncommitted changes

`archaios-system` has both modified and untracked files, including:

- `.github/workflows/deploy.yml`
- `.gitignore`
- `client/worker/index.js`
- `package.json`
- new docs, SQL, and command briefing material

`~/openclaw-work` is highly dirty and appears to be a scratch workspace rather than a clean tracked repo.

`~/.openclaw/workspace` is also dirty.

### Workflow status

`archaios-system` live GitHub Actions:

- `Worker Heartbeat` latest run succeeded on June 2, 2026
- `CI - client build` latest run succeeded on May 31, 2026
- Several older Dependabot-triggered CI runs failed on April 18 and April 25, 2026
- `Deploy Vite Client To GitHub Pages` shows older failures on April 18, 2026 and no recent successful deploy cadence comparable to the separate frontend repo

`ai-assassins-client` live GitHub Actions:

- `Build and Deploy Frontend` succeeded repeatedly, including June 2, June 1, and May 31, 2026

### Broken CI/CD pipelines

Confirmed or likely broken:

- `archaios-system` GitHub Pages deploy workflow history includes multiple failures on April 18, 2026
- Local workflow definitions in `archaios-system` do not match live remote workflow inventory cleanly, indicating branch drift
- Production frontend deployment is effectively happening from `ai-assassins-client`, not from `archaios-system`

Assessment:

- Frontend CI/CD is healthy in `ai-assassins-client`
- Backend heartbeat is healthy in `archaios-system`
- Deployment ownership is split and confusing

## 5. Supabase Status

### Project connection

Findings conflict in an important way:

- `client/.env.production` contains a Supabase URL and anon key
- The deployed worker responds on public endpoints
- The public guest dashboard payload currently reports analytics source as `worker-fallback`, not `supabase`
- Direct reachability test to the configured Supabase project host failed DNS resolution

Assessment:

- Supabase is configured on paper in env files
- The currently configured project URL appears unreachable from live verification
- The deployed worker is falling back instead of returning live Supabase analytics

### Authentication configuration

Positive signs:

- Frontend uses Supabase browser auth
- Signed-out requests to `/api/subscription` and `/api/alerts` return HTTP `401`
- Client code contains pending checkout persistence and post-confirmation retry logic

Limitations:

- Unauthenticated `401` only proves the guest path is guarded
- It does not prove end-to-end login works against the actual live Supabase project

### Database schema

Schema assets exist for:

- `profiles`
- `subscriptions`
- `alerts`
- `leads`
- `cta_events`
- `revenue_events`
- cron/support tables

Notable production schema path:

- `client/supabase/sql/2026-04-14_production_core_tables.sql`

Tier alignment patch also exists:

- `client/supabase/sql/2026-04-25_profiles_tier_alignment.sql`

### Environment variables

Local file presence:

- `client/.env`, `.env.development`, and `.env.production` contain frontend Supabase values
- `server/.env` contains Supabase service-role configuration

Current shell presence:

- missing `SUPABASE_URL`
- missing `NEXT_PUBLIC_SUPABASE_URL`
- missing `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- missing `SUPABASE_SERVICE_ROLE_KEY`

### Missing or broken configuration

- No `supabase/config.toml` exists in the workspace root
- Current shell is not ready for local Supabase-backed Node/Next runs
- The configured production Supabase host did not resolve during direct check
- Worker analytics are falling back, which strongly suggests missing service-role connectivity, dead project URL, or both

## 6. ARCHAIOS Dashboard

### Frontend builds

Status: build pipeline healthy in the separate frontend repo.

- `ai-assassins-client` GitHub Pages workflow is succeeding on a daily cadence
- Frontend host returns HTTP `200`

### Backend connectivity

Status: partially healthy.

- `/api/health` returns healthy payload
- `/api/pricing` returns HTTP `200`
- `/api/platform/dashboard` returns HTTP `200`

### API routes

Verified live behavior:

- `GET /api/health`: healthy
- `GET /api/pricing`: healthy
- `GET /api/platform/dashboard`: healthy for guest mode
- `GET /api/subscription`: `401 Unauthorized` when signed out
- `GET /api/alerts`: `401 Unauthorized` when signed out
- `POST /api/stripe/checkout`: returned HTTP `500` with body `"Unauthorized"` when signed out

Important note:

- UI code blocks signed-out checkout before redirect, which is correct
- The deployed backend checkout endpoint currently surfaces unauthorized access with HTTP `500`, not `401`
- That mismatch is a production quality issue

### Dashboard functionality

Working:

- guest dashboard shell
- pricing payload
- premium lock presentation
- public frontend availability

Not proven or not healthy:

- live Supabase-backed analytics
- authenticated subscription sync
- authenticated alert flows
- billing success path

### Broken components or risks

- Guest dashboard analytics are fallback-generated, not confirmed live
- Health endpoint is too shallow; it does not verify Supabase or Stripe connectivity
- Deployment source split means the live frontend and backend may not match the same code generation

## 7. AI Assassins Status

### Current development state

AI Assassins is in late integration / pre-launch readiness, not launch-ready.

Evidence:

- live public frontend
- live public backend
- recurring successful frontend deploys
- billing and auth code paths implemented
- unresolved environment, data, and runtime ownership issues

### Stripe integration readiness

Implemented:

- checkout route exists
- webhook route exists
- required event handling code exists for:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- schema and profile tier sync logic exist

Not launch-ready:

- live signed-out checkout endpoint behavior is wrong
- no successful end-to-end checkout validation was possible in this audit
- local shell lacks Stripe env
- production Stripe secret and price validation was not externally provable from available safe checks

### Authentication readiness

Implemented:

- Supabase browser auth wiring
- signed-out checkout blocking in UI
- pending tier saved locally and retried after confirmation/sign-in

Not proven:

- live authenticated sign-in against the currently configured Supabase project
- live subscription refresh after checkout

### Deployment readiness

Frontend:

- deployment pipeline healthy in `ai-assassins-client`

Backend:

- public worker healthy
- heartbeat healthy
- deeper data dependencies not healthy enough to call launch-ready

### Remaining blockers before launch

1. Resolve canonical runtime ownership across repos.
2. Fix OpenAI credential validity for local automation and Codex/OpenClaw flows.
3. Verify or replace the Supabase project host currently referenced by production env.
4. Restore live Supabase analytics so dashboard payload source is not `worker-fallback`.
5. Validate authenticated login against production Supabase.
6. Validate end-to-end Stripe test checkout and webhook-to-subscription sync.
7. Correct unauthorized checkout response handling on the deployed worker.
8. Collapse frontend/backend deployment ownership into a clearly documented source of truth.

## 8. Infrastructure Review

### Critical issues

1. No single canonical runtime is actually controlling the stack.
2. OpenAI credentials tested during audit were rejected by the API.
3. The configured Supabase host appears unreachable and dashboard analytics are falling back.
4. Stripe end-to-end readiness is unverified, and the deployed checkout endpoint has incorrect unauthorized behavior.
5. Frontend deployment and backend deployment are split across different repositories with drift between them.

### Medium-priority issues

1. `archaios-system` local checkout is behind `origin/main` by 3 commits.
2. Multiple dirty workspaces increase rollback and audit risk.
3. Health checks are shallow and can report green while data dependencies are degraded.
4. OpenClaw bridge still assumes a localhost app architecture that no longer matches the deployed stack.
5. Duplicate legacy projects make operational ownership unclear.

### Low-priority issues

1. OpenClaw TUI is not configured because the setup is intentionally headless.
2. No container sandbox for OpenClaw.
3. Several old Dependabot CI runs failed historically, though recent primary workflows are healthier.

## Critical Blockers

- Invalid or expired OpenAI credentials in tested locations
- Supabase project reachability/connectivity failure
- No proven auth-to-subscription production path
- No proven Stripe webhook-to-tier synchronization in live conditions
- Runtime ownership split across `archaios-system`, `ai-assassins-client`, `archaios-core`, and OpenClaw workspaces

## Next 7 Days

1. Name one system of record for frontend, backend, and ARCHAIOS core runtime.
2. Validate and rotate OpenAI credentials for shell, server, and worker contexts.
3. Verify the production Supabase project reference and restore direct reachability.
4. Run a controlled auth test against production Supabase.
5. Run one full Stripe test checkout with webhook confirmation and profile tier verification.
6. Fix deployed worker unauthorized checkout response handling.

## Next 30 Days

1. Consolidate duplicate repos and formally archive sidelined paths.
2. Move dashboard health checks from shallow uptime to dependency-aware checks.
3. Standardize deployment documentation so frontend and backend come from one documented release flow.
4. Align OpenClaw bridge targets with the active runtime architecture.
5. Remove or quarantine legacy agent stacks that are no longer operational.

## Next 90 Days

1. Establish one canonical ARCHAIOS runtime repo with one release branch strategy.
2. Unify local automation, OpenClaw, and Codex against the same environment contract.
3. Build a real launch checklist with repeatable auth, billing, webhook, and recovery tests.
4. Separate archive, experimentation, and production code paths into clearly governed domains.
5. Add operator-grade observability for auth failures, Stripe failures, and Supabase fallbacks.

## Recommended Primary Focus

Primary focus: restore production data truth before adding features.

In order:

1. Fix Supabase connectivity and verify live auth.
2. Fix OpenAI credential validity for automation.
3. Validate one complete Stripe test transaction and subscription-tier sync.
4. Declare one canonical runtime and demote the rest to archive or support status.

## Executive Summary

ARCHAIOS is alive but split.

The public frontend is up. The worker is up. The GitHub Pages pipeline for `ai-assassins-client` is healthy, and the worker heartbeat for `archaios-system` is healthy. But the system underneath is not yet coherent enough for a confident launch. The biggest problems are not cosmetic. They are identity and truth problems: which repository is actually canonical, which Supabase project is real, which OpenAI key is valid, and whether Stripe can grant access reliably after payment.

Until those four questions are resolved with live verification, Colonel-level recommendation is:

Hold launch posture at controlled pre-launch readiness.
