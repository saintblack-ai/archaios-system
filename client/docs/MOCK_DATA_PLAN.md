# Mock Data Plan

Generated: 2026-04-17

## Objective

Allow dashboard, briefing, activity-feed, and feature-gating testing before live backend credentials or the ChatGPT export are available.

## Implemented

- Added `src/lib/mockPlatform.js`.
- Added mock dashboard payload for:
  - Briefing title and summary.
  - Action items.
  - Activity feed.
  - Pricing tiers.
  - Mock revenue projection.
  - Mock agent status.
- `/dashboard?mock=1` enables mock mode.
- Dashboard includes a mock mode toggle that persists in `localStorage`.
- Operator shell documents mock mode readiness.

## What Mock Mode Does

- Simulates the platform dashboard payload.
- Helps test mobile layout and feature-gating presentation.
- Allows demos without waiting on live Worker/Supabase/Stripe readiness.

## What Mock Mode Does Not Do

- It does not fake Stripe checkout.
- It does not mark a user as paid.
- It does not bypass actual auth requirements.
- It does not write test data to Supabase.
- It does not call OpenAI or any external service.

## Test URL

```text
https://saintblack-ai.github.io/ai-assassins-client/dashboard?mock=1
```

Local:

```text
http://localhost:5173/dashboard?mock=1
```

## Next Actions

- Add mock samples for Pro and Elite preview states if needed.
- Add a visible mock badge to more panels after live QA.
- Use export content to replace mock briefing copy after intake.

