# Dashboard Data Model

Generated: 2026-04-17

## Purpose

Define the local command-dashboard data payload produced by ARCHAIOS runtime orchestration.

## Primary Interface File

- `archaios-core/interfaces/dashboard-data.json`

## Schema

```json
{
  "generatedAt": "ISO-8601 timestamp",
  "systemHealth": "healthy | degraded",
  "activeAgents": 0,
  "taskCounts": {
    "intake": 0,
    "completed": 0,
    "blocked": 0
  },
  "projectClusterSummary": [
    {
      "name": "string",
      "count": 0
    }
  ],
  "revenueOpportunities": ["string"],
  "knowledgeIngestionSummary": {
    "files": 0,
    "conversations": 0,
    "records": 0
  },
  "serviceRegistry": "archaios-core/services/service-registry.json"
}
```

## Upstream Sources

- Task source:
  - `tasks/agent-task-queue.json`
- Queue outputs:
  - `tasks/{queue,in_progress,completed,blocked,prioritized}/`
- Knowledge summary:
  - `knowledge/knowledge-index.json`
- Revenue summary source:
  - `revenue/revenue_streams.md`
- Service registry:
  - `archaios-core/services/service-registry.json`
- Runtime state:
  - `archaios-core/state/runtime-state.json`

## Refresh Mechanics

- Triggered by orchestrator cycle:
  - `npm run archaios:orchestrate`
- Also callable from loop cycle when:
  - `ORCHESTRATOR_ENABLED=true`

## Frontend Consumption Guidance

1. Read `dashboard-data.json` as the primary summary payload.
2. Read `runtime-state.json` for deeper queue and agent diagnostics.
3. Read per-agent state files for localized status and action controls.
4. Render degraded mode when `systemHealth=degraded`.

## Reliability Rules

- Missing files should be treated as recoverable.
- If `dashboard-data.json` is absent:
  - fallback to `runtime-state.json`
  - fallback to queue directory counts
- UI should display "data unavailable" state rather than hard fail.

