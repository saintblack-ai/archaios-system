# Orphaned Components

Generated: 2026-05-30

Mode: documentation only. No files moved, deleted, renamed, archived, or workflow-edited.

Definition:

- `ACTIVE PRODUCTION`: required by current production/dev runtime paths.
- `NEEDS MIGRATION`: not canonical, but still referenced by scripts, docs, local apps, or possible deployment paths.
- `SAFE TO ARCHIVE`: no active production import found; archive only after preservation review.
- `DOCUMENTATION ONLY`: contains README/manifests or planning notes, not executable runtime entrypoints.

## Major Folder Classification

| Path | Classification | Reason |
| --- | --- | --- |
| `client/archaios-core/` | ACTIVE PRODUCTION | Canonical local ARCHAIOS runtime. |
| `client/archaios-core/agents/` | ACTIVE PRODUCTION | Dispatched by canonical orchestrator. |
| `client/archaios-core/runtime/` | ACTIVE PRODUCTION | Agent manifests consumed by orchestrator. |
| `client/archaios-core/state/` | ACTIVE PRODUCTION | Runtime state output. |
| `client/archaios-core/services/` | ACTIVE PRODUCTION | Service registry output. |
| `client/archaios-core/interfaces/` | ACTIVE PRODUCTION | Dashboard/runtime interface output. |
| `client/src/` | ACTIVE PRODUCTION | Vite frontend source. |
| `client/src/agents/` | ACTIVE PRODUCTION | Frontend intelligence, checkout, and Book Growth adapters. |
| `client/tasks/` | ACTIVE PRODUCTION | Current orchestrator queue/state path. |
| `client/logs/` | ACTIVE PRODUCTION | Current orchestrator and agent log path. |
| `client/projects/` | ACTIVE PRODUCTION | Current core agent output path. |
| `client/knowledge/` | ACTIVE PRODUCTION | Current orchestrator knowledge input. |
| `client/revenue/` | ACTIVE PRODUCTION | Current revenue source artifacts. |
| `worker.js` | ACTIVE PRODUCTION | Cloudflare Worker entrypoint. |
| `agents/` | ACTIVE PRODUCTION | Direct dependency of `worker.js`. |
| `shared/` | ACTIVE PRODUCTION | Used by Worker, server, frontend pricing paths. |
| `server/` | ACTIVE PRODUCTION / dev fallback | Local Express backend and checks. |
| `sql/` | ACTIVE PRODUCTION | Database migrations/source of truth. |
| `supabase/` | ACTIVE PRODUCTION | Supabase function source. |
| `archaios-agents/` | NEEDS MIGRATION | Intended scheduled worker; not canonical local runtime and needs health repair. |
| `client/agents/archaios/` | NEEDS MIGRATION | Duplicate generated agents; no active dispatch path found. |
| `client/agents/marketing/` | DOCUMENTATION ONLY | README/manifest only. |
| `client/agents/infra-agent/` | DOCUMENTATION ONLY | README only. |
| `client/agents/product-agent/` | DOCUMENTATION ONLY | README only. |
| `client/agents/revenue-agent/` | DOCUMENTATION ONLY | README only. |
| `client/server/` | NEEDS MIGRATION | Secondary local server path; not production host. |
| `client/worker/` | NEEDS MIGRATION | Secondary worker path; not current root `wrangler.toml` entry. |
| `app/` | NEEDS DECISION | Root Next app is wired by root package scripts but not used by GitHub Pages workflows. |
| `middleware.ts` | NEEDS DECISION | Root Next middleware; active only if `app/` is retained. |
| `archaios/` | NEEDS MIGRATION | Legacy Python ARCHAIOS package with memory/server/worker copies. |
| `Archaios OS/` | NEEDS MIGRATION | Internal/local operator system; referenced by macOS app and docs. |
| `ArchaiosControl/` | NEEDS MIGRATION | Native macOS operator app pointing at `Archaios OS/`. |
| `ARCHAIOS_Codex_AI_Agent_Pack/` | SAFE TO ARCHIVE | Legacy self-contained agent pack; no production import found. |
| `Author_AI/` | SAFE TO ARCHIVE | Legacy role-agent package, only root wrapper import found. |
| `Executor_AI/` | SAFE TO ARCHIVE | Legacy role-agent package, only root wrapper import found. |
| `Mentor_AI/` | SAFE TO ARCHIVE | Legacy role-agent package, only root wrapper import found. |
| `Scholar_AI/` | SAFE TO ARCHIVE | Legacy role-agent package, only root wrapper import found. |
| `ai-assassins/` | SAFE TO ARCHIVE after preservation | Separate legacy Python package. |
| `ai-assassins-app/` | SAFE TO ARCHIVE after preservation | Separate Streamlit/backend variant. |
| `archaios_vault_tools/` | NEEDS DECISION | Separate tool package; not canonical runtime but may be useful. |
| `docs/` | NEEDS MIGRATION | Static docs/assets; not canonical runtime docs. |
| `src/` | NEEDS MIGRATION | Root dashboard code separate from `client/src`. |
| `lib/` | NEEDS DECISION | Root TS Supabase/Stripe helpers likely tied to Next app. |
| `logs/` | NEEDS MIGRATION | Root logs separate from canonical `client/logs`. |
| `tasks/` | NEEDS MIGRATION | Root tasks separate from canonical `client/tasks`. |

## Completely Orphaned Or Near-Orphaned Components

No folder should be physically archived in this phase. Based on import/script tracing, the lowest-risk future archive candidates are:

```text
ARCHAIOS_Codex_AI_Agent_Pack/
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
ai-assassins/
ai-assassins-app/
```

Why:

- No active production workflow, Worker import, Vite import, or canonical runtime dispatch path was found.
- Root wrapper files still reference the role-agent folders, so wrapper disposition should be decided first.

Near-orphaned but not safe yet:

```text
client/agents/archaios/
```

Why:

- It duplicates `client/archaios-core/agents/`.
- It is generated by `client/scripts/archaios-ingest-build.mjs`.
- It should not be archived until that generator is updated or retired.

Not orphaned:

```text
agents/
client/src/agents/
client/archaios-core/agents/
app/agents/
Archaios OS/
archaios-agents/
```

Why:

- `agents/` is a Worker dependency.
- `client/src/agents/` is a frontend dependency.
- `client/archaios-core/agents/` is canonical local runtime.
- `app/agents/` is part of root Next app until Next is retired.
- `Archaios OS/` is referenced by `ArchaiosControl` and internal docs.
- `archaios-agents/` is a separate scheduled worker package.
