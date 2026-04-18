# Next Build Commands

Generated: 2026-04-17

## Core Infrastructure Commands

```bash
# 1) Rebuild knowledge/project/revenue artifacts from organized export source
npm run archaios:build -- "raw_exports/chatgpt_export_2026-04-16"

# 2) Run one orchestrator cycle (task routing + agent execution + state writes)
npm run archaios:orchestrate

# 3) Run one autonomous loop cycle with knowledge processing and orchestrator
LOOP_MAX_CYCLES=1 AUTO_PROCESS_KNOWLEDGE=true ORCHESTRATOR_ENABLED=true ./archaios-loop.sh start

# 4) Inspect current loop status
./archaios-loop.sh status
```

## Runtime Verification Commands

```bash
# Queue outputs
ls -la tasks/queue tasks/in_progress tasks/completed tasks/blocked tasks/prioritized

# Orchestrator outputs
ls -la archaios-core/state archaios-core/state/agents archaios-core/interfaces archaios-core/services

# Logs
tail -n 40 logs/orchestrator.log
tail -n 40 logs/loop-status.log
tail -n 40 logs/daily-summary.log
```

## Safe Daily Command

```bash
LOOP_MAX_CYCLES=1 AUTO_PROCESS_KNOWLEDGE=true ORCHESTRATOR_ENABLED=true ./archaios-loop.sh start
```

Use this to run a controlled single cycle without triggering external deployment or billing actions.

