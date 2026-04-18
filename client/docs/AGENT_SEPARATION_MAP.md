# Agent Separation Map

Generated: 2026-04-17

Purpose: separate the ARCHAIOS infrastructure mission from the Saint Black book marketing mission without breaking live code paths.

## Separation Decision

No live files were physically moved.

Reason: the current app imports source from `src/`, reads data from `data/`, serves docs from `docs/`, and uses existing workflow/config paths. Physically moving these files would risk breaking routes, builds, imports, and deployment behavior.

Instead, files were logically separated and tagged through:

- `agents/archaios/README.md`
- `agents/archaios/OUTPUT_MANIFEST.md`
- `agents/marketing/README.md`
- `agents/marketing/OUTPUT_MANIFEST.md`
- `docs/ARCHAIOS_SCOPE.md`
- `docs/MARKETING_SCOPE.md`

## Mission Boundaries

| Mission | Owns | Must Not Do |
|---|---|---|
| ARCHAIOS infrastructure | Routing, dashboard shell, export intake, repo audits, deployment docs, auth/billing skeletons, monitoring, operator/admin systems | Create marketing content, social posts, campaign copy, or promotional calendars |
| Saint Black marketing | Book Growth OS, campaigns, content library, social queue, promotional analytics, marketing recommendations | Modify infrastructure, deployment, DNS, billing, auth, worker routes, GitHub Actions, or platform environment configs |

## Infrastructure Files

Infrastructure files are tagged under `agents/archaios/OUTPUT_MANIFEST.md`.

Primary groups:

- System docs: `docs/MASTER_SYSTEM_MAP.md`, `docs/INFRA_STATUS.md`, `docs/INFRA_WATCH_REPORT.md`
- Repo and deployment docs: `docs/REPO_AUDIT.md`, `docs/REPO_ROLES.md`, `docs/DEPLOYMENT_PLAN.md`
- URL and route docs: `docs/APP_URLS.md`, `docs/DASHBOARD_LINKS.md`, `docs/NAVIGATION_PLAN.md`
- Export intake: `ARCHAIOS_INFRASTRUCTURE/`, `scripts/archaios-export-intake.mjs`
- Architecture: `docs/architecture/`
- Infrastructure UI: `src/pages/operator/`, `src/pages/revenue/`, `src/components/CommandNav.jsx`
- Platform configs: `worker/`, `wrangler.jsonc`, `vercel.json`, `.github/workflows/`, `supabase/`

## Marketing Files

Marketing files are tagged under `agents/marketing/OUTPUT_MANIFEST.md`.

Primary groups:

- Book Growth docs: `docs/book-growth/README.md`
- Book/campaign data: `data/books.json`, `data/campaigns.json`, `data/content-library.json`, `data/agent-runs.json`, `data/kpis.json`
- Book Growth agents: `src/agents/bookGrowth/`
- Book Growth UI: `src/pages/bookGrowth/`, `src/components/bookGrowth/`
- Social queue and mock connectors: `scheduler/`, `queues/`, `jobs/`, `integrations/social/`, `src/scheduler/`, `src/queues/`, `src/jobs/`, `src/integrations/social/`

## Shared Files Requiring Care

| File | Owner | Rule |
|---|---|---|
| `data/architect-mode.json` | ARCHAIOS primary | Marketing may read, not rewrite system architecture. |
| `data/operator/system-health.json` | ARCHAIOS primary | Marketing may read health status, not change infrastructure state. |
| `docs/REVENUE_ARCHITECTURE.md` | ARCHAIOS primary | Marketing may reference revenue targets, not alter billing architecture. |
| `docs/REVENUE_IMPLEMENTATION_STATUS.md` | ARCHAIOS primary | Marketing may reference status, not mark infrastructure complete. |
| `src/App.jsx` | ARCHAIOS primary | Marketing should only request route additions through ARCHAIOS. |
| `src/app.css` | Shared UI | Marketing can add scoped `book-growth` styles; ARCHAIOS owns global shell/navigation. |

## Preventing Overlap

Rules for future agent runs:

- ARCHAIOS agent may create scope docs, intake reports, deployment plans, operator panels, auth/billing skeletons, route maps, and monitoring reports.
- ARCHAIOS agent must not generate social captions, post packs, email campaigns, book metadata copy, or promotional hooks.
- Marketing agent may create campaign docs, content calendars, copy variants, post queues, social connector mocks, content analytics, and Book Growth dashboard improvements.
- Marketing agent must not edit deployment configs, DNS instructions, billing webhooks, Supabase auth policies, Cloudflare Worker routes, or GitHub Actions.
- If a task crosses both missions, create a handoff note instead of editing the other mission's files.

## What Was Moved

No files were physically moved.

What changed:

- Added `agents/archaios/` as the infrastructure mission index.
- Added `agents/marketing/` as the marketing mission index.
- Added scope and separation docs under `docs/`.

This is the safest separation because it creates clean ownership without breaking current live source paths.
