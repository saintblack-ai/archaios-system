# ARCHAIOS Service Map

Canonical service registry: `client/archaios-core/services/service-registry.json`

## Registered Services

| Service | Path | Role | Status |
| --- | --- | --- | --- |
| `task-router` | `archaios-core/orchestrator/orchestrator.mjs` | Dispatches tasks to agent runtime scripts. | Active |
| `knowledge-index` | `knowledge/knowledge-index.json` | Knowledge ingestion summary interface. | Active external input under `client/`. |
| `dashboard-data` | `archaios-core/interfaces/dashboard-data.json` | Command dashboard data model. | Active |
| `Content Agent` | `archaios-core/agents/content-agent.js` | Content generation from approved knowledge sources. | Active |
| `Infra Agent` | `archaios-core/agents/infra-agent.js` | Runtime and route health monitoring. | Active |
| `Product Agent` | `archaios-core/agents/product-agent.js` | Dashboard and product flow improvement. | Active |
| `Research Agent` | `archaios-core/agents/research-agent.js` | Knowledge extraction and clustering. | Active |
| `Revenue Agent` | `archaios-core/agents/revenue-agent.js` | Monetization prep. | Active |

## Service Boundaries

Canonical local runtime services:

```text
client/archaios-core/orchestrator/
client/archaios-core/services/
client/archaios-core/interfaces/
client/archaios-core/state/
```

Production app services outside local runtime:

```text
client/src/
worker.js
server/
supabase/functions/
archaios-agents/
```

## Dependency Flow

```text
tasks/agent-task-queue.json
  -> archaios-core/orchestrator/orchestrator.mjs
  -> archaios-core/runtime/agents/*.json
  -> archaios-core/agents/*.js
  -> logs/*.log
  -> projects/<agent-key>/last-run.json
  -> archaios-core/state/*.json
  -> archaios-core/interfaces/dashboard-data.json
  -> archaios-core/services/service-registry.json
```

## Service Risks

- `service-registry.json` stores relative paths beginning with `archaios-core/`, so it assumes execution from `client/`.
- `knowledge-index` points outside `archaios-core` to `client/knowledge/knowledge-index.json`.
- Output folders point outside `archaios-core` to `client/projects/`.
- Logs point outside `archaios-core` to `client/logs/`.

Recommendation:

- Keep these split paths for now because existing scripts expect them.
- Future consolidation should update orchestrator constants, manifests, service registry generation, docs, and dashboard consumers in one controlled change.
