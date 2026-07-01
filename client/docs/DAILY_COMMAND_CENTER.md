# ARCHAIOS Daily Command Center

The Daily Command Center is the Phase II operating surface for making ARCHAIOS useful every day.

## Runtime Flow

1. Each core agent emits a structured report with status, findings, actions, metrics, and risks.
2. Commander merges the reports into a concise morning briefing and evening review.
3. Dashboard panels read the generated interface at `client/archaios-core/interfaces/daily-command-center.json`.
4. Scheduled tasks are prepared as records first. Actions that deploy, mutate billing, touch secrets, or publish externally stay approval-gated.

## Commander Inputs

- Runtime health from `client/archaios-core/runtime/runtime-health.mjs`
- Agent contract from `client/archaios-core/runtime/agent-network.json`
- Knowledge index from `client/knowledge/knowledge-index.json`
- Revenue readiness from `client/revenue/revenue-readiness.json`
- Books and KPI data from `client/data`
- Task queues from `client/tasks`

## Semantic Memory

The pgvector migration is `client/supabase/sql/2026-06-28_archaios_semantic_memory.sql`.

Memory is split into:

- `archaios_memory_documents`
- `archaios_memory_chunks`
- `archaios_conversation_turns`

The retrieval path is document ingestion, metadata normalization, chunking, embedding generation, pgvector storage, similarity search, and summarization/pruning.

## Generation

Run:

```bash
npm --prefix client run archaios:daily
```

This regenerates the Daily Command Center JSON for the dashboard and future automation.
