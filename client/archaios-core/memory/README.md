# ARCHAIOS Runtime Memory

Ownership: `client/archaios-core/memory/` is reserved for runtime-local memory adapters, memory snapshots, and retrieval metadata owned by the canonical runtime.

Current memory-like paths:

- Runtime state: `client/archaios-core/state/`
- Legacy Python memory module: `archaios/memory/`
- Chroma/vector storage: `archaios/memory_db/` and `archaios_memory/`
- Client placeholder: `client/memory/`

Rule: do not move vector database files into this folder until consumers, backup policy, and restore tests are documented.
