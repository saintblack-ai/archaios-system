# Task Orchestration Map

Generated: 2026-04-17

## Objective

Define how ARCHAIOS routes tasks from intake to execution while preserving auditability and non-destructive operation.

## Queue Topology

- Intake queue: `tasks/queue/`
- In-progress queue: `tasks/in_progress/`
- Completed queue: `tasks/completed/`
- Blocked queue: `tasks/blocked/`
- Priority queue: `tasks/prioritized/`
- Source task feed: `tasks/agent-task-queue.json`

## Dispatch Flow

1. Loop cycle updates `tasks/agent-task-queue.json` from current mission directives.
2. `archaios-core/orchestrator/orchestrator.mjs` ingests each task.
3. Orchestrator normalizes and writes intake records into `tasks/queue/`.
4. High-priority tasks are mirrored into `tasks/prioritized/`.
5. Tasks move to `tasks/in_progress/` when runtime execution begins.
6. Agent runtime script is invoked from `archaios-core/agents/<agent>.js`.
7. On success, task state is written to `tasks/completed/`.
8. On missing runtime or execution failure, task state is written to `tasks/blocked/`.

## Routing Rules

- Primary router: `archaios-core/orchestrator/orchestrator.mjs`
- Agent key resolution is based on runtime definitions in:
  - `archaios-core/runtime/agents/*.json`
- Runtime script path convention:
  - `archaios-core/agents/<agent-key>.js`
- Missing runtime definition -> blocked (`missing-agent-definition`)
- Missing runtime script -> blocked (`missing-agent-script`)
- Runtime failure -> blocked (`agent-execution-failure`)

## State and Health Outputs

- Global runtime state:
  - `archaios-core/state/runtime-state.json`
- Per-agent state:
  - `archaios-core/state/agents/<agent-key>.json`
- Service registry:
  - `archaios-core/services/service-registry.json`
- Dashboard interface payload:
  - `archaios-core/interfaces/dashboard-data.json`
- Orchestration log:
  - `logs/orchestrator.log`

## De-duplication and Churn Control

- Loop-level anti-churn logic is enforced in `archaios-loop.sh` using:
  - `LAST_CYCLE_SIGNATURE`
  - `LAST_BUILD_INPUT_HASH`
  - knowledge hash checks
- Build runs are interval-gated by `BUILD_MIN_INTERVAL_SECONDS`.
- Knowledge ingestion is interval/hash-gated by `KNOWLEDGE_MIN_INTERVAL_SECONDS`.

## Safety Constraints

- No deploy actions.
- No DNS mutations.
- No secret mutation.
- No billing activation.
- All writes are local and append-safe for logs.

