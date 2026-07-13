# ARCHAIOS Security Model

## Credential Boundaries

- Service-role credentials remain server-side.
- Frontend only uses `VITE_*` public configuration.
- Refresh operations require `SITREP_REFRESH_TOKEN` or authenticated Elite access.
- Secret values must never be returned by health endpoints.

## Data Safety

- External URLs are validated by event validation.
- HTML is stripped during normalization.
- Raw payload hashes are stored for deduplication; raw payload storage should be size-limited before enabling full archival.
- Prompt-injection content from feeds is untrusted and must be quoted or summarized with source attribution.

## Access Control

- Supabase RLS is enabled in the provided migrations.
- Public reads are not enabled for private research missions.
- Research missions should remain isolated per future user ownership rules before multi-tenant launch.

## Audit

- Ingestion runs are recorded.
- Refresh responses include correlation IDs.
- Failed sources are reported rather than silently treated as live.
