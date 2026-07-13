# Frontend / Backend Consistency

## Current architecture

The deployed SaaS surface is the Vite/React application in `client/` and the Cloudflare Worker in root `worker.js`. Supabase browser auth owns the frontend session. The Worker validates the session bearer token for protected routes and uses server-only Supabase credentials for privileged database access. Stripe Checkout is created by `POST /api/stripe/checkout`; Stripe synchronizes subscriptions through `POST /api/stripe/webhook`.

Older Next.js (`app/`), Express (`server/`), Python, native, and agent runtimes remain in the workspace but are not launched by the canonical full-stack command.

## Runtime and API strategy

| Concern | Canonical value |
| --- | --- |
| Frontend | `client/` |
| Backend | `worker.js` |
| Local frontend | `http://127.0.0.1:5173` |
| Local backend | `http://127.0.0.1:8787` |
| Production frontend | `https://saintblack-ai.github.io/ai-assassins-client/` |
| Production backend | `https://archaios-saas-worker.quandrix357.workers.dev` |
| Health | `GET /api/health` |

`client/src/lib/platform.js` reads `VITE_BACKEND_URL`. Development alone may fall back to port 8787. Production uses the configured public URL (the current public Worker is retained as a safe production default), never localhost. GitHub Actions rejects a deployment when `VITE_BACKEND_URL` or the required Supabase browser variables are absent.

Shared API constants and boundary helpers live in `shared/api-contracts.js`. They define subscription tiers (`free`, `pro`, `elite`), paid checkout tiers (`pro`, `elite`), active statuses, tier normalization, and the canonical error envelope:

```json
{"success":false,"error":{"code":"machine_readable_code","message":"Operator-readable message"}}
```

The client temporarily accepts legacy string errors for backward compatibility while Worker routes migrate to the canonical envelope.

## Environment variables

Use `.env.example` and `client/.env.example` as name-only templates. Never place Worker secrets in a `VITE_*` variable.

- Public frontend: `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`; optional public business/legal, market-data, and Stripe publishable values.
- Private Supabase: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Private Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ELITE`.
- Cloudflare/runtime: `FRONTEND_URL`, `WORKER_BASE_URL`, optional `AUTH_TOKEN`, `ADMIN_EMAIL`, `WORKER_RELEASE`, `LOCAL_TIMEZONE`.
- OpenAI/agents: `OPENAI_API_KEY`, `OPENAI_MODEL`, optional `OPENAI_USE_RESPONSES`.

Wrangler `[vars]` contains non-secret configuration. Set secrets with `wrangler secret put`; do not commit them.

## Commands

```bash
npm install
npm --prefix client install
npm run dev             # Worker + Vite together
npm run dev:backend     # Wrangler on 8787
npm run dev:frontend    # Vite on 5173
npm run lint
npm run typecheck
npm test
npm run build
npm run check           # complete production-readiness check
npm start               # Worker only
```

## Health and troubleshooting

Check `/api/health` first. If it fails, inspect the Worker process/deployment and `VITE_BACKEND_URL`. If health succeeds but browser calls fail, inspect the browser origin, CORS response, and network URL. Local origins on ports 5173 are allowed; production is restricted to the configured frontend origin.

If checkout fails, confirm the user is signed in, the frontend supplied the Supabase bearer token, and the Worker has both Stripe price IDs and secrets. Only `pro` and `elite` are accepted checkout tiers. If webhook delivery succeeds but access remains free, inspect required Stripe event delivery, the `subscriptions.user_id` upsert constraint, and `profiles.tier` synchronization.

If dashboard authentication fails while health is up, verify `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and bearer-token handling. Signed-out users may view the dashboard shell but cannot begin checkout.

## Production deployment

Deploy the frontend through the existing GitHub Pages workflow from `client/`, with `VITE_BACKEND_URL` set to the public Worker URL. Deploy the backend from repository root only when explicitly authorized:

```bash
npx wrangler deploy --name archaios-saas-worker
```

No deployment is performed by the local `build` or `check` commands.

### Production routing audit (2026-07-12)

The public `workers.dev` endpoint currently serves an older daily-automation artifact. Its response identifies `archaios-daily-automation`, includes cron job metadata, and advertises `GET, POST, OPTIONS` with wildcard CORS. Those fields match the Worker family under `client/worker/index.js`, not the canonical root `worker.js` contract.

The cause is a Worker-name collision: root `wrangler.toml` and `client/wrangler.jsonc` both declared `name = archaios-saas-worker`. Cloudflare assigns the `workers.dev` hostname to the named service, so the most recent deployment from either config replaces the code served at the same hostname. `client/wrangler.jsonc` now uses the separate `archaios-daily-automation` name to prevent another overwrite.

| Hostname | Current Worker artifact | Intended Worker | Route pattern | Environment | Frontend consumer | Change risk |
| --- | --- | --- | --- | --- | --- | --- |
| `archaios-saas-worker.quandrix357.workers.dev` | Older client daily-automation artifact deployed under the colliding service name | Root `worker.js` / `archaios-saas-worker` | Native `workers.dev`, all paths | Production | GitHub Pages and optional Vercel frontend | High until secrets and rollback version are confirmed; deploy changes checkout, auth, webhook, dashboard, and cron behavior together |
| `archaios-daily-automation.quandrix357.workers.dev` | Not confirmed/deployed | `client/worker/index.js` / `archaios-daily-automation` | Native `workers.dev`, all paths | Production automation | Internal cron/backend calls only | Medium; new service needs its own secrets and should not replace the SaaS API |
| `127.0.0.1:8787` | Root Worker through Wrangler | Root `worker.js` | All paths | Local development | Vite on port 5173 | Low |
| `saintblack-ai.github.io/ai-assassins-client` | Static Vite frontend | Static Vite frontend | GitHub Pages project path | Production | Browser users | Low if `VITE_BACKEND_URL` remains canonical |
| `ai-assassins-client.vercel.app` | Vite production deployment, not the documented primary host | Same frontend as optional/legacy host | Vercel project domain | Production | Browser users if directly visited | Low; production has `VITE_BACKEND_URL`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` configured |

No `routes`, custom domains, Pages bindings, service bindings, or environment-specific Wrangler sections are declared in the repository configs. Authenticated Cloudflare dashboard/CLI inspection is still required to rule out account-side routes or custom domains; Wrangler authentication was expired during this audit.

### Verification, deployment, and rollback

Run the fail-closed checks before deployment:

```bash
npm run deploy:backend:dry-run
npm run verify:production
```

`verify:production` checks the canonical hostname, service identity, release identifier, production CORS origin/methods, and pricing response. It intentionally fails against the currently mismatched artifact.

Before deployment, authenticate Wrangler and record the active version:

```bash
npx wrangler login
npx wrangler deployments list --config wrangler.toml --name archaios-saas-worker
npx wrangler secret list --config wrangler.toml --name archaios-saas-worker
```

After explicit authorization, deploy only from repository root:

```bash
npm run deploy:backend
npm run verify:production
```

If post-deployment verification fails, roll back to the version ID recorded before deployment:

```bash
npm run rollback:backend -- <previous-version-id>
npm run verify:production
```

Cloudflare dashboard checks: open Workers & Pages, select `archaios-saas-worker`, confirm its `workers.dev` subdomain, routes/custom domains, secrets, cron trigger, and deployment history; confirm no route or custom domain points the SaaS hostname to `archaios-daily-automation`. Do not copy secrets between services unless their runtime requirements have been reviewed.

## Known limitations

- Some noncritical Worker routes still return legacy successful payload shapes; changing every success response at once would break existing panels. Error parsing is backward compatible during migration.
- The legacy Express and Next.js surfaces have separate configuration and are not part of the canonical full-stack launch.
- Live Stripe, Supabase, OpenAI, and external market/news flows require operator-managed credentials and cannot be fully exercised by offline automated tests.
- Cloudflare account-side deployment history, routes, and custom domains remain unverified until Wrangler is reauthenticated.
