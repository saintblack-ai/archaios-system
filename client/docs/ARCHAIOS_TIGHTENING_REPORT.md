# ARCHAIOS GitHub Infrastructure Tightening Report

Generated: 2026-04-17

## Work Completed

Read-only repo inspection was performed for:

- `ai-assassins-client`
- `Ai-Assassins`
- `saintblack-ai.github.io`
- `Archaios OS`
- local support workspace `openclaw-work`

Safe additive improvements were made in the current writable repo:

- Added Vercel SPA rewrites for `/landing`, `/pricing`, `/dashboard`, `/book-growth`, `/operator`, and `/admin`.
- Added a GitHub Pages SPA fallback step that copies `dist/index.html` to `dist/404.html` during the deploy workflow.
- Created repo role, navigation, export ingestion, and content routing docs.
- Expanded the export intake taxonomy to include prompts, product ideas, business model, spiritual research, books, music, game/OS systems, crypto systems, raw conversations, and docs to convert into app features.

No deployments were run. No DNS was changed. No secrets were touched. No repo was deleted or rewritten.

## Current Live App Structure

| Surface | URL |
|---|---|
| Public landing | `https://saintblack-ai.github.io/ai-assassins-client/landing` |
| Central launcher | `https://saintblack-ai.github.io/ai-assassins-client/links` |
| Pricing | `https://saintblack-ai.github.io/ai-assassins-client/pricing` |
| Dashboard | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` |
| Operator | `https://saintblack-ai.github.io/ai-assassins-client/operator` |
| Book Growth | `https://saintblack-ai.github.io/ai-assassins-client/book-growth` |
| Static public launcher | `https://saintblack-ai.github.io/Ai-Assassins` |
| Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` |

## What Is Already Working

- Public and dashboard links are already loading according to user confirmation.
- Current customer dashboard has Supabase/Stripe-aware app structure.
- Pricing and landing routes exist.
- Operator and Book Growth routes exist.
- Cloudflare Worker config exists.
- GitHub Pages workflow exists for the current client.
- Export intake folder and scanner are ready.

## What Is Confusing Or Duplicated

| Confusion | Detail | Recommended Decision |
|---|---|---|
| Multiple public surfaces | `ai-assassins-client`, `Ai-Assassins/docs`, and `saintblack-ai.github.io` all contain public-facing pieces | Use `ai-assassins-client` as active funnel; use `saintblack-ai.github.io` as launcher; keep `Ai-Assassins/docs` as reference until migrated. |
| Multiple Workers | Current repo has `archaios-saas-worker`; `Ai-Assassins` has `ai-assassins-worker` | Current deployed SaaS Worker should stay canonical until migration is planned. |
| Multiple operator layers | `ai-assassins-client/operator` and `Archaios OS/dashboard` | Web operator is product visibility; Archaios OS is internal/local automation. |
| Stripe naming drift | Price env names differ across repos | Normalize to `STRIPE_PRICE_ID_PRO` and `STRIPE_PRICE_ID_ELITE`. |
| `saintblack-ai.github.io` app code | Next-like code exists without root package manifest | Either add a build manifest or mark it as experimental archive. |

## Export Readiness

Prepared location:

```text
ARCHAIOS_INFRASTRUCTURE/inbox/
```

Prepared command:

```bash
npm run archaios:intake
```

Prepared reports:

```text
ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md
ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md
ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json
```

## What Should Happen When Export Arrives

1. Put the export zip or extracted folder into `ARCHAIOS_INFRASTRUCTURE/inbox/`.
2. If it is zipped, extract it into a named folder under `inbox/`.
3. Run `npm run archaios:intake`.
4. Review `EXPORT_INTAKE_REPORT.md`.
5. Review `EXPORT_CLASSIFICATION_SUMMARY.md`.
6. Run a consolidation pass to produce product requirements, prompt registry, revenue notes, architecture notes, and feature backlog docs.
7. Only then decide which items become code changes.

## Files Created

- `docs/REPO_ROLES.md`
- `docs/NAVIGATION_PLAN.md`
- `docs/EXPORT_INGESTION_PLAN.md`
- `docs/CONTENT_ROUTING_MAP.md`
- `docs/ARCHAIOS_TIGHTENING_REPORT.md`
- `ARCHAIOS_INFRASTRUCTURE/` intake folders for the upcoming export.

## Files Updated

- `vercel.json`
- `.github/workflows/deploy.yml`
- `scripts/archaios-export-intake.mjs`
- `ARCHAIOS_INFRASTRUCTURE/README.md`
- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md`
- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md`
- `ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json`

## Validation

- `npm run archaios:intake` passed.
- `npm run build` passed.

## Remaining Permission Boundaries

- Do not alter DNS until Cloudflare/Vercel state is verified.
- Do not deploy until the current dirty worktree is reviewed and committed intentionally.
- Do not modify sibling repos unless the user approves edits outside the current workspace.
- Do not publish export contents until private/sensitive material is filtered.

## Next Steps

- Commit current docs and routing fallback changes after review.
- Add launcher links to `saintblack-ai.github.io` in a separate approved change.
- Add README role badges/links to `Ai-Assassins` and `Archaios OS` in separate approved changes.
- Verify GitHub Pages deep links after the next deployment.
- Rerun export intake when the OpenAI legacy export arrives.
