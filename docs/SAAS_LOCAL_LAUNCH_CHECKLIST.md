# SaaS Local Launch Checklist

Updated: 2026-04-17
Scope: Local validation only (no deployment actions)

## A. Routing + UI
- [x] `/dashboard` route loads.
- [x] `/pricing` route loads.
- [x] Dashboard shows guest-safe shell.
- [x] Tier messaging is explicit for Guest / Signed-In Free / Pro / Elite.

## B. Backend Connection Clarity
- [x] Shared API base resolver is used in platform library.
- [x] Dashboard displays resolved API base URL.
- [x] Dashboard displays backend source (`env-configured`, `cloudflare-default`, `local-dev-fallback`).
- [x] Pricing displays resolved API base URL and mode.
- [x] Admin dashboard request uses shared API base resolver.

## C. Checkout + Billing Guardrails
- [x] Signed-out checkout blocked in UI before request.
- [x] Unauthorized checkout response maps to explicit auth-block message.
- [x] Checkout remains test-prep oriented.
- [x] No live Stripe activation steps performed.

## D. Health + Signals
- [x] Health endpoint URL is visible in dashboard account overview.
- [x] Worker API status panel is present.
- [x] Mock mode toggle remains available for local fallback.

## E. Local Verification Commands
Run from repo root:

```bash
cd "client" && npm run build
```

Optional local runtime check:

```bash
cd "client" && npm run dev -- --host 0.0.0.0 --port 5173
```

## F. Remaining Blockers for Real Revenue Activation
- Stripe live secrets and webhook production validation are not activated in this phase.
- End-to-end production checkout validation is pending explicit approval and deployment workflow.
- Production environment governance (final host selection + secret rollout) remains pending.
