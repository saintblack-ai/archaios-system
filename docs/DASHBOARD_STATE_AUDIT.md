# Dashboard State Audit

Updated: 2026-04-17
Primary file: `client/src/pages/Dashboard.jsx`

## 1) State Lanes

### Guest Preview
- Session absent.
- Dashboard shell is visible.
- Upgrade actions are disabled by auth requirement.
- Message path instructs sign-in before checkout.

### Signed-In Free
- Session present, subscription inactive/free.
- Account state is persisted.
- Premium surfaces remain locked.
- Upgrade CTAs are enabled.

### Pro Active
- Active/trialing paid subscription with `pro` plan.
- Full briefing and paid tools unlocked.
- Elite lane remains upsell target.

### Elite Active
- Active/trialing paid subscription with `elite` plan.
- Priority signals and elite reporting lane unlocked.

## 2) Connection and Health Visibility
- Health endpoint is checked on refresh.
- Dashboard now displays:
  - resolved API base URL
  - backend source classification
  - runtime mode
- Live worker data panel reports `/api/health` and `/api/platform/dashboard` states.

## 3) Checkout/Billing Behavior
- Signed-out checkout attempts are blocked in UI.
- Unauthorized checkout API responses map to deterministic auth-block messaging.
- Billing portal requires signed-in session.

## 4) Risks Still Visible
- Real revenue activation still depends on production Stripe/secret lifecycle and webhook final verification.
- Local/dev fallback path may hide production-only misconfiguration unless staging/prod checks are run.

## 5) Audit Verdict
Dashboard is locally coherent for launch-prep simulation and operator clarity, with explicit safeguards around auth-gated checkout and test-prep billing posture.
