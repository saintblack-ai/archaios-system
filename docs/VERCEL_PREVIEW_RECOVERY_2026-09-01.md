# Vercel Preview Recovery Record

Date: 2026-09-01

This branch is the preview-only recovery target for the canonical ARCHAIOS frontend API configuration.

Verified build blocker:

- Production-mode Vite builds fail closed when neither `VITE_API_BASE_URL` nor the compatibility alias `VITE_BACKEND_URL` is present.
- The Vercel Preview environment is configured by the owner with `VITE_API_BASE_URL`.
- The configured endpoint is the documented canonical Cloudflare Worker URL.
- Runtime code, production data, DNS, credentials, billing, and production deployment settings are unchanged.

Acceptance checks for the fresh preview:

1. Vite configuration loads.
2. The production-mode frontend build completes.
3. SPA routes render.
4. API health/version/status endpoints respond or report controlled degraded mode.
5. No Production promotion occurs without founder approval.
