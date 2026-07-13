# ARCHAIOS Live SITREP Audit

Date: 2026-07-10  
Repository root: `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019`

## Current Architecture

- Frontend: Vite React app in `client/`.
- Frontend route model: path-ending checks in `client/src/App.jsx`.
- SITREP UI: `client/src/pages/sitrep/SitrepCommandCenter.jsx`.
- Backend: Express API in `server/index.js`.
- Secondary backend/deploy target: root Cloudflare Worker in `worker.js`.
- Database client: Supabase JS, server-side service role via `server/lib/supabase.js`.
- Authentication: Supabase bearer token verified in `server/lib/auth.js`.
- Environment conventions: frontend uses `VITE_*`; server uses `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, Stripe secrets, and optional `SITREP_REFRESH_TOKEN`.
- Repository location: iCloud-synced path. Broad `git status` and `git diff` commands may hang; use bounded, path-specific checks.

## Confirmed Working Features

- `/sitrep` frontend route exists.
- Tactical command-center UI exists with global threat ladder, map panel, Commander Brief, Mission Queue, Research Center, and Memory Graph.
- Frontend production build previously passed.
- Intelligence OS architecture document exists.
- Supabase intelligence schema migration exists.
- New live SITREP API foundation exists under `/api/sitrep`.

## Incomplete Features

- Live source refresh requires network access and production deployment.
- Supabase persistence requires applying `sql/20260710_archaios_live_sitrep_contract.sql`.
- GitHub activity adapter is not enabled until target repositories are explicitly configured.
- Weather adapter is pending provider selection.
- Map uses a no-token projected tactical layer; MapLibre clustering can be added later if a full tile map is required.
- Commander Brief is deterministic and source-attributed, not LLM-generated.

## Security Risks

- Refresh routes must remain protected by `SITREP_REFRESH_TOKEN` or authenticated Elite users.
- Service-role keys must never be exposed to frontend code.
- External feed content must remain untrusted text and never be rendered as HTML.
- Raw payloads should be size-limited before long-term storage.
- Public intelligence claims must not be made from sample data.

## Missing Variables

- `SITREP_REFRESH_TOKEN` for internal refresh operations.
- Optional `GITHUB_TOKEN` and repository allowlist for GitHub activity.
- Optional production weather provider credentials.
- Optional market data provider credentials.

## Recommended Execution Order

1. Apply the live SITREP migration.
2. Deploy backend route changes.
3. Configure `SITREP_REFRESH_TOKEN`.
4. Run `POST /api/sitrep/refresh` from a trusted environment.
5. Verify `/api/sitrep/latest`, `/events`, `/map`, `/sources`, and `/health`.
6. Deploy frontend from `client/`.
7. Add GitHub/weather/markets adapters after credentials and source policy approval.
