# Archaios Command Dashboard V1

## Architecture

Runtime target: `client/` GitHub Pages Vite app.

Stack:

- React UI: `client/src/pages/archaios/ArchaiosCommandCenter.tsx`
- TypeScript data contract: `client/src/pages/archaios/archaiosCommandData.ts`
- Supabase browser client: `client/src/lib/supabase.js`
- SQL migration: `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`
- Route: `/archaios`

Data flow:

```text
Supabase tables
  -> archaiosCommandData.ts loader
  -> ArchaiosCommandCenter.tsx
  -> Executive Command + division panels
```

Fallback mode:

- If Supabase env vars are missing, the dashboard renders production-safe fallback data.
- If table reads fail, the dashboard renders fallback data and marks source as `fallback`.

## Database Tables

Core V1 tables:

- `archaios_command_entries`
- `archaios_division_snapshots`
- `archaios_archive_assets`
- `archaios_projects`
- `archaios_agent_runs`

Required future views:

- `archaios_ai_assassins_revenue_summary`
- `archaios_archive_preservation_summary`
- `archaios_division_health_summary`

## API Structure

V1 reads directly from Supabase browser auth:

```text
select * from archaios_command_entries order by priority
select * from archaios_division_snapshots order by sort_order
```

V2 backend endpoints:

```text
GET /api/archaios/command
GET /api/archaios/divisions
GET /api/archaios/archive/summary
GET /api/archaios/agents/runs
POST /api/archaios/agent-runs
```

The backend endpoint should use the Supabase bearer token and enforce role-based visibility for private archive records.

## Dashboard Wireframe

```text
/archaios

[Command Nav]

[Hero: Archaios Command Center V1]
  [Divisions] [Stable] [Watch] [Critical]

[Executive Command]
  Mission Status
  Daily SITREP
  Current Priorities
  Active Projects
  Strategic Risks

[AI Assassins Division]
  Subscription Count | Revenue | Stripe Status | User Growth | System Health

[QX Technology Division]
  Research Projects | Active Concepts | Technical Notes | Development Roadmap

[Saint Black Media]
  Albums | Books | Scripts | Visual Projects | Publishing Status

[City Zoo Division]
  Products | Campaigns | Marketing Tasks | Brand Metrics

[Blackburn Legacy Archive]
  Archive Size | Total Assets | Preservation Score | Backup Status | Recently Added Knowledge
```

## GitHub Project Structure

```text
client/
  src/
    pages/
      archaios/
        ArchaiosCommandCenter.tsx
        archaiosCommandData.ts
    components/
      CommandNav.jsx
    lib/
      supabase.js
  supabase/
    sql/
      2026-06-17_archaios_command_center_v1.sql
  docs/
    ARCHAIOS_COMMAND_DASHBOARD_V1.md
```

## Development Roadmap

Phase 1:

- Add `/archaios` route.
- Render all required dashboard sections.
- Apply Supabase schema.
- Seed command entries and division snapshots.

Phase 2:

- Replace fallback AI Assassins metrics with live Stripe/Supabase subscription summaries.
- Add archive ingestion counts and preservation score.
- Add project CRUD admin screens for command entries and division snapshots.

Phase 3:

- Move reads behind backend worker endpoints.
- Add Security Agent and Archivist Agent run history.
- Add daily SITREP generation and monthly command report exports.

## Deployment Checklist

Frontend:

- Set `VITE_SUPABASE_URL`.
- Set `VITE_SUPABASE_ANON_KEY`.
- Set `VITE_BACKEND_URL=https://archaios-saas-worker.quandrix357.workers.dev`.
- Build from `client/` with `npm run build`.
- Deploy through the existing GitHub Pages workflow.

Backend:

- Apply `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`.
- Verify Supabase RLS policies.
- Verify `/api/health`.
- Verify Stripe checkout and webhook secrets.
- Deploy backend from repo root with `npx wrangler deploy --name archaios-saas-worker`.
