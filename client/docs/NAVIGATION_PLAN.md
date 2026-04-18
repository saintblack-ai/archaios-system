# ARCHAIOS Navigation Plan

Generated: 2026-04-17

## Goal

Create a clean navigation path across all live ARCHAIOS and AI Assassins pages without breaking current GitHub Pages, Vercel, or Worker surfaces.

## Canonical User Paths

| User Intent | Canonical URL | Purpose |
|---|---|---|
| Public discovery | `https://saintblack-ai.github.io/ai-assassins-client/landing` | Explain the offer and route users to pricing or dashboard. |
| Central launcher | `https://saintblack-ai.github.io/ai-assassins-client/links` | One command link surface for public, member, operator, mock, and legacy/static routes. |
| Pricing / upgrade | `https://saintblack-ai.github.io/ai-assassins-client/pricing` | Show Free, Pro, Elite and start checkout. |
| Customer dashboard | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | Main authenticated app and premium intelligence interface. |
| Operator/admin visibility | `https://saintblack-ai.github.io/ai-assassins-client/operator` | Internal system health and roadmap view. |
| Book growth command | `https://saintblack-ai.github.io/ai-assassins-client/book-growth` | Saint Black book marketing command center. |
| Static public launcher | `https://saintblack-ai.github.io/Ai-Assassins` | Legacy/static public entry point. |

## Standard Navigation

Every public or semi-public page should expose this link set:

| Label | Target |
|---|---|
| Links | `/links` |
| Landing | `/landing` |
| Pricing | `/pricing` |
| Dashboard | `/dashboard` |
| Operator | `/operator` |
| Book Growth | `/book-growth` |

Recommended secondary footer links:

| Label | Target |
|---|---|
| Public GitHub Pages launcher | `https://saintblack-ai.github.io/Ai-Assassins` |
| Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` |
| AI Assassins client root | `https://saintblack-ai.github.io/ai-assassins-client/` |

## Safe Improvement Applied

Two deployment-safe routing improvements were added in this repo:

- `vercel.json` now rewrites `/landing`, `/pricing`, `/dashboard`, `/book-growth`, `/operator`, and `/admin` to `/index.html`.
- `.github/workflows/deploy.yml` now copies `dist/index.html` to `dist/404.html` after build so GitHub Pages can fall back to the React app on direct deep links.

These are additive only. They do not deploy anything by themselves.

## Current Navigation Coverage

| Page | Current Links | Gap |
|---|---|---|
| `/landing` | Pricing, Dashboard | Add Operator and Book Growth links later if desired. |
| `/pricing` | Landing, Dashboard | Add Operator and Book Growth links later if desired. |
| `/dashboard` | Pricing, Landing, Book Growth, Operator, auth anchor | Good. |
| `/operator` | Dashboard, Book Growth | Add Landing/Pricing later if desired. |
| `/book-growth` | Main dashboard | Add Landing/Pricing/Operator later if desired. |
| `/admin` | Dashboard | Good for protected admin context. |

## Central Launcher Recommendation

Central launcher implemented at `/links`.

Recommended minimal launcher sections:

- Public: landing, pricing, static public page.
- Member: dashboard, account/billing.
- Operator: operator, admin, worker health.
- Growth: book growth command, content systems.
- Archive: export intake status, future legacy map.

Implementation now lives in `ai-assassins-client` because it already owns app routing and deployment configuration.

## Cross-Repo Link Recommendations

### `saintblack-ai.github.io`

Add visible launcher links to:

- `https://saintblack-ai.github.io/ai-assassins-client/landing`
- `https://saintblack-ai.github.io/ai-assassins-client/pricing`
- `https://saintblack-ai.github.io/ai-assassins-client/dashboard`

### `Ai-Assassins`

Update README and docs landing copy to say:

- Current customer app: `ai-assassins-client`
- Current Worker/reference engine: `Ai-Assassins`
- Static docs are reference or legacy unless actively deployed.

### `Archaios OS`

Update README to link back to:

- Current customer dashboard.
- Current operator route.
- Current export intake docs.

## Do Not Do Yet

- Do not change DNS until the canonical domain is approved.
- Do not retire any GitHub Pages route yet.
- Do not delete old static pages.
- Do not enable a new Vercel production alias until Vercel deployment state is verified.
