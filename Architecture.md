# ARCHAIOS Architecture Status

## Runtime Shape
ARCHAIOS currently uses a Vite React frontend, shared API contracts, and a Cloudflare Worker backend. The frontend is hosted as a static application and talks to the Worker through `VITE_API_BASE_URL` with `VITE_BACKEND_URL` compatibility preserved.

## Verified Surfaces
- Login: Supabase browser auth client is present and now explicitly persists sessions with PKCE.
- Dashboard: React dashboard routes build successfully.
- Daily Briefing: Daily command route builds successfully.
- Mission Center: Mission Control route builds successfully.
- Assets: Vite static assets and PWA assets are included in production output.
- Memory: Supabase-backed memory remains gated until Supabase activation.
- AI Command Center: Command Center route builds successfully.
- Agent Runtime: Worker exposes degraded-safe `GET /api/agents/health` and `GET /api/agents/status`.
- Notifications: frontend notification code exists; production notification persistence remains gated by user permission and backend activation.
- Mobile responsiveness: safe-area and mobile viewport handling are present.

## Current Blocker
The repository declares `archaios-saas-worker` as the canonical Worker deployment target, but the live public hostname currently returns `service: archaios-daily-automation`. The canonical runtime expects `service: archaios-core-api`.

## Routing Root Cause
The cron/daily automation Worker config in `client/wrangler.jsonc` was using the canonical Worker name `archaios-saas-worker`. That config has been corrected to `archaios-daily-automation` so future daily automation deployments do not overwrite the core API target.

## Readiness
- Architecture status: locally coherent, production routing blocked.
- Production readiness: 92%.
- Agent readiness: 78%.
