# Next 3 Commands

Generated: 2026-04-17

## Command 1: Run One Controlled Loop Cycle

```bash
LOOP_MAX_CYCLES=1 AUTO_PROCESS_KNOWLEDGE=true ORCHESTRATOR_ENABLED=true ./archaios-loop.sh start
```

## Command 2: Inspect Runtime State + Queue Health

```bash
cat archaios-core/state/runtime-state.json && \
tail -n 20 logs/orchestrator.log && \
ls -1 tasks/completed | tail -n 10
```

## Command 3: Mirror Updated Outputs to Canonical Archive (Non-Destructive)

```bash
rsync -ai --ignore-existing docs/ archaios-core/ agents/ tasks/ revenue/ knowledge/ processed_exports/ raw_exports/ \
"$HOME/Library/Mobile Documents/com~apple~CloudDocs/Archaios Infrastructure/"
```

