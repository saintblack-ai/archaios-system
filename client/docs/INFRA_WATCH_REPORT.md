# ARCHAIOS Infrastructure Watch Report

Generated: 2026-04-17T06:37:27Z / 2026-04-17 01:37:27 CDT

Mode: active monitoring, read-only.

No deploys, DNS edits, billing changes, pushes, or external mutations were performed by this watch run.

## Summary

Overall status: healthy for the checked public surfaces.

- Cloudflare Worker health endpoint is online.
- GitHub Pages client root is online.
- GitHub Pages direct SPA routes now return `200`.
- Static public marketing route is online.
- Vercel production alias is online.
- Vercel direct SPA routes now return `200`.
- Vercel sees a fresh Ready production deployment from 2026-04-17 01:34:51 CDT.
- Vercel has no custom domains configured under `saintblack-ais-projects`.
- Current local worktree remains dirty with unrelated source/docs/generated/dependency noise.

## What Is Working

| Check | URL / Target | Status |
|---|---|---|
| Worker health | `https://archaios-saas-worker.quandrix357.workers.dev/api/health` | `200` |
| GitHub Pages client root | `https://saintblack-ai.github.io/ai-assassins-client/` | `200` |
| GitHub Pages landing | `https://saintblack-ai.github.io/ai-assassins-client/landing` | `200` |
| GitHub Pages pricing | `https://saintblack-ai.github.io/ai-assassins-client/pricing` | `200` |
| GitHub Pages dashboard | `https://saintblack-ai.github.io/ai-assassins-client/dashboard` | `200` |
| GitHub Pages operator | `https://saintblack-ai.github.io/ai-assassins-client/operator` | `200` |
| GitHub Pages book growth | `https://saintblack-ai.github.io/ai-assassins-client/book-growth` | `200` |
| Public marketing | `https://saintblack-ai.github.io/Ai-Assassins` | `200` |
| Vercel production alias | `https://ai-assassins-client.vercel.app` | `200` |
| Vercel landing | `https://ai-assassins-client.vercel.app/landing` | `200` |
| Vercel pricing | `https://ai-assassins-client.vercel.app/pricing` | `200` |
| Vercel dashboard | `https://ai-assassins-client.vercel.app/dashboard` | `200` |
| Vercel operator | `https://ai-assassins-client.vercel.app/operator` | `200` |
| Vercel book growth | `https://ai-assassins-client.vercel.app/book-growth` | `200` |

## Route Availability

| Route | GitHub Pages | Vercel |
|---|---:|---:|
| `/` | `200` | `200` |
| `/landing` | `200` | `200` |
| `/pricing` | `200` | `200` |
| `/dashboard` | `200` | `200` |
| `/operator` | `200` | `200` |
| `/book-growth` | `200` | `200` |

## Vercel Status

| Item | Value |
|---|---|
| CLI version | `51.6.1` |
| Logged in user | `saintblack-ai` |
| Team/scope shown by CLI | `saintblack-ais-projects` |
| Project found | `ai-assassins-client` |
| Production alias | `https://ai-assassins-client.vercel.app` |
| Latest deployment URL | `https://ai-assassins-client-eoupctkm2-saintblack-ais-projects.vercel.app` |
| Deployment ID | `dpl_DVx2AKsYmS8G7MGkTHZb73jqf5PE` |
| Deployment status | Ready |
| Deployment target | Production |
| Created | Fri Apr 17 2026 01:34:51 CDT |
| Custom domains | None found |

## What Is Still Broken Or Risky

| Item | Severity | Detail |
|---|---|---|
| No custom domain on Vercel | Warning | Production is reachable through `vercel.app`; no branded Vercel domain is configured. |
| Dirty local worktree | Warning | Many unrelated local changes remain, including generated assets and `node_modules` noise. |
| GitHub CLI auth not rechecked in this run | Informational | This watch focused on public routes and Vercel; prior reports showed invalid `gh` auth. |

## Host Recommendation

Primary dashboard host recommendation: Vercel.

Reason:

- Vercel now serves all direct app routes with `200`.
- Vercel is better suited for the authenticated dashboard and future serverless/API-adjacent production flow.
- GitHub Pages is now usable as a static fallback/mirror, but it is less flexible for the monetized dashboard path.

Recommended public dashboard URL:

```text
https://ai-assassins-client.vercel.app/dashboard
```

Recommended static fallback URL:

```text
https://saintblack-ai.github.io/ai-assassins-client/dashboard
```

## What Changed Since Previous Report

- GitHub Pages direct routes changed from `404` to `200`.
- Vercel direct routes changed from partial/stale to complete `200`.
- Vercel production deployment changed from the older `rfeiqsmo5` deployment to `eoupctkm2`.

## Recommended Next Safest Build Step

Add a branded, stable custom domain strategy before driving traffic.

Recommended sequence:

1. Choose the primary domain/subdomain for the dashboard.
2. Point that domain to Vercel only after DNS ownership/routing is confirmed.
3. Keep GitHub Pages as a fallback/static mirror.
4. Then run a checkout/auth smoke test on the primary host.

## Final Health Readout

- System health: healthy for checked public surfaces.
- Backend Worker: online.
- GitHub Pages direct routes: fixed live.
- Vercel direct routes: fixed live.
- Primary dashboard host: Vercel recommended.
