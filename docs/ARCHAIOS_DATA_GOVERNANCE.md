# ARCHAIOS Data Governance

## Classification

- Live: successfully fetched from an official/public/configured source during refresh.
- Cached: previously fetched or internally generated operational data.
- Sample: UI continuity data, never operational intelligence.
- Stale: source has not refreshed within its freshness window.
- Unavailable: source has not produced usable data.

## Retention

SITREP events, reports, ingestion runs, and research missions should be retained until an explicit retention policy is approved. Deletion behavior must preserve audit requirements for generated reports and ingestion runs.

## User Research

Research mission notes, evidence, attachments metadata, and generated assessments should be treated as private user data. Future multi-user storage must add ownership columns and RLS policies before shared deployment.

## Verification

Verified means the event came from an official or explicitly configured source. It does not mean ARCHAIOS independently confirmed every downstream interpretation.
