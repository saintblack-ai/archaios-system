# Next Safe Codex Phase

Updated: 2026-04-17

## Objective
Complete deterministic local QA for checkout gating and dashboard state transitions before any deployment or secret changes.

## Phase Tasks
1. Run local dev server and verify route behavior on desktop and mobile.
2. Execute scripted/manual test matrix:
   - Guest on `/pricing` and `/dashboard`
   - Signed-in free user
   - Mock mode enabled/disabled
   - Checkout blocked-auth message path
3. Capture evidence in logs/tasks markdown files with timestamps.
4. Verify no regressions in subscription feature gates.
5. Rebuild and freeze changes for review.

## Explicit Non-Goals
- No deploy.
- No DNS or domain updates.
- No secret/env edits.
- No Stripe live mode activation.

## Ready-to-Run Commands
```bash
cd "client" && npm run dev -- --host 0.0.0.0 --port 5173
```

```bash
cd "client" && npm run build
```

## Exit Criteria
- Dashboard and pricing flows are locally validated with documented results.
- Guest checkout path consistently shows auth-block guidance.
- Build passes.
- Updated logs/tasks docs are committed locally for handoff.
