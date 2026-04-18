# ARCHAIOS Pre-Export Build Plan

Generated: 2026-04-17

## Objective

Strengthen the live GitHub-based ARCHAIOS / AI Assassins system before the ChatGPT export arrives, so the export can be ingested into a cleaner, working, revenue-ready platform.

## Current Build Focus

| Priority | Status | Implementation |
|---|---|---|
| Tighten navigation | Improved | Added shared `CommandNav`, central `/links` launcher, and route consistency across Landing, Pricing, Dashboard, Operator, and Book Growth. |
| Improve pricing/upgrade flow | Improved | Pricing now presents plan summaries, checkout return messages, and a feature-gate matrix. |
| Auth and feature gating skeleton | Improved | Existing subscription helpers now expose feature gates for Free, Pro, and Elite. |
| Operator/admin shell | Expanded | Operator now exposes export readiness and mock data mode status. |
| Mock data mode | Added | Dashboard can run with `?mock=1` or local toggle. |
| Export intake pipeline | Hardened | Intake taxonomy expanded to match export routing categories. |
| Repo docs and system maps | Expanded | Repo roles, navigation, content routing, and tightening reports exist. |
| Mobile responsiveness | Improved | Added shared nav/mobile controls and feature table mobile stacking. |

## Safe Implementation Rules

- No live deployment was performed.
- No DNS was changed.
- No credentials were requested or stored.
- No sibling repo code was modified.
- Mock data is labeled and does not simulate real Stripe billing.

## Live Route Strategy

Use `ai-assassins-client` as the active route owner:

- `/landing` for public funnel.
- `/links` for central route launcher.
- `/pricing` for upgrade intent.
- `/dashboard` for authenticated command surface.
- `/operator` for internal status.
- `/book-growth` for Saint Black promotion infrastructure.
- `/admin` for protected admin metrics.

## Pre-Export Work Remaining

- Add links from the external `saintblack-ai.github.io` static launcher back to `/links` after sibling repo edits are approved.
- Add README cross-links in sibling repos after approval to edit outside the current workspace.
- Verify GitHub Pages deep links after the next deploy.
- Run Stripe test-mode checkout after credentials are available.
- Decide whether old `Ai-Assassins` Worker logic should migrate into the current Worker.

## Export Arrival Trigger

When export arrives:

```bash
npm run archaios:intake
```

Then review:

- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md`
- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md`
