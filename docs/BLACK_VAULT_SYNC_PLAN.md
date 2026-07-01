# Black Vault → Archaios Knowledge Sync Plan

## Purpose and present state

The Black Vault is Archaios' curated research memory. **Notion is the source of truth today.** This repository contains only the governance, schema, and future integration contract; it does not contain a copy of Black Vault entries, credentials, database IDs, or an active synchronization implementation.

The initial Black Vault category set is:

- Enoch Research, Watchers, Nephilim, Rephaim, Archons
- Ancient Civilizations, Hyperborea, Pleiadian Research, Spiritual Studies
- Intelligence History, Military Doctrine, Strategic Philosophy, Future Predictions

## Repository-side structure

`docs/BLACK_VAULT_RESEARCH_SCHEMA.md` defines the portable metadata contract for an entry. `docs/BLACK_VAULT_SOURCE_STANDARDS.md` defines evidence and provenance requirements. `docs/BLACK_VAULT_CONFIDENCE_MODEL.md` defines uncertainty handling.

These documents are intentionally metadata-first. Research text, attachments, private notes, personal information, API tokens, Notion URLs with embedded access context, and workspace/database identifiers stay out of Git unless deliberately reviewed and approved for publication.

## Phased future sync strategy

1. **Governance (current):** Maintain the Black Vault in Notion and use these documents as the operating standard. No sync is asserted or performed.
2. **Schema alignment:** Map Notion properties to the portable schema, establish stable `vault_id` values, normalize controlled tags, and identify which fields may ever leave Notion.
3. **Read-only export pilot:** Build an explicitly authorized, credential-managed process that produces a reviewed, redacted local export or index. It must be idempotent, log its run metadata without secrets, and never overwrite a human review decision.
4. **Archivist retrieval integration:** Permit ARCHIVIST to query approved, redacted records through a least-privilege service boundary. Return citations, confidence, classification, and status with every result.
5. **Controlled write-back:** Only after review, let ARCHIVIST propose—not silently publish—new entries, source links, tags, or status changes. A named human reviewer approves writes to Notion.
6. **Preservation:** Create periodic reviewed exports and checksummed snapshots according to the legacy protocol. Notion remains canonical unless a formal migration decision changes that.

## Guardrails for any future implementation

- Use a dedicated integration identity, least-privilege access, and managed secrets outside source control.
- Synchronize only allowlisted fields and classifications; default to excluding private material.
- Preserve provenance, original source references, timestamps, author/reviewer identity, and uncertainty on every transfer.
- Treat sync conflicts as review events. Never infer that a repository copy is newer or more authoritative than Notion.
- Record sync outcomes as operational metadata only: run time, schema version, counts, result, and error class—never content or tokens in logs.
- Require a health check, dry-run, redaction review, and rollback/export plan before enabling a new integration stage.

## ARCHIVIST Agent operating contract

Until an approved integration exists, ARCHIVIST must not claim it can access or update the Black Vault. It may work with user-provided or separately authorized material and should label it as external to the canonical vault.

When a future connector is approved, ARCHIVIST should:

1. Read only entries within its granted classification and field allowlist.
2. Surface `vault_id`, title, category, status, source citations, classification, and confidence with any synthesis.
3. Keep claim, evidence, interpretation, and unresolved questions separate.
4. Draft proposed entries or updates using the research schema; never fabricate sources, confidence, or review completion.
5. Send write proposals to a human review queue, then write only approved changes using an idempotency key and an audit record.

