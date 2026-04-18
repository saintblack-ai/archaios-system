# Canonical Path Resolution

Generated: 2026-04-17

## Purpose

Stabilize ARCHAIOS loop execution when iCloud renames the archive folder between:

- `Archaios Infrastructure`
- `Archaios Infrastructure 2`
- any `Archaios Infrastructure*` variant

## Runtime Resolution Rules

Implemented in `archaios-loop.sh`:

1. Search root:
   - `~/Library/Mobile Documents/com~apple~CloudDocs`
2. Preferred match:
   - exact folder `Archaios Infrastructure`
3. Fallback match:
   - first sorted folder matching `Archaios Infrastructure*`
4. Derived source:
   - `<resolved_archive_root>/raw_exports/chatgpt_export_2026-04-16`

## Propagation Targets

- Loop logs:
  - `logs/loop-status.log` includes `resolved archive root: ...`
- Task queue source:
  - `tasks/agent-task-queue.json` source is synchronized each cycle
- Runtime state:
  - `archaios-core/state/runtime-state.json` now includes:
    - `archiveRoot`
    - `knowledgeSource`
- Dashboard data model:
  - `archaios-core/interfaces/dashboard-data.json` now includes:
    - `archiveRoot`
    - `knowledgeSource`

## Operational Notes

- This eliminates dependency on a single hardcoded archive folder name.
- No deploy, billing, DNS, or secret changes are involved.
- Resolution occurs per cycle, so folder-name drift is auto-tolerated.

