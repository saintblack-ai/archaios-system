# ARCHAIOS System Status

Generated: 2026-04-17 (America/Chicago)
Phase: Preparation (OpenClaw paused)

## Deployment Topology
- Primary app host intent: **Vercel** (project link present at `client/.vercel/project.json`).
- Frontend backup/public static host: **GitHub Pages** (`client/.github/workflows/deploy.yml` present).
- Backend health/API layer: **Cloudflare Worker** (`worker.js`, `wrangler.toml`, health route at `/api/health`).

## Current Route/Infra Signals
- Frontend dashboard route is explicitly mapped in app router fallback logic (`client/src/App.jsx`).
- Frontend pricing route is explicitly mapped and wired to checkout actions (`client/src/App.jsx`, `client/src/pages/revenue/PricingPage.jsx`).
- Backend checkout endpoint exists at `POST /api/stripe/checkout` and currently requires authenticated Supabase user (`worker.js`).
- Worker health endpoint exists at `GET /api/health` (`worker.js`).

## Workflow/Hosting Artifacts Detected
- GitHub Pages workflows detected in both:
  - `.github/workflows/deploy.yml`
  - `client/.github/workflows/deploy.yml`
- Cloudflare deployment config detected:
  - `wrangler.toml`
- Vercel project binding detected:
  - `client/.vercel/project.json`

## Guardrails Preserved
- No deploy commands executed.
- No DNS changes made.
- No secret or environment variable edits.
- No Stripe live activation actions taken.
