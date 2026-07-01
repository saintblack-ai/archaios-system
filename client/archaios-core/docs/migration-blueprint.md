# ARCHAIOS Phase 3 Migration Blueprint

Generated: 2026-05-30

Mode: planning only. No code changes, moves, deletions, renames, archival, workflow edits, `package.json` script changes, or `worker.js` changes were made.

Canonical runtime: `client/archaios-core/`

## Mission

Move from mixed architecture to a clean canonical ARCHAIOS runtime where:

- `client/archaios-core/` owns local ARCHAIOS runtime contracts, agents, services, state, interfaces, and documentation.
- `client/src/` owns the Vite frontend and frontend adapters.
- root `worker.js` owns the production Cloudflare API until a Worker modernization phase changes its imports.
- `archaios-agents/` becomes a scheduled remote agent layer that mirrors or consumes canonical runtime contracts rather than inventing a separate agent taxonomy.
- legacy/internal systems stay untouched until separate approved phases.

## Current Architecture Summary

```text
Production backend:
  worker.js
    -> agents/*.js
    -> shared/pricing.js

Production frontend:
  client/src/
    -> client/src/agents/*
    -> client/src/lib/*

Canonical local runtime:
  client/archaios-core/
    -> orchestrator/orchestrator.mjs
    -> runtime/agents/*.json
    -> agents/*.js
    -> state/*.json
    -> services/service-registry.json

Scheduled remote agents:
  archaios-agents/
    -> src/index.ts
    -> Supabase agent_logs
    -> OpenAI responses

Parallel Next app:
  app/
    -> root package.json next scripts
    -> middleware.ts

Internal operator / legacy:
  Archaios OS/
  ArchaiosControl/
  archaios/
  ARCHAIOS_Codex_AI_Agent_Pack/
  Author_AI/, Executor_AI/, Mentor_AI/, Scholar_AI/
```

## Folder Classification

| Path | Classification | Execution-phase treatment |
| --- | --- | --- |
| `client/archaios-core/` | CANONICAL RUNTIME | Keep and strengthen. |
| `client/archaios-core/agents/` | CANONICAL RUNTIME | Keep as local runtime agent script root. |
| `client/archaios-core/runtime/` | CANONICAL RUNTIME | Keep as manifest root. |
| `client/archaios-core/services/` | CANONICAL RUNTIME | Keep as service registry root. |
| `client/archaios-core/state/` | CANONICAL RUNTIME | Keep as runtime state root. |
| `client/archaios-core/interfaces/` | CANONICAL RUNTIME | Keep as runtime/dashboard interface root. |
| `client/archaios-core/docs/` | CANONICAL RUNTIME | Keep as runtime documentation root. |
| `client/src/` | ACTIVE PRODUCTION | Keep as Vite frontend source. |
| `client/src/agents/` | FRONTEND ADAPTER | Keep as frontend agent/adapters, not canonical runtime. |
| `client/tasks/` | ACTIVE PRODUCTION | Keep until orchestrator path migration is explicitly approved. |
| `client/logs/` | ACTIVE PRODUCTION | Keep until log-root decision. |
| `client/projects/` | ACTIVE PRODUCTION | Keep until output-root decision. |
| `client/knowledge/` | ACTIVE PRODUCTION | Keep as current knowledge input. |
| `client/revenue/` | ACTIVE PRODUCTION | Keep as current revenue input. |
| `worker.js` | ACTIVE PRODUCTION | Do not change until Worker modernization phase. |
| `agents/` | ACTIVE PRODUCTION | Do not archive; root Worker imports it. |
| `shared/` | ACTIVE PRODUCTION | Keep. |
| `server/` | ACTIVE PRODUCTION | Keep as local backend/fallback. |
| `sql/` | ACTIVE PRODUCTION | Keep as DB migration source. |
| `supabase/` | ACTIVE PRODUCTION | Keep as Supabase function source. |
| `archaios-agents/` | NEEDS MIGRATION | Integrate with canonical manifests in later phase. |
| `client/agents/archaios/` | NEEDS MIGRATION | Stop generating here in future; keep until generator update lands. |
| `client/agents/marketing/` | SAFE TO ARCHIVE LATER | Documentation only after migration docs absorb value. |
| `client/agents/infra-agent/` | SAFE TO ARCHIVE LATER | Documentation only. |
| `client/agents/product-agent/` | SAFE TO ARCHIVE LATER | Documentation only. |
| `client/agents/revenue-agent/` | SAFE TO ARCHIVE LATER | Documentation only. |
| `app/` | NEEDS MIGRATION | Keep until root Next decision. |
| `middleware.ts` | NEEDS MIGRATION | Keep while Next app remains. |
| `next.config.js` | NEEDS MIGRATION | Keep while Next scripts remain. |
| `package.json` root Next scripts | NEEDS MIGRATION | Do not change yet. |
| `Archaios OS/` | INTERNAL ONLY | Do not touch; local operator system. |
| `ArchaiosControl/` | INTERNAL ONLY | Do not touch; depends on `Archaios OS/`. |
| `archaios/` | NEEDS MIGRATION | Legacy Python runtime. |
| `ARCHAIOS_Codex_AI_Agent_Pack/` | SAFE TO ARCHIVE LATER | Preserve before archival. |
| `Author_AI/`, `Executor_AI/`, `Mentor_AI/`, `Scholar_AI/` | SAFE TO ARCHIVE LATER | Preserve wrapper behavior first. |
| `ai-assassins/` | SAFE TO ARCHIVE LATER | Separate legacy package. |
| `ai-assassins-app/` | SAFE TO ARCHIVE LATER | Separate Streamlit/backend variant. |
| `archaios_vault_tools/` | DO NOT TOUCH | Separate useful tool package; not in runtime migration. |
| `Final books published /`, `QX AI quantum Chip/`, `Black Phoenix Project ` | DO NOT TOUCH | User content/research assets. |

## Migration Phases

### Phase 3A: Documentation lock

Status: current phase.

Allowed:

- Add runtime plans and maps under `client/archaios-core/docs/`.
- Do not modify runtime behavior.

### Phase 3B: Generator redirect

Goal:

- Stop `client/scripts/archaios-ingest-build.mjs` from writing generated agents to `client/agents/archaios/`.
- Keep generated runtime agents under `client/archaios-core/agents/`.
- Preserve existing `client/agents/archaios/` until a later archive phase.

Planned changes:

```text
client/scripts/archaios-ingest-build.mjs
client/docs/ARCHAIOS_INFRASTRUCTURE_MAP.md
client/docs/AGENT_SEPARATION_MAP.md
client/docs/ARCHAIOS_SCOPE.md
client/docs/NEXT_3_COMMANDS.md
client/docs/TASK_ORCHESTRATION_MAP.md
client/docs/AI_INFRASTRUCTURE_BUILD.md
```

### Phase 3C: Worker modernization

Goal:

- Keep Worker stable while clarifying root `agents/` ownership.
- Later choose between:
  - keeping root `agents/` as backend Worker agents, or
  - moving/copying backend-safe agent prompt modules under a canonical backend path.

No `worker.js` changes in this planning phase.

### Phase 3D: Next/Vite decision

Goal:

- Decide whether root Next app remains as a parallel app or is retired.
- Do not change root `package.json` scripts until that decision is explicit.

### Phase 3E: `archaios-agents` integration

Goal:

- Align scheduled remote agent names/contracts with canonical runtime manifests.
- Avoid direct filesystem coupling from Cloudflare Worker to `client/archaios-core/`.
- Generate or copy a small shared contract from canonical manifests during build/deploy.

## Migration Readiness Score

Score: 72/100

Why:

- Canonical runtime is now documented.
- Worker dependency on root `agents/` is clear.
- Generator duplicate output path is identified.
- Next app decision boundary is clear.
- `archaios-agents` integration path is clear.

Deductions:

- Root `worker.js` still imports root `agents/`.
- Root `package.json` still uses Next scripts.
- `client/scripts/archaios-ingest-build.mjs` still writes duplicate generated agents.
- `archaios-agents` has separate agent names and runtime contracts.
- `Archaios OS` and `ArchaiosControl` remain active internal references.

## What Can Be Safely Done Next

Safe next steps after this planning-only phase:

1. Update documentation references that incorrectly call `client/agents/archaios/` canonical.
2. Add a dry-run mode to `client/scripts/archaios-ingest-build.mjs`.
3. Update `client/scripts/archaios-ingest-build.mjs` so it writes only to `client/archaios-core/agents/`.
4. Add a compatibility note in `client/agents/archaios/README.md` saying it is generated duplicate output and not canonical.
5. Add an `archaios-agents` contract mapping doc from scheduled agent names to canonical runtime concepts.

## What Must Wait Until Morning

Wait for a dedicated execution window before:

1. Changing `worker.js` imports.
2. Changing root `package.json` scripts.
3. Retiring or archiving `app/`.
4. Archiving `client/agents/archaios/`.
5. Changing GitHub workflows.
6. Deploying Cloudflare Worker changes.
7. Changing Supabase or Stripe production behavior.

## Stop/Go Recommendation

GO for documentation and generator planning.

NO-GO for physical file migration, Worker import changes, root Next script changes, archival, or workflow edits until the next approved execution phase.
