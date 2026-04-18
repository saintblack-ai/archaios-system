# ARCHAIOS Repo Roles

Generated: 2026-04-17

## Executive Map

| Repo / Workspace | Current Role | Recommended Role | Status |
|---|---|---|---|
| `ai-assassins-client` | Vite React dashboard, pricing, landing, Cloudflare Worker, Supabase/Stripe wiring | Primary customer dashboard and monetized web app | Active |
| `Ai-Assassins` | Mature Worker/product engine, static docs app, mobile prep, Supabase migrations | Product engine and source-of-truth for daily intelligence pipeline patterns | Active but overlapping |
| `saintblack-ai.github.io` | Static public pages plus experimental Next-style agent/admin code | Public marketing/static launcher surface only until build manifest is clarified | Needs cleanup |
| `Archaios-OS` / `Archaios OS` | Python/Streamlit operator system, daily jobs, Cloudflare trigger | Internal operator/control-plane and local automation backbone | Active internal |
| `openclaw-work` | Local OpenClaw worker workspace, ARCHAIOS dashboard experiments, organized archives | Local-only worker lab and export preparation workspace | Local support, not public product |

## Repo Details

### `ai-assassins-client`

- Path: `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/client`
- Remote: `https://github.com/saintblack-ai/ai-assassins-client.git`
- Package name: `ai-assassins-client`
- Package manager: npm
- Main surfaces:
  - `/landing`
  - `/pricing`
  - `/dashboard`
  - `/book-growth`
  - `/operator`
  - `/admin`
- Backend:
  - Cloudflare Worker in `worker/index.js`
  - Worker name: `archaios-saas-worker`
- Live/fallback URLs inferred:
  - `https://saintblack-ai.github.io/ai-assassins-client/`
  - `https://saintblack-ai.github.io/ai-assassins-client/dashboard`
  - `https://archaios-saas-worker.quandrix357.workers.dev/api/health`
- Exact purpose:
  - User-facing ARCHAIOS / AI Assassins web app.
  - Supabase auth.
  - Stripe checkout and subscription gating.
  - Premium intelligence dashboard.
  - Operator visibility.
  - Book Growth OS.
- Keep:
  - Current customer dashboard.
  - Pricing and landing page.
  - Worker billing/subscription endpoint.
  - Export intake scaffold.
- Avoid:
  - Turning this repo into a raw archive dump.
  - Duplicating the entire older `Ai-Assassins` Worker without a migration plan.

### `Ai-Assassins`

- Path: `/Users/quandrixblackburn/projects/Ai-Assassins`
- Remote: `https://github.com/saintblack-ai/Ai-Assassins.git`
- Package name: `ai-assassins`
- Worker package name: `ai-assassins-api`
- Package manager: npm
- Main surfaces:
  - Cloudflare Worker in `worker/src/index.ts`
  - Static docs app in `docs/`
  - Mobile wrapper in `mobile/`
  - Supabase migrations in `supabase/`
- Exact purpose:
  - Product engine repo for AI Assassins.
  - Daily intelligence briefing pipeline.
  - Worker examples and automation patterns.
  - Store/mobile preparation.
- Recommended role:
  - Keep as engine/reference repo.
  - Use it as the source for reusable daily briefing and intelligence pipeline logic.
  - Do not use it as the main customer dashboard if `ai-assassins-client` remains active.
- Confusion risk:
  - It has public/static app surfaces that overlap with `ai-assassins-client`.
  - Some docs/configs appear to use older pricing and placeholder env values.

### `saintblack-ai.github.io`

- Path: `/Users/quandrixblackburn/saintblack-ai.github.io`
- Remote: `https://github.com/saintblack-ai/saintblack-ai.github.io.git`
- Package manager: none detected at root
- Main surfaces:
  - Root static `index.html`
  - `docs/`
  - `Ai-Assassins/`
  - Experimental `app/` TypeScript/Next-style code
- Exact purpose:
  - Public GitHub Pages home for Saint Black / AI Assassins.
  - Static launcher and legacy/experimental marketing surface.
- Recommended role:
  - Make this the public static launcher only.
  - Link clearly to the active customer dashboard, pricing page, and public marketing pages in `ai-assassins-client`.
  - Do not treat its `app/` directory as production until a root `package.json`, build command, and deployment owner are defined.
- Confusion risk:
  - It looks partly static and partly Next-like.
  - No root package manifest was detected.
  - It overlaps with public landing responsibilities.

### `Archaios-OS` / `Archaios OS`

- Path: `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS`
- Remote: `https://github.com/saintblack-ai/archaios-os.git`
- Package manager: Python/manual
- Main surfaces:
  - `archaios_core/`
  - `agents/`
  - `jobs/daily/`
  - `dashboard/`
  - `cloudflare_worker/`
  - `logs/`
  - `metrics/`
- Exact purpose:
  - Internal ARCHAIOS control plane.
  - Local automation, logs, metrics, and operator workflows.
  - Cloudflare scheduled trigger bridge.
- Recommended role:
  - Keep internal.
  - Do not make this the public customer app.
  - Use it to operate and observe the ecosystem.
- Confusion risk:
  - `cloudflare_worker/wrangler.toml` still has a placeholder endpoint.
  - Python dependencies are not fully pinned in a detected requirements file.

### `openclaw-work`

- Path: `/Users/quandrixblackburn/openclaw-work`
- Remote: none detected
- Exact purpose:
  - Local-only OpenClaw worker workspace.
  - Local ARCHAIOS dashboard experiments.
  - Organized archive staging.
- Recommended role:
  - Keep local and removable.
  - Do not use as canonical production source unless explicitly promoted later.

## Overlap And Duplication

| Overlap | Repos Involved | Decision |
|---|---|---|
| Public landing / marketing | `ai-assassins-client`, `saintblack-ai.github.io`, `Ai-Assassins/docs` | Use `ai-assassins-client` for current product funnel; use `saintblack-ai.github.io` as a launcher; treat `Ai-Assassins/docs` as legacy/reference unless promoted. |
| Customer dashboard | `ai-assassins-client`, `Ai-Assassins/docs` | Use `ai-assassins-client` as canonical dashboard. |
| Daily briefing Worker | `ai-assassins-client/worker`, `Ai-Assassins/worker` | Use current Worker for deployed SaaS endpoints; migrate proven briefing logic from `Ai-Assassins/worker` deliberately. |
| Operator/admin | `ai-assassins-client/operator`, `Archaios OS/dashboard` | Use web operator for product health; use `Archaios OS` for local automation/control plane. |
| Stripe setup | `ai-assassins-client`, `Ai-Assassins`, `saintblack-ai.github.io/app` | Normalize around Pro `$49` and Elite `$99`; avoid multiple live checkout implementations. |

## Repo Descriptions To Use

- `ai-assassins-client`: Customer-facing ARCHAIOS / AI Assassins dashboard with premium intelligence, Supabase auth, Stripe subscriptions, operator views, and export ingestion prep.
- `Ai-Assassins`: AI Assassins product engine and Worker pipeline for daily intelligence briefings, automation, Supabase migrations, and mobile/static release assets.
- `saintblack-ai.github.io`: Saint Black public GitHub Pages launcher and static marketing surface for ARCHAIOS and AI Assassins.
- `Archaios-OS`: Internal ARCHAIOS operator system for local agents, scheduled jobs, metrics, logs, and control-plane automation.

## Next Actions

- Keep `ai-assassins-client` as the active revenue app.
- Add launcher links from `saintblack-ai.github.io` to the active app URLs.
- Decide whether to archive or migrate `saintblack-ai.github.io/app`.
- Align all Stripe docs and variables to Pro `$49` and Elite `$99`.
- Treat `Ai-Assassins` as engine/reference until a specific migration branch is approved.

