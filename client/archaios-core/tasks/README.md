# ARCHAIOS Runtime Tasks

Ownership: `client/archaios-core/tasks/` is reserved for runtime task contracts and future task schema documentation.

Current executable paths:

- Source queue: `client/tasks/agent-task-queue.json`
- Queue state: `client/tasks/queue/`
- Active work: `client/tasks/in_progress/`
- Completed work: `client/tasks/completed/`
- Blocked work: `client/tasks/blocked/`
- Prioritized work: `client/tasks/prioritized/`

Rule: the orchestrator currently reads and writes `client/tasks/`; do not move task state without updating `client/archaios-core/orchestrator/orchestrator.mjs`.
