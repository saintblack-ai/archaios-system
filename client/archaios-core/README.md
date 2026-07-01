# ARCHAIOS Core

`client/archaios-core/` is the canonical ARCHAIOS runtime root for local orchestration, agent contracts, service registry output, interface snapshots, and runtime state.

Runtime ownership:

- `agents/`: executable core agent scripts.
- `runtime/`: agent manifests and execution contracts.
- `orchestrator/`: task routing, state generation, and dispatch.
- `services/`: service registry and runtime service metadata.
- `interfaces/`: dashboard-facing runtime payloads.
- `state/`: orchestrator and per-agent state snapshots.
- `docs/`: canonical runtime maps and migration readiness notes.
- `knowledge/`: runtime-local knowledge references and future indexes.
- `memory/`: runtime-local memory snapshots and future adapters.
- `logs/`: runtime-local log ownership documentation; current executable agents write to `client/logs/`.
- `projects/`: runtime-local project ownership documentation; current executable agents write to `client/projects/`.
- `tasks/`: runtime-local task ownership documentation; current orchestrator reads from `client/tasks/`.
- `revenue/`: runtime-local revenue ownership documentation; current revenue source artifacts live in `client/revenue/`.

Production boundaries:

- Frontend source remains `client/src/`.
- Production Cloudflare Worker remains root `worker.js`.
- Scheduled Cloudflare agent worker remains `archaios-agents/`.
- Legacy and internal operator systems remain in place until a separate approved migration.
