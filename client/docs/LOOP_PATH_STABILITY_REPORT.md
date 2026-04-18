# Loop Path Stability Report

Generated: 2026-04-17

## Summary

The loop no longer depends on one fixed archive folder name. It resolves a canonical archive path dynamically at runtime and uses it for knowledge ingestion and queue source wiring.

## Changes Applied

- `archaios-loop.sh`
  - added dynamic archive root detection
  - exact-name preference with wildcard fallback
  - per-cycle queue source synchronization
  - resolved-path logging in loop status
  - exported path variables for orchestrator
- `archaios-core/orchestrator/orchestrator.mjs`
  - runtime and dashboard state now include:
    - `archiveRoot`
    - `knowledgeSource`

## Stability Outcome

- If iCloud renames `Archaios Infrastructure` to another `Archaios Infrastructure*` variant, the loop can still resolve and run.
- Knowledge pipeline no longer relies on static folder naming.

## Verification Command

```bash
LOOP_MAX_CYCLES=1 AUTO_PROCESS_KNOWLEDGE=true ORCHESTRATOR_ENABLED=true ./archaios-loop.sh start
```

## Expected Indicators

- `logs/loop-status.log` contains:
  - `resolved archive root: <path>`
- latest cycle line contains:
  - `orchestrator=ok`
- `archaios-core/state/runtime-state.json` contains:
  - `archiveRoot`
  - `knowledgeSource`

