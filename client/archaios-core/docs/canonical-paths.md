# ARCHAIOS Canonical Paths

Official runtime root:

```text
client/archaios-core/
```

Official execution working directory:

```text
client/
```

Official command:

```bash
npm --prefix client run archaios:orchestrate
```

## Canonical Ownership Table

| Domain | Canonical Path | Current Use |
| --- | --- | --- |
| Runtime root | `client/archaios-core/` | Official ARCHAIOS runtime. |
| Orchestrator | `client/archaios-core/orchestrator/orchestrator.mjs` | Dispatches tasks and generates state. |
| Agent scripts | `client/archaios-core/agents/` | Runnable local core agents. |
| Agent manifests | `client/archaios-core/runtime/agents/` | Runtime contracts. |
| Runtime state | `client/archaios-core/state/` | Runtime and per-agent snapshots. |
| Service registry | `client/archaios-core/services/service-registry.json` | Runtime service index. |
| Dashboard interface | `client/archaios-core/interfaces/dashboard-data.json` | Dashboard-facing runtime summary. |
| Task queue | `client/tasks/` | Current orchestrator task state. |
| Logs | `client/logs/` | Current runtime log output. |
| Project outputs | `client/projects/` | Current agent output root. |
| Knowledge source | `client/knowledge/` | Current knowledge corpus. |
| Revenue source | `client/revenue/` | Current revenue prep corpus. |
| Frontend app | `client/src/` | Production Vite app source. |
| Backend worker | `worker.js` | Production Cloudflare Worker. |
| Scheduled agent worker | `archaios-agents/` | Separate Cloudflare scheduled worker. |

## Reference Inventory

References to `agents/`, `archaios/`, `Archaios OS/`, and `ARCHAIOS_Codex_AI_Agent_Pack/` were found in these groups.

Active production/runtime references:

```text
worker.js imports root agents/*.js for production Cloudflare Worker behavior.
client/src/* imports client/src/agents/* for frontend adapters.
client/archaios-core/* references archaios-core/agents/* for canonical local runtime.
archaios-agents/src/index.ts exposes /api/agents/status for scheduled Cloudflare agents.
```

Documentation/reference references:

```text
client/docs/*.md
client/data/operator/system-health.json
client/docs/operator/repo-audit.snapshot.json
runtime-consolidation-report.md
tasks/openclaw_next_safe_steps.md
docs/stripe_setup.md
```

Legacy/internal references:

```text
ArchaiosControl/*
Archaios OS/*
ARCHAIOS_Codex_AI_Agent_Pack/*
author_agent.py
executor_agent.py
mentor_agent.py
scholar_agent.py
app/api/agents/*
app/scheduler/*
middleware.ts
```

Exact files currently containing one or more of the searched references:

```text
Archaios OS/AGENTS.md
Archaios OS/README.md
Archaios OS/agents/__init__.py
Archaios OS/agents/saintblack/pr_agent.py
Archaios OS/archaios_core/config.py
Archaios OS/archaios_core/logger.py
Archaios OS/archaios_core/orchestrator.py
Archaios OS/archaios_core/router.py
Archaios OS/archaios_mac_app/ArchaiosControl/ArchaiosControl/Models/AppState.swift
Archaios OS/archaios_mac_app/ArchaiosControl/README.md
Archaios OS/cloudflare_worker/worker.js
Archaios OS/cloudflare_worker/wrangler.toml
Archaios OS/dashboard/streamlit_app.py
Archaios OS/docs/ROADMAP_3_YEAR.md
Archaios OS/docs/SYSTEM_BLUEPRINT.md
Archaios OS/jobs/daily/run_daily.py
ArchaiosControl/ArchaiosControl/Models/AppState.swift
ArchaiosControl/ArchaiosControl/Services/ArchaiosService.swift
ArchaiosControl/ArchaiosControl/Views/SettingsView.swift
ArchaiosControl/README.md
app/api/agents/content/route.ts
app/api/agents/distribute/route.ts
app/api/agents/feedback/route.ts
app/api/agents/intelligence/route.ts
app/api/agents/marketing/route.ts
app/api/agents/optimize/route.ts
app/api/agents/revenue/route.ts
app/api/agents/run/route.ts
app/api/agents/status/route.ts
app/scheduler/agentScheduler.ts
archaios-agents/README.md
archaios-agents/src/index.ts
client/agents/archaios/README.md
client/agents/marketing/OUTPUT_MANIFEST.md
client/agents/marketing/README.md
client/archaios-core/README.md
client/archaios-core/docs/agent-map.md
client/archaios-core/docs/canonical-paths.md
client/archaios-core/docs/migration-readiness.md
client/archaios-core/docs/runtime-map.md
client/archaios-core/docs/service-map.md
client/archaios-core/memory/README.md
client/archaios-core/orchestrator/orchestrator.mjs
client/archaios-core/revenue/README.md
client/archaios-core/runtime/agents/content-agent.json
client/archaios-core/runtime/agents/infra-agent.json
client/archaios-core/runtime/agents/product-agent.json
client/archaios-core/runtime/agents/research-agent.json
client/archaios-core/runtime/agents/revenue-agent.json
client/archaios-core/services/service-registry.json
client/archaios-loop.sh
client/data/operator/system-health.json
client/docs/AGENT_RUNTIME_MAP.md
client/docs/AGENT_SEPARATION_MAP.md
client/docs/AI_INFRASTRUCTURE_BUILD.md
client/docs/ARCHAIOS_BUILD_LOG.md
client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md
client/docs/ARCHAIOS_SCOPE.md
client/docs/ARCHAIOS_TIGHTENING_REPORT.md
client/docs/BUILD_HEALTH.md
client/docs/CONTENT_ROUTING_MAP.md
client/docs/DEPLOYMENT_PLAN.md
client/docs/DOMAIN_MAP.md
client/docs/ENV_GAPS.md
client/docs/EXPORT_INGESTION_PLAN.md
client/docs/INFRA_DISCOVERY.md
client/docs/INFRA_STATUS.md
client/docs/LIVE_QUEUE_STATUS.md
client/docs/MARKETING_SCOPE.md
client/docs/MASTER_SYSTEM_MAP.md
client/docs/NAVIGATION_PLAN.md
client/docs/NEXT_3_COMMANDS.md
client/docs/REPO_AUDIT.md
client/docs/REPO_ROLES.md
client/docs/REVENUE_IMPLEMENTATION_STATUS.md
client/docs/STRIPE_STATUS.md
client/docs/STRIPE_TEST_PREP.md
client/docs/TASK_ORCHESTRATION_MAP.md
client/docs/architecture/COMPONENT_INVENTORY.md
client/docs/book-growth/README.md
client/docs/operator/repo-audit.snapshot.json
client/scripts/archaios-ingest-build.mjs
client/scripts/archaios-repo-audit.mjs
client/src/App.jsx
client/src/lib/platform.js
client/src/pages/Dashboard.jsx
client/src/pages/bookGrowth/BookGrowthCommand.jsx
client/src/pages/revenue/PricingPage.jsx
client/tasks/phase1_archaios_system_build.md
docs/stripe_setup.md
middleware.ts
runtime-consolidation-report.md
scripts/deploy.sh
scripts/smoke-test-worker.sh
server/index.js
src/dashboard/MasterControlPanel.tsx
tasks/openclaw_next_safe_steps.md
worker.js
```

## Path Rules

1. Do not move files during preparation.
2. Do not point canonical runtime docs at legacy paths as active runtime dependencies.
3. Keep `client/archaios-core/` authoritative for local orchestration.
4. Keep `client/src/agents/` classified as frontend adapters, not canonical runtime agents.
5. Keep root `agents/` classified as production Worker dependencies while `worker.js` imports them.
6. Keep `Archaios OS/` classified as internal/local operator infrastructure.
7. Keep `ARCHAIOS_Codex_AI_Agent_Pack/` classified as legacy/reference.
