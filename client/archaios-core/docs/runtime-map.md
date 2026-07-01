# ARCHAIOS Runtime Map

Canonical runtime root: `client/archaios-core/`

Health score: 84/100

Reasoning:

- Orchestrator exists and is syntactically valid.
- Five runtime agent manifests exist.
- Five executable agent scripts exist.
- Five per-agent state files exist.
- Service registry exists and maps the orchestrator, dashboard data, knowledge index, and all five agents.
- Dashboard interface data exists.
- Supporting folders now have README ownership notes.
- Remaining deductions come from path split risk: runtime scripts write to `client/logs/`, `client/tasks/`, and `client/projects/` while placeholder ownership folders also exist under `client/archaios-core/`.

## Runtime Ownership

| Path | Runtime Role | Status | Notes |
| --- | --- | --- | --- |
| `client/archaios-core/orchestrator/` | Task routing and runtime state generation | Active | `orchestrator.mjs` is the canonical dispatcher. |
| `client/archaios-core/agents/` | Executable core agents | Active | Contains content, infra, product, research, and revenue agents. |
| `client/archaios-core/runtime/` | Agent contracts | Active | Runtime manifests define mission, rules, output, allowed actions, and blocked actions. |
| `client/archaios-core/state/` | Runtime state snapshots | Active | Contains runtime state and per-agent state JSON. |
| `client/archaios-core/services/` | Service registry | Active | Contains `service-registry.json` and checkout simulation helper. |
| `client/archaios-core/interfaces/` | Dashboard/runtime interface output | Active | Contains `dashboard-data.json` and UI contracts. |
| `client/archaios-core/docs/` | Runtime documentation | Active | New canonical runtime docs. |
| `client/archaios-core/knowledge/` | Future runtime-local knowledge adapters | Reserved | Current source is `client/knowledge/`. |
| `client/archaios-core/logs/` | Future runtime-local logs | Reserved | Current executable write path is `client/logs/`. |
| `client/archaios-core/memory/` | Future runtime-local memory adapters | Reserved | Existing memory data remains outside core. |
| `client/archaios-core/projects/` | Future runtime-local project metadata | Reserved | Current executable write path is `client/projects/`. |
| `client/archaios-core/revenue/` | Future runtime-local revenue contracts | Reserved | Current source is `client/revenue/`. |
| `client/archaios-core/tasks/` | Future runtime-local task schema docs | Reserved | Current executable path is `client/tasks/`. |

## Execution Flow

1. Operator runs from `client/`:

   ```bash
   npm run archaios:orchestrate
   ```

2. `client/archaios-core/orchestrator/orchestrator.mjs` reads:

   ```text
   client/tasks/agent-task-queue.json
   client/archaios-core/runtime/agents/*.json
   client/knowledge/knowledge-index.json
   client/revenue/revenue_streams.md
   ```

3. Orchestrator dispatches:

   ```text
   client/archaios-core/agents/<agent-key>.js
   ```

4. Agents write:

   ```text
   client/logs/<agent-key>.log
   client/projects/<agent-key>/last-run.json
   ```

5. Orchestrator writes:

   ```text
   client/tasks/{queue,in_progress,completed,blocked,prioritized}/
   client/archaios-core/services/service-registry.json
   client/archaios-core/state/runtime-state.json
   client/archaios-core/state/agents/*.json
   client/archaios-core/interfaces/dashboard-data.json
   client/logs/orchestrator.log
   ```

## Verification Commands

```bash
node --check client/archaios-core/orchestrator/orchestrator.mjs
find client/archaios-core/services -maxdepth 2 -type f | sort
find client/archaios-core/runtime -maxdepth 3 -type f | sort
find client/archaios-core/state -maxdepth 3 -type f | sort
npm --prefix client run archaios:orchestrate
```
