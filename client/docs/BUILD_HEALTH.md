# ARCHAIOS Build Health

Generated: 2026-04-16

No build commands were run during this audit because the user requested no code changes and the audit stopped at missing service credentials. Running Vite builds would rewrite `dist/` artifacts in this workspace.

## Local Build Script Inventory

| Repo | Package Manager | Build Script | CI Build Evidence | Current Audit Result |
|---|---|---|---|---|
| `ai-assassins-client` | npm | `npm run build` -> `vite build` | `.github/workflows/deploy.yml` runs `npm ci` and `npm run build` | Not run in this audit |
| `Ai-Assassins` | npm | `npm run build` -> `npm --prefix docs run build` | Pages/mobile workflows build `docs` assets | Not run in this audit |
| `Ai-Assassins/worker` | npm | no build script; deploy/dev via Wrangler | Worker deploy workflow runs `npm install` then `wrangler-action` | Not run in this audit |
| `saintblack-ai.github.io` | none detected | none detected | no workflow detected | Build ownership unclear |
| `Archaios OS` | pip/manual | no package build; `streamlit run` and `python jobs/daily/run_daily.py` | `archaios_daily.yml` runs Python daily job | Not run in this audit |

## Known Local Build Context

`ai-assassins-client` has a production-capable Vite build script and existing deployment docs. Earlier local work produced a successful Vite production build, but this audit did not rerun it to avoid changing build artifacts.

## CI/CD Health From Local Files

### ai-assassins-client

- Workflow: `.github/workflows/deploy.yml`
- Trigger: push to `main`, manual dispatch, scheduled cron.
- Node version: `24`.
- Required workflow config:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_BACKEND_URL`
  - `VITE_ADMIN_EMAIL`
- Healthcheck URLs:
  - frontend: `https://saintblack-ai.github.io/ai-assassins-client/`
  - backend: `https://archaios-saas-worker.quandrix357.workers.dev/api/health`
- Risk:
  - If GitHub Actions variables/secrets are not configured, workflow intentionally fails before build.

### Ai-Assassins

- Pages workflow deploys `docs`.
- Worker workflow deploys Cloudflare Worker from `worker`.
- Mobile workflow builds Android and iOS artifacts.
- Supabase heartbeat workflow checks `https://archaios-saas-worker.quandrix357.workers.dev/api/health`.
- Risk:
  - `worker/wrangler.toml` contains empty production vars for Supabase and Stripe price IDs.
  - Some pricing and billing docs appear older than current Pro `$49` / Elite `$99` target.

### saintblack-ai.github.io

- No root package manifest detected.
- No workflow detected.
- Risk:
  - Contains app code that may not build or deploy without reconstructing package metadata.

### Archaios OS

- Daily workflow runs `python jobs/daily/run_daily.py`.
- Codex PR review workflow uses `OPENAI_API_KEY`.
- Risk:
  - Python dependencies are not pinned in a detected requirements file.
  - Cloudflare remote trigger endpoint is placeholder.

## Issues By Severity

### Block

- Live build/deployment status cannot be verified without GitHub/Vercel auth.
- `saintblack-ai.github.io` has no detected build manifest.

### Warning

- Multiple repos may be trying to own public app/dashboard duties.
- Several workflows require env vars/secrets that were not verified.
- Node version `24` in `ai-assassins-client` workflow should be confirmed against Vite/dependency compatibility.

### Informational

- The current client and `Ai-Assassins` both have clear npm build/deploy entry points.
- Worker deployment paths are present and production-oriented.

## Next Actions

- Authenticate GitHub and fetch latest workflow runs.
- Authenticate Vercel and fetch latest deployment status.
- Run `npm run build` in `ai-assassins-client` after accepting build-artifact changes or ignoring `dist`.
- Run `npm --prefix docs run build` in `Ai-Assassins` after verifying docs dependencies.
- Add or document a build manifest for `saintblack-ai.github.io` if it remains part of production.

