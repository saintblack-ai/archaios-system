# ARCHAIOS Migration Readiness

Migration readiness score: 68/100

Interpretation: ready for documentation-first canonicalization, not ready for physical file movement.

## Completed Preparation

- `client/archaios-core/` is documented as the canonical runtime root.
- Runtime support folders have ownership README files.
- Runtime, agent, service, and path maps are documented.
- Existing orchestrator, service, runtime, and state paths have been inspected.
- Migration recommendations are documented without moving, deleting, renaming, or archiving files.

## Migration Recommendations Only

1. Keep `client/archaios-core/` as the official local ARCHAIOS runtime.
2. Keep `client/tasks/`, `client/logs/`, `client/projects/`, `client/knowledge/`, and `client/revenue/` in place until script paths are migrated together.
3. Keep root `agents/` in place because `worker.js` imports it directly.
4. Treat `client/src/agents/` as frontend adapter code, not runtime orchestration code.
5. Treat `archaios-agents/` as a separate Cloudflare scheduled-agent worker.
6. Treat `Archaios OS/` and `ArchaiosControl/` as internal/local operator infrastructure.
7. Treat `ARCHAIOS_Codex_AI_Agent_Pack/`, `archaios/`, and root Python role-agent folders as legacy/reference.
8. Do not archive anything until GitHub, Cloudflare, Supabase, and runtime validation are clean.

## Future Migration Phases

Phase 1: documentation alignment

- Update product docs to consistently distinguish:
  - canonical local runtime: `client/archaios-core/`
  - production frontend: `client/src/`
  - production backend: `worker.js`
  - scheduled worker: `archaios-agents/`
  - internal operator system: `Archaios OS/`

Phase 2: runtime path stabilization

- Decide whether runtime outputs should remain in:
  - `client/tasks/`
  - `client/logs/`
  - `client/projects/`
  - `client/knowledge/`
  - `client/revenue/`
- If moving them under `client/archaios-core/`, update orchestrator constants, manifests, service registry generation, dashboard readers, docs, and tests together.

Phase 3: duplicate classification

- Mark duplicate folders with README status labels before any archival:
  - active
  - active-external
  - internal
  - legacy
  - generated

Phase 4: archive proposal

- Produce a separate archive PR with exact moves and validation.
- Do not combine archival with runtime behavior changes.

## Remaining Blockers

- Root `worker.js` depends on root `agents/`.
- Root `package.json` still exposes Next commands for `app/`.
- `ArchaiosControl` hard-codes or defaults to `Archaios OS`.
- `archaios-agents` has separate deployment/dependency health.
- Vector/memory folders should not be moved without backup and consumer validation.

## Scoring

Runtime health score: 84/100

- Strong local runtime shape.
- All main manifests/scripts/state files are present.
- Deductions for split output paths and stale timestamps in state.

Canonical runtime validation: 92/100

- Strong evidence that `client/archaios-core/` is the correct canonical local runtime.
- Deductions because root `agents/` and `app/` are still active for other contexts.

Migration readiness score: 68/100

- Documentation preparation is ready.
- Physical consolidation is not ready until references, workflows, and backend imports are resolved.

## Do Not Execute Yet

Do not move, rename, delete, or archive:

```text
agents/
archaios/
Archaios OS/
ARCHAIOS_Codex_AI_Agent_Pack/
app/
Author_AI/
Executor_AI/
Mentor_AI/
Scholar_AI/
client/tasks/
client/logs/
client/projects/
client/knowledge/
client/revenue/
```
