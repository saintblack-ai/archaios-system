# ARCHAIOS Agent Readiness

## Implemented Readiness Layer
The Worker exposes deterministic readiness data for:
- Archaios Commander
- Mission Runner
- Tool Registry
- Memory Retrieval
- Planning Layer
- Verification Layer
- Execution Logs
- Human Approval Gate
- Daily SITREP Generator
- Agent Health Monitor

## Safety Model
- Read-only health and status endpoints are public and degraded-safe.
- Manual mutation endpoints remain guarded by existing authorization and infrastructure activation.
- Supabase writes remain gated by `SUPABASE_ACTIVE`.
- Stripe checkout remains gated by `STRIPE_CHECKOUT_ACTIVE`.
- No autonomous destructive behavior was added.
- Agent execution must continue to flow through approved tools and explicit human approval gates.

## Current Agent Health
When Supabase is inactive, `GET /api/agents/status` returns local registry status as `ready_degraded`. This keeps the command center observable without pretending that persisted execution memory is active.

## Remaining Work
- Verify Supabase agent tables and RLS before enabling persisted memory.
- Add operator-facing execution log UI after backend persistence is verified.
- Keep destructive actions behind human approval.
