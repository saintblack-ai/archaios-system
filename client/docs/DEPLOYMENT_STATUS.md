# Deployment Status

Generated: 2026-04-17T06:37:27Z / 2026-04-17 01:37:27 CDT

Mode: read-only deployment verification.

No deployment was triggered by this check.

## Current Deployment Surfaces

| Surface | URL | Status | Notes |
|---|---|---|---|
| Cloudflare Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` | `200` | Backend health endpoint is online. |
| GitHub Pages client root | `https://saintblack-ai.github.io/ai-assassins-client/` | `200` | Root app loads. |
| GitHub Pages landing | `https://saintblack-ai.github.io/ai-assassins-client/landing` | `200` | Direct route loads. |
| GitHub Pages pricing | `https://saintblack-ai.github.io/ai-assassins-client/pricing` | `200` | Direct route loads. |
| GitHub Pages dashboard | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | `200` | Direct route loads. |
| GitHub Pages operator | `https://saintblack-ai.github.io/ai-assassins-client/operator` | `200` | Direct route loads. |
| GitHub Pages book growth | `https://saintblack-ai.github.io/ai-assassins-client/book-growth` | `200` | Direct route loads. |
| GitHub Pages public marketing | `https://saintblack-ai.github.io/Ai-Assassins` | `200` | Static marketing route loads. |
| Vercel production alias | `https://ai-assassins-client.vercel.app` | `200` | Vercel app root loads. |
| Vercel landing | `https://ai-assassins-client.vercel.app/landing` | `200` | Direct route loads. |
| Vercel pricing | `https://ai-assassins-client.vercel.app/pricing` | `200` | Direct route loads. |
| Vercel dashboard | `https://ai-assassins-client.vercel.app/dashboard` | `200` | Direct route loads. |
| Vercel operator | `https://ai-assassins-client.vercel.app/operator` | `200` | Direct route loads. |
| Vercel book growth | `https://ai-assassins-client.vercel.app/book-growth` | `200` | Direct route loads. |

## GitHub Pages Route Status

| Route | Status |
|---|---:|
| `/ai-assassins-client/` | `200` |
| `/ai-assassins-client/landing` | `200` |
| `/ai-assassins-client/pricing` | `200` |
| `/ai-assassins-client/dashboard` | `200` |
| `/ai-assassins-client/operator` | `200` |
| `/ai-assassins-client/book-growth` | `200` |

## Vercel Route Status

| Route | Status |
|---|---:|
| `/` | `200` |
| `/landing` | `200` |
| `/pricing` | `200` |
| `/dashboard` | `200` |
| `/operator` | `200` |
| `/book-growth` | `200` |

## Vercel Deployment

| Field | Value |
|---|---|
| Project | `ai-assassins-client` |
| Scope/team | `saintblack-ais-projects` |
| Logged in user | `saintblack-ai` |
| Production alias | `https://ai-assassins-client.vercel.app` |
| Latest deployment URL | `https://ai-assassins-client-eoupctkm2-saintblack-ais-projects.vercel.app` |
| Deployment ID | `dpl_DVx2AKsYmS8G7MGkTHZb73jqf5PE` |
| Environment | Production |
| Status | Ready |
| Created | Fri Apr 17 2026 01:34:51 CDT |
| Duration | 8s |
| Custom domains | None found |

## Deployment Interpretation

- GitHub Pages direct-route fix is live.
- Vercel route completeness fix is live.
- Cloudflare Worker health is online.
- Both GitHub Pages and Vercel can serve the dashboard direct routes now.
- Vercel should be treated as primary for the dashboard because it is the better fit for auth, subscriptions, and future production app flow.
- GitHub Pages should remain a static fallback/mirror.

## Remaining Deployment Risks

- No custom domain is attached to Vercel.
- Local worktree remains dirty with unrelated changes and dependency noise.
- The primary dashboard URL is still a `vercel.app` URL until domain routing is configured.

## Recommended Next Actions

1. Use `https://ai-assassins-client.vercel.app/dashboard` as the primary dashboard URL for now.
2. Keep `https://saintblack-ai.github.io/ai-assassins-client/dashboard` as a fallback.
3. Decide and configure a branded custom domain/subdomain for Vercel.
4. Run an auth, pricing, and checkout smoke test on the Vercel host before sending traffic.
5. Clean the local worktree before the next production build cycle.
