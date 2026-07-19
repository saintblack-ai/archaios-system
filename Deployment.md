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

## Required Before Promotion
1. Refresh Cloudflare authentication or use the Cloudflare dashboard.
2. Confirm account ID.
3. Confirm whether `archaios-saas-worker` and `archaios-daily-automation` are separate Workers.
4. Confirm routes and custom domains for both Workers.
5. Confirm current production version and rollback candidate.
6. Promote only the verified canonical Worker target.
