# ARCHAIOS Next Actions (Post Rate-Limit Reset)

Target resume window: **04:54 AM**
Generated: 2026-04-17

## Priority Queue
1. Review overnight loop and status logs for regressions and unresolved errors.
2. Reproduce and isolate the unauthenticated checkout `500` path end-to-end.
3. Prepare a clean fix so guest checkout returns the correct blocked status (expected: auth-blocked response, not internal error).
4. Re-verify host posture:
   - Vercel primary
   - GitHub Pages backup
   - Cloudflare Worker backend health/API layer
5. Keep Stripe in test-prep mode only.

## Concrete First Investigation Steps
1. Confirm health endpoint response first (`/api/health`).
2. Trace frontend guest checkout call path from pricing/dashboard into `startStripeCheckout`.
3. Verify worker behavior for unauthenticated `POST /api/stripe/checkout` and compare actual status/body against expected blocked response contract.
4. Add/adjust error mapping so unauthorized checkout returns deterministic UI-safe blocked messaging.
5. Run frontend build validation after patch.

## Current Validation Snapshot
- Pricing logic exists: **PASS**
  - `client/src/pages/revenue/PricingPage.jsx`
  - `client/src/lib/pricing.js`
- Dashboard route wiring exists: **PASS**
  - `client/src/App.jsx` route mapping for `/dashboard`
  - `client/src/pages/Dashboard.jsx`
- Supabase auth flow exists: **PASS**
  - `client/src/lib/supabase.js`
  - `client/src/lib/platform.js` auth helpers
- Backend auth-protected checkout endpoint exists: **PASS**
  - `worker.js` `POST /api/stripe/checkout`

## Known Risk To Keep Visible
- `client/src/lib/platform.js` still contains a **development-only localhost fallback** (`http://localhost:5000`) for non-production mode.
- Production mode path resolves to configured `VITE_BACKEND_URL` or Cloudflare default URL.

## Discipline Rules For Resume Session
- No deploy.
- No DNS edits.
- No secrets/env changes.
- No Stripe live billing activation.
- Monitor, document, patch safely, verify.
