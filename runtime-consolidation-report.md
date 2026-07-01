# ARCHAIOS Runtime Consolidation Report

Generated: 2026-05-30

Mode: audit only. No files were moved, renamed, deleted, archived, or otherwise modified except this report file requested by the operator.

## A. Canonical Runtime Recommendation

Recommendation: make `client/archaios-core/` the official ARCHAIOS local/runtime orchestration layer.

Rationale:

- `client/package.json` exposes the active runtime command:
  - `archaios:orchestrate`: `node archaios-core/orchestrator/orchestrator.mjs`
- `client/archaios-loop.sh` resolves the orchestrator to:
  - `client/archaios-core/orchestrator/orchestrator.mjs`
- `client/archaios-core/orchestrator/orchestrator.mjs` is self-contained around `client/archaios-core` and writes/reads:
  - `archaios-core/agents/*.js`
  - `archaios-core/runtime/agents/*.json`
  - `archaios-core/state/*.json`
  - `archaios-core/interfaces/dashboard-data.json`
  - `archaios-core/services/service-registry.json`
- Multiple docs already identify `archaios-core/` as the execution backbone:
  - `client/docs/AI_INFRASTRUCTURE_BUILD.md`
  - `client/docs/TASK_ORCHESTRATION_MAP.md`
  - `client/docs/AGENT_RUNTIME_MAP.md`
  - `client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md`
  - `client/system_map.md`

Scope clarification:

- `client/archaios-core/` should be official for local ARCHAIOS runtime orchestration.
- `client/src/` remains the production frontend application source.
- root `worker.js` remains the production Cloudflare Worker backend.
- `archaios-agents/` remains a separate Cloudflare scheduled-agent worker once repaired.
- `Archaios OS/` should remain internal/local operator infrastructure until explicitly migrated.

Recommended canonical runtime root:

```text
client/archaios-core/
  agents/
  interfaces/
  orchestrator/
  runtime/
  services/
  state/
```

Recommended canonical operational support paths:

```text
client/projects/
client/knowledge/
client/tasks/
client/queues/
client/logs/
client/processed_exports/
```

## B. Active Production Paths

These paths appear active for production or near-production operation.

Frontend:

```text
client/
client/package.json
client/vite.config.js
client/src/
client/src/main.jsx
client/src/App.jsx
client/src/pages/
client/src/components/
client/src/lib/
client/src/agents/
client/.env.production
client/.github/workflows/deploy.yml
```

Runtime/orchestration:

```text
client/archaios-core/
client/archaios-core/orchestrator/orchestrator.mjs
client/archaios-core/agents/
client/archaios-core/runtime/agents/
client/archaios-core/state/
client/archaios-core/interfaces/
client/archaios-core/services/
client/archaios-loop.sh
```

Production backend:

```text
worker.js
wrangler.toml
server/
server/index.js
server/lib/
server/package.json
```

Supabase and database:

```text
sql/
supabase/functions/
supabase/functions/stripe-webhook/
supabase/functions/agent-orchestrator/
client/supabase/sql/
lib/supabaseAdmin.ts
lib/supabaseClient.ts
```

Cloudflare scheduled agents:

```text
archaios-agents/
archaios-agents/src/index.ts
archaios-agents/wrangler.toml
archaios-agents/package.json
archaios-agents/sql/
```

Operational docs and task system:

```text
client/docs/
client/tasks/
client/projects/
client/knowledge/
client/logs/
client/processed_exports/
client/ARCHAIOS_INFRASTRUCTURE/
```

Root workflows:

```text
.github/workflows/deploy.yml
.github/workflows/worker_heartbeat.yml
```

Note: root `.github/workflows/deploy.yml` overlaps with `client/.github/workflows/deploy.yml`. This report does not recommend modifying workflows during this audit, but this overlap is a consolidation risk.

## C. Legacy Paths

These paths appear legacy, experimental, historical, or parallel implementations. They should not be deleted without a separate content-preservation pass.

Legacy Python role agents:

```text
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
author_agent.py
executor_agent.py
mentor_agent.py
scholar_agent.py
agent_core.py
archaios_agent.py
archaios_control.py
archaios_orchestrator.py
archaios_simple.py
```

Codex agent pack:

```text
ARCHAIOS_Codex_AI_Agent_Pack/
```

Python ARCHAIOS package:

```text
archaios/
archaios/agents/
archaios/core/
archaios/dashboard/
archaios/server/
archaios/worker/
archaios/protocol/
```

Legacy/internal Archaios OS:

```text
Archaios OS/
Archaios OS/agents/
Archaios OS/archaios_core/
Archaios OS/dashboard/
Archaios OS/jobs/
Archaios OS/cloudflare_worker/
Archaios OS/docs/
Archaios OS/metrics/
```

macOS operator app:

```text
ArchaiosControl/
Archaios OS/archaios_mac_app/
```

Legacy AI Assassins variants:

```text
ai-assassins/
ai-assassins-app/
```

Parallel Next-style app shell:

```text
app/
app/agents/
app/api/
app/components/
app/dashboard/
app/lib/
app/login/
app/pricing/
app/signup/
next.config.js
tsconfig.json
```

## D. Duplicate Paths

Agent duplicates:

```text
agents/
client/agents/
client/archaios-core/agents/
client/src/agents/
app/agents/
archaios/agents/
Archaios OS/agents/
ARCHAIOS_Codex_AI_Agent_Pack/
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
```

Runtime/core duplicates:

```text
client/archaios-core/
archaios/
Archaios OS/archaios_core/
app/
```

Worker/backend duplicates:

```text
worker.js
server/
client/server/
client/worker/
archaios/worker/
Archaios OS/cloudflare_worker/
app/api/
```

Knowledge/docs duplicates:

```text
client/knowledge/
client/processed_exports/knowledge_snapshots/
client/docs/
client/ARCHAIOS_INFRASTRUCTURE/reports/
docs/
Archaios OS/docs/
```

Memory/state duplicates:

```text
client/archaios-core/state/
client/archaios-core/memory/
client/memory/
archaios/memory/
archaios/memory_db/
archaios_memory/
```

Logs duplicates:

```text
client/logs/
logs/
ai-assassins/logs/
ai-assassins/legacy/logs/
archaios-agents/.npm-cache/_logs/
.git/logs/
```

Project/output duplicates:

```text
client/projects/
client/archaios-core/projects/
client/processed_exports/project_snapshots/
client/ARCHAIOS_INFRASTRUCTURE/
```

Workflow duplicates:

```text
.github/workflows/
client/.github/workflows/
ai-assassins/.github/workflows/
Archaios OS/.github/workflows/
```

## E. Safe Archive Candidates

Safe for future archival only after a separate review and after references are updated. Do not archive during this audit.

Low-risk generated/cache candidates:

```text
.wrangler/tmp/
client/.wrangler/tmp/
archaios-agents/.npm-cache/_logs/
.pycache_local/
client/dist/assets/* 2.js
client/docs/assets/
client/docs/index.html
```

Review/duplicate report candidates:

```text
client/docs/archive_notes/
client/processed_exports/review/
client/processed_exports/project_snapshots/
client/processed_exports/revenue_snapshots/
client/processed_exports/knowledge_snapshots/
```

Legacy code candidates for future archival:

```text
ARCHAIOS_Codex_AI_Agent_Pack/
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
archaios/
ai-assassins/
ai-assassins-app/
```

Internal/local system candidates for future separation, not deletion:

```text
Archaios OS/
ArchaiosControl/
```

Parallel app candidates requiring high caution:

```text
app/
next.config.js
tsconfig.json
```

Reason for caution: root `package.json` still exposes Next commands (`dev`, `build`, `start`) that rely on the root Next-style app structure.

## F. Risk Assessment

High risks:

1. Workflow overlap
   - Root `.github/workflows/deploy.yml` and `client/.github/workflows/deploy.yml` both describe frontend/Page deployment behavior.
   - Any future movement must avoid accidentally breaking GitHub Pages deployment.

2. Root Next app ambiguity
   - Root `package.json` still has:
     - `dev`: `next dev`
     - `build`: `next build`
     - `start`: `next start`
   - `app/` may be inactive for production, but it is still referenced by root package scripts.

3. Backend duplication
   - Production instructions point to root `worker.js` and `wrangler.toml`.
   - `server/`, `client/server/`, `client/worker/`, `archaios/worker/`, `Archaios OS/cloudflare_worker/`, and `app/api/` overlap conceptually.

4. Agent duplication
   - There are JS agents, Python agents, Codex-pack role agents, frontend agent adapters, and Cloudflare scheduled agents.
   - Moving any agent path without updating docs/scripts may break runtime expectations.

5. Archaios OS hard-coded path references
   - `ArchaiosControl` and `Archaios OS/archaios_mac_app` reference the iCloud `Archaios OS` path directly.
   - Moving `Archaios OS/` would break the native macOS control app unless settings and docs are updated.

6. Memory database files
   - `archaios_memory/` and `archaios/memory_db/` contain Chroma/vector files.
   - These should not be moved without validating code expectations and backup strategy.

7. Production env coupling
   - `client/.env.production`, `server/.env`, Wrangler secrets, GitHub Actions vars, and Supabase config are coupled to current paths and hosts.

Medium risks:

1. Docs reference old paths heavily.
2. `client/archaios-core/services/service-registry.json` and `client/archaios-core/interfaces/dashboard-data.json` contain relative path strings.
3. `client/scripts/archaios-ingest-build.mjs` generates or mirrors files into `archaios-core`, `agents`, `tasks`, `revenue`, `knowledge`, and related folders.
4. `client/tasks/` contains many duplicated task JSON files across `in_progress` and `completed`.

Low risks:

1. Generated cache folders can be removed in a future cleanup if ignored by git and not needed for diagnostics.
2. Duplicate built assets with ` 2.js` suffix appear safe to remove after confirming they are not referenced by `index.html`.
3. Old processed export review files can be archived after canonical snapshots are preserved.

## G. Exact Move Plan For Future Execution

This section is a plan only. Do not execute without a separate approved maintenance window.

Phase 0: Freeze and backup

1. Ensure git is clean or intentionally staged.
2. Create a branch:
   - `runtime-consolidation`
3. Export a full file manifest:
   - `find . -not -path './node_modules/*' -not -path './client/node_modules/*' -not -path './server/node_modules/*' -print > consolidation-manifest-before.txt`
4. Run validation baseline:
   - `npm run check:env`
   - `npm run check:server`
   - `npm --prefix client run build`
   - `npm --prefix archaios-agents run check`

Phase 1: Declare canonical runtime in docs only

Future edits:

```text
README.md
AGENTS.md
client/README.md
client/archaios-core/README.md
client/docs/CANONICAL_PATH_RESOLUTION.md
client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md
client/docs/AGENT_RUNTIME_MAP.md
client/docs/TASK_ORCHESTRATION_MAP.md
```

Goal:

- State that `client/archaios-core/` is the official ARCHAIOS runtime.
- State that `client/src/` is the production frontend.
- State that root `worker.js` is the production Cloudflare backend.
- State that `Archaios OS/` is internal/local legacy operator infrastructure.

Phase 2: Normalize runtime references

Future edits:

```text
client/package.json
client/archaios-loop.sh
client/archaios-core/orchestrator/orchestrator.mjs
client/archaios-core/services/service-registry.json
client/archaios-core/interfaces/dashboard-data.json
client/archaios-core/runtime/agents/*.json
client/scripts/archaios-ingest-build.mjs
```

Goal:

- Keep runtime paths relative to `client/`.
- Avoid hard-coded absolute paths.
- Ensure generated output consistently targets `client/archaios-core`, `client/projects`, `client/tasks`, `client/knowledge`, and `client/logs`.

Phase 3: Archive generated and cache folders

Future moves:

```text
.wrangler/tmp/                         -> archive/generated/.wrangler/tmp/
client/.wrangler/tmp/                  -> archive/generated/client-wrangler/tmp/
archaios-agents/.npm-cache/_logs/      -> archive/generated/archaios-agents-npm-logs/
.pycache_local/                        -> archive/generated/pycache-local/
client/dist/assets/* 2.js              -> archive/generated/duplicate-dist-assets/
```

Validation:

- `npm --prefix client run build`
- confirm `client/dist/index.html` references only live asset names.

Phase 4: Archive legacy agents after reference scan

Future moves:

```text
Author_AI/                             -> archive/legacy/python-role-agents/Author_AI/
Executor_AI/                           -> archive/legacy/python-role-agents/Executor_AI/
Mentor_AI/                             -> archive/legacy/python-role-agents/Mentor_AI/
Scholar_AI/                            -> archive/legacy/python-role-agents/Scholar_AI/
ARCHAIOS_Codex_AI_Agent_Pack/          -> archive/legacy/codex-agent-pack/
agents/                                -> archive/legacy/root-js-agents/
archaios/                              -> archive/legacy/python-archaios/
```

Required reference updates before moving:

```text
author_agent.py
executor_agent.py
mentor_agent.py
scholar_agent.py
README.md
client/docs/*.md
```

Validation:

- `rg -n "Author_AI|Executor_AI|Mentor_AI|Scholar_AI|ARCHAIOS_Codex_AI_Agent_Pack|archaios/agents|agents/" .`
- Confirm no active script imports archived paths.

Phase 5: Separate internal operator system

Future moves only if desired:

```text
Archaios OS/                           -> archive/internal/Archaios OS/
ArchaiosControl/                       -> archive/internal/ArchaiosControl/
```

Required reference updates before moving:

```text
ArchaiosControl/README.md
ArchaiosControl/ArchaiosControl/Models/AppState.swift
ArchaiosControl/ArchaiosControl/Services/ArchaiosService.swift
Archaios OS/archaios_mac_app/ArchaiosControl/README.md
Archaios OS/archaios_mac_app/ArchaiosControl/ArchaiosControl/Models/AppState.swift
client/docs/MASTER_SYSTEM_MAP.md
client/docs/REPO_ROLES.md
client/docs/INFRA_DISCOVERY.md
client/docs/INFRA_STATUS.md
```

Validation:

- Open native macOS app settings and confirm configurable root path.
- Run `python3 jobs/daily/run_daily.py` from the new path if still active.

Phase 6: Resolve Next app ambiguity

Future decision:

- If root Next app is inactive, archive:

```text
app/                                  -> archive/legacy/next-app/
next.config.js                         -> archive/legacy/next-app/next.config.js
tsconfig.json                          -> archive/legacy/next-app/tsconfig.json
```

- If root Next app is active, document it as a separate product/runtime and do not archive.

Required edits if archiving:

```text
package.json
README.md
client/docs/REPO_ROLES.md
client/docs/INFRA_DISCOVERY.md
```

Validation:

- `npm run build:client`
- `npm run check:server`
- ensure no production workflow calls `npm run build` at root unintentionally.

Phase 7: Consolidate knowledge and reports

Future moves:

```text
client/processed_exports/knowledge_snapshots/ -> client/knowledge/processed-exports/
client/processed_exports/project_snapshots/   -> client/projects/snapshots/
client/processed_exports/revenue_snapshots/   -> client/revenue/snapshots/
client/processed_exports/review/              -> archive/review/processed-export-duplicates/
client/docs/archive_notes/                    -> archive/review/archive-notes/
```

Required edits:

```text
client/docs/KNOWLEDGE_ROUTING_MAP.md
client/docs/EXPORT_INGESTION_PLAN.md
client/docs/ARCHAIOS_EXPORT_INTAKE.md
client/scripts/archaios-export-intake.mjs
client/scripts/archaios-ingest-build.mjs
```

Validation:

- `npm --prefix client run archaios:intake` in dry-run mode if added.
- `npm --prefix client run archaios:build` only after confirming it will not overwrite intended files.

Phase 8: Final validation

Commands:

```bash
npm run check:env
npm run check:server
npm --prefix client run build
npm --prefix archaios-agents run check
npm --prefix client run archaios:orchestrate
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
```

Git checks:

```bash
git status --short
git diff --stat
rg -n "archive/|Archaios OS|ARCHAIOS_Codex_AI_Agent_Pack|Author_AI|Executor_AI|Mentor_AI|Scholar_AI|archaios-core" README.md AGENTS.md client docs app archaios server worker.js
```

## H. Exact Files That Would Be Modified

This audit modified only:

```text
runtime-consolidation-report.md
```

Files likely modified in a future consolidation execution:

Root:

```text
README.md
AGENTS.md
package.json
.gitignore
```

Client/runtime:

```text
client/README.md
client/package.json
client/archaios-loop.sh
client/archaios-core/README.md
client/archaios-core/orchestrator/orchestrator.mjs
client/archaios-core/services/service-registry.json
client/archaios-core/interfaces/dashboard-data.json
client/archaios-core/runtime/agents/content-agent.json
client/archaios-core/runtime/agents/infra-agent.json
client/archaios-core/runtime/agents/product-agent.json
client/archaios-core/runtime/agents/research-agent.json
client/archaios-core/runtime/agents/revenue-agent.json
client/scripts/archaios-ingest-build.mjs
client/scripts/archaios-export-intake.mjs
```

Docs:

```text
client/docs/CANONICAL_PATH_RESOLUTION.md
client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md
client/docs/AGENT_RUNTIME_MAP.md
client/docs/TASK_ORCHESTRATION_MAP.md
client/docs/AI_INFRASTRUCTURE_BUILD.md
client/docs/MASTER_SYSTEM_MAP.md
client/docs/REPO_ROLES.md
client/docs/INFRA_DISCOVERY.md
client/docs/INFRA_STATUS.md
client/docs/KNOWLEDGE_ROUTING_MAP.md
client/docs/EXPORT_INGESTION_PLAN.md
client/docs/ARCHAIOS_EXPORT_INTAKE.md
```

Legacy wrapper imports, if legacy Python agents are moved:

```text
author_agent.py
executor_agent.py
mentor_agent.py
scholar_agent.py
archaios_control.py
```

macOS operator app, only if `Archaios OS/` is moved:

```text
ArchaiosControl/README.md
ArchaiosControl/ArchaiosControl/Models/AppState.swift
ArchaiosControl/ArchaiosControl/Services/ArchaiosService.swift
Archaios OS/archaios_mac_app/ArchaiosControl/README.md
Archaios OS/archaios_mac_app/ArchaiosControl/ArchaiosControl/Models/AppState.swift
```

Workflow files that may need future review, but were not modified:

```text
.github/workflows/deploy.yml
.github/workflows/worker_heartbeat.yml
client/.github/workflows/deploy.yml
ai-assassins/.github/workflows/deploy.yml
ai-assassins/.github/workflows/worker_heartbeat.yml
Archaios OS/.github/workflows/archaios_daily.yml
Archaios OS/.github/workflows/codex_pr_review.yml
```

## Broken Or Risky References Identified

1. `client/archaios-loop.sh`
   - Assumes `archaios-core/orchestrator/orchestrator.mjs` under `client/`.
   - This supports `client/archaios-core/` as canonical.

2. `client/archaios-core/orchestrator/orchestrator.mjs`
   - Uses `ROOT = ../..` from the orchestrator directory and `CORE = ROOT/archaios-core`.
   - Moving `archaios-core` outside `client/` would break this without edits.

3. `client/archaios-core/services/service-registry.json`
   - Contains relative paths beginning with `archaios-core/...`.
   - Any move must update this generated registry.

4. `client/archaios-core/interfaces/dashboard-data.json`
   - References `archaios-core/services/service-registry.json`.
   - Any move must update dashboard interface data.

5. Root `package.json`
   - Root `dev`, `build`, and `start` still run Next commands.
   - This conflicts with the active Vite client production path unless root Next app is intentionally retained.

6. `ArchaiosControl` Swift app
   - Defaults to the absolute iCloud `Archaios OS` path.
   - Moving `Archaios OS/` requires app setting/documentation changes.

7. `Archaios OS/cloudflare_worker`
   - Existing docs report placeholder endpoint usage.
   - Treat as non-production until endpoint/env configuration is corrected.

8. `archaios-agents`
   - Active package exists but previous checks showed missing `@cloudflare/workers-types`.
   - Treat as active but currently broken until dependencies/deploy route are repaired.

## Final Recommendation

Adopt this runtime ownership model:

```text
Production frontend:       client/src/
Canonical ARCHAIOS runtime: client/archaios-core/
Runtime outputs:           client/projects/
Task queue/state:          client/tasks/ and client/archaios-core/state/
Knowledge base:            client/knowledge/
Runtime logs:              client/logs/
Production backend:        worker.js
Scheduled agents worker:   archaios-agents/
Internal local operator:   Archaios OS/ and ArchaiosControl/
Legacy/reference:          archaios/, app/, root role-agent folders, ARCHAIOS_Codex_AI_Agent_Pack/
```

No consolidation moves should be executed until:

1. Git worktree is clean or intentionally staged.
2. GitHub and Cloudflare authentication are restored.
3. The active production workflow is selected.
4. `archaios-agents` dependency check is repaired.
5. A full validation baseline passes.
