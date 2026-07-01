# ARCHAIOS Runtime Knowledge

Ownership: `client/archaios-core/knowledge/` is reserved for runtime-local knowledge adapters, derived indexes, and references that are directly consumed by the canonical runtime.

Current source of truth:

- Primary knowledge corpus: `client/knowledge/`
- Processed export snapshots: `client/processed_exports/knowledge_snapshots/`
- Runtime summarization reader: `client/archaios-core/orchestrator/orchestrator.mjs`
- Current runtime input path: `client/knowledge/knowledge-index.json`

Rule: keep durable knowledge content in `client/knowledge/` until a dedicated migration updates scripts and references.
