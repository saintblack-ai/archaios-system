# Repository Audit

## Audit Date

April 16, 2026

## Repositories Found Locally

### `ai-assassins-client`

Path:

```text
/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/client
```

Purpose:

- Authenticated React dashboard and Cloudflare Worker backend.
- Current best target for customer dashboard, Stripe subscription gating, Supabase sessions, alerts, platform payloads, Book Growth OS, and Operator Mode.

Observed stack:

- Vite React
- Cloudflare Worker in `worker/index.js`
- Supabase browser client and service-role Worker calls
- Stripe Checkout and webhook logic
- GitHub/Vercel/Cloudflare config files present

Already built:

- Supabase auth flow.
- Pro/Elite pricing UI.
- Stripe checkout and customer portal client paths.
- Worker routes for subscription, alerts, leads, platform dashboard, Stripe checkout, Stripe webhook, admin dashboard.
- Subscription table SQL and RLS.
- Book Growth Command with local agents, scheduler mock, Architect Mode, Quality Gate.

Risks / weak points:

- Worktree is very dirty, including `node_modules` and generated `dist` changes.
- Backend URL defaults to a Cloudflare Worker domain but local dev defaults to `127.0.0.1:5050`.
- Stripe implementation exists, but production keys/webhook configuration must be verified manually.
- Several production concerns are documented but not yet formalized into a go-live checklist.

### `Ai-Assassins`

Path:

```text
/Users/quandrixblackburn/projects/Ai-Assassins
```

Purpose:

- Strong candidate for backend/product source-of-truth or monorepo root.
- Includes Cloudflare Worker TypeScript backend, static dashboard, Supabase migrations, daily brief automation, Stripe/RevenueCat-era revenue docs, mobile wrappers, and app-store assets.

Observed stack:

- Cloudflare Worker TypeScript under `worker/src`.
- Static `docs/` frontend.
- Supabase migrations.
- Python local package for AI Assassins local tooling.
- Mobile Capacitor package.

Already built:

- Daily brief API.
- Tier and quota enforcement.
- Stripe checkout/webhook logic in Worker.
- Revenue API docs.
- Command intelligence and agent endpoints.
- Worker deploy scripts.
- Static marketing/dashboard pages.
- Store asset scaffolding.

Risks / weak points:

- Pricing in older docs references lower legacy prices (`$4.99`, `$14.99`) and must be aligned with current Pro `$49` and Elite `$99`.
- Multiple billing paths exist (`/api/checkout`, `/api/stripe/checkout-session`, `/api/billing/*`) and should be consolidated.
- Some RevenueCat-era assumptions remain; decide whether native app billing is future-only.

### `saintblack-ai.github.io`

Path:

```text
/Users/quandrixblackburn/saintblack-ai.github.io
```

Purpose:

- Public marketing / landing layer candidate.
- Contains `Ai-Assassins` static files and a Next-style `app/` with API routes and dashboard experiments.

Already built:

- Marketing routes and API experiments.
- Agent/revenue/marketing endpoints.
- Master control panel components.
- SQL files for venture engine and orchestrator experiments.

Risks / weak points:

- Possible overlap with both `Ai-Assassins` and `ai-assassins-client`.
- Needs clear deployment role before more implementation.

### `Archaios OS`

Path:

```text
/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS
```

Purpose:

- Internal command/orchestration plane.
- Best suited as operator control plane or future Mac/Core admin layer.

Observed stack:

- Python agents and orchestrator.
- Streamlit dashboard.
- Cloudflare worker trigger.
- Structured logs and metrics.
- Swift macOS control app.

Already built:

- Agent implementations for Saint Black and QX.
- Daily job runner.
- Logs and metrics.
- Roadmap and system blueprint docs.

Risks / weak points:

- Not currently integrated with customer-facing dashboard.
- Needs a read-only health bridge or export format before production integration.

## Missing Sources

The folder `/ARCHAIOS_INFRASTRUCTURE/` was not found in the accessible local scan. Add or mount it later so its exported ChatGPT materials can be classified into product vision, architecture, prompts, pricing, intelligence sources, brand assets, and unfinished build instructions.

