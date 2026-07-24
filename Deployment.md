# ARCHAIOS Deployment Status

## Deployment Policy
No production deployment should occur until the Cloudflare account, Worker target, hostname, routes, environment bindings, and rollback version are verified.

## Frontend
- Host: GitHub Pages / Vercel preview surfaces.
- Build command: `npm --prefix client run build`
- Output directory: `client/dist`
- PWA assets are generated into `client/dist` during Vite builds.

## Backend
- Worker config: `wrangler.toml`
- Worker name: `archaios-saas-worker`
- Dry-run command: `npm run deploy:backend:dry-run`
- Production deploy command remains gated: `npm run deploy:backend`

## Current Live State
- Public canonical URL: `https://archaios-saas-worker.quandrix357.workers.dev`
- Observed live service: `archaios-daily-automation`
- Expected service: `archaios-core-api`

## Root Cause Found
`client/wrangler.jsonc` was configured as a cron/daily automation Worker but used the production canonical Worker name `archaios-saas-worker`. Its health response matches the live production response, including `service: archaios-daily-automation`, cron `17 13 * * *`, and the dashboard/activity/metrics cron jobs. That means a daily automation deployment can overwrite or occupy the canonical API Worker target.

The daily automation config has been corrected to use `archaios-daily-automation`, keeping these responsibilities separate:
- `archaios-saas-worker`: canonical ARCHAIOS application API serving `archaios-core-api`
- `archaios-daily-automation`: scheduled daily automation and cron jobs
- `ai-assassins-markets`: market-specific services only

## Required Before Promotion
1. Refresh Cloudflare authentication or use the Cloudflare dashboard.
2. Confirm account ID.
3. Confirm whether `archaios-saas-worker` and `archaios-daily-automation` are separate Workers.
4. Confirm routes and custom domains for both Workers.
5. Confirm current production version and rollback candidate.
6. Promote only the verified canonical Worker target.

## Exact Required Production Action
Run this from the repository root after Cloudflare authentication is restored:

```bash
npx wrangler login
npm run deploy:backend
npm run verify:runtime
```

Do not run `wrangler deploy` from `client/` for the canonical API. The client Worker config is for `archaios-daily-automation` only.
