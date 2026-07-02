# ARCHAIOS 100-Year Knowledge System Standards

Status: canonical operating standard
Owner: Commander, Archivist, Knowledge Curator
Applies to: code, infrastructure, documents, knowledge records, mission logs, decisions, and product history

## Purpose

ARCHAIOS must remain understandable to future engineers who did not know the founder, the original architecture, or the historical context behind the system.

The goal is not only to preserve files. The goal is to preserve meaning:

- what was built
- why it was built
- who approved it
- what changed
- what risks were known
- what evidence supported decisions
- what future maintainers must not accidentally destroy

Every important decision should be recoverable from durable records without needing private memory, chat context, or undocumented assumptions.

## Prime Directive

If a future engineer cannot understand the reason for a system, file, migration, agent, or business rule from the repository itself, the knowledge system has failed.

## Preservation Tiers

| Tier | Name | Examples | Rule |
| --- | --- | --- | --- |
| 0 | Primary Sources | original manuscripts, exports, PDFs, legal docs, source code, migrations | Preserve unchanged. Never overwrite. |
| 1 | Canonical Records | architecture docs, ADRs, mission logs, release notes, source standards | Version and review. These explain the system. |
| 2 | Operational Records | dashboards, generated reports, readiness audits, test results | Keep latest plus milestone snapshots. |
| 3 | Derived Knowledge | summaries, embeddings, briefs, reports, excerpts | Always link back to source records. |
| 4 | Temporary Work | scratch notes, local temp files, generated caches | Expire or archive deliberately. |

## Documentation Standards

Every durable document must answer:

- What is this?
- Why does it exist?
- Who owns it?
- What systems depend on it?
- What is the source of truth?
- What changed since the last major revision?
- What must future maintainers be careful about?

Required front matter for canonical docs:

```text
Status: draft|active|canonical|superseded|archived
Owner: agent or human role
Last updated: YYYY-MM-DD
Applies to: system/component/domain
Supersedes: path or none
Depends on: path(s) or none
Review cadence: monthly|quarterly|annual|event-driven
```

Documentation classes:

| Class | Path | Purpose |
| --- | --- | --- |
| System standard | `docs/` | Long-lived rules and operating principles. |
| Runtime docs | `client/archaios-core/docs/` | Current implementation maps and service contracts. |
| Product docs | `client/docs/` | App, dashboard, revenue, and launch execution details. |
| Mission logs | `knowledge/logs/` or `ARCHAIOS_COMMAND_BRIEFING/` | Time-bound command records and operator decisions. |
| Knowledge records | `knowledge/` | Identity, mission, research, books, music, vault, memory. |
| Reports | `reports/` | Audits, readiness reports, investigations, historical snapshots. |

Do not duplicate canonical docs without marking one as source of truth and the other as mirror, archive, or derivative.

## Folder Structure Standard

Top-level intent:

```text
app/                         Next.js application and API routes
client/                      Vite client, ARCHAIOS core, dashboard runtime
client/archaios-core/        canonical local ARCHAIOS runtime
client/supabase/sql/         production-relevant Supabase migrations
docs/                        long-lived system standards and operator manuals
reports/                     audits and historical readiness records
knowledge/                   permanent knowledge tree
ARCHAIOS_COMMAND_BRIEFING/    commander-level briefings and mission records
tests/                       repository-level tests
scripts/                     root operational scripts
server/                      Node backend services
```

Knowledge tree:

```text
knowledge/
  identity.md
  mission.md
  projects/
  research/
  books/
  music/
  business/
  vault/
  memory/
  logs/
```

Rules:

- Put source material in the most specific domain folder.
- Put generated summaries under `knowledge/memory/` or a derived-output folder, not beside originals unless clearly marked.
- Put operational decisions in mission logs or ADRs, not scattered chat transcripts.
- Keep raw exports quarantined until redacted and indexed.
- Never store secrets in knowledge, docs, reports, or source files.

## Naming Conventions

Use names that survive time, not names that only make sense today.

Files:

```text
YYYY-MM-DD_short-topic.md
YYYY-MM-DD_component_decision-title.md
YYYY-MM-DD_system_event-summary.json
```

Examples:

```text
2026-07-01_commander_executive-officer-service.md
2026-07-01_sentinel_security-dashboard.md
2026-07-01_black-vault_ingestion-standard.md
```

Rules:

- Use lowercase for machine-readable IDs.
- Use kebab-case for filenames unless the repo already has an established uppercase report convention.
- Use stable IDs for database rows and generated records.
- Avoid vague names like `final`, `new`, `latest`, `fixed`, `copy`, or `v2` without date/context.
- If a file is superseded, mark it in the file and link to the replacement.

Agent keys:

```text
commander
archivist
researcher
engineer
writer
strategist
analyst
security
automation
vision
revenue
deployment
qa
finance
legal
customer_success
knowledge_curator
```

Database objects:

- Tables: plural snake_case, domain-prefixed when needed.
- Columns: snake_case.
- Migrations: `YYYY-MM-DD_domain_change.sql`.
- Do not reuse deleted table names for different concepts.

## Architecture Decision Records

Every major architectural decision requires an ADR.

ADR path:

```text
docs/adr/
```

ADR filename:

```text
YYYY-MM-DD_short-decision-title.md
```

ADR template:

```text
# ADR: Decision Title

Status: proposed|accepted|superseded|rejected
Date: YYYY-MM-DD
Owner: role/agent
Supersedes: path or none
Related: paths

## Context

What problem forced this decision?

## Decision

What was chosen?

## Alternatives Considered

What else was considered and why was it not chosen?

## Consequences

What becomes easier, harder, safer, or riskier?

## Migration Notes

What must future maintainers know when changing this?

## Evidence

Links to code, docs, reports, tests, issues, or source records.
```

ADR triggers:

- new service boundary
- agent network change
- database schema direction
- authentication or RBAC change
- payment/billing workflow change
- deployment target change
- irreversible migration
- security exception
- public product direction change
- replacement of a canonical system

## Project History Standard

Each major project must maintain a project history file:

```text
knowledge/projects/<project-id>/history.md
```

Minimum fields:

```text
# Project History: Name

Status:
Owner:
Started:
Current source of truth:

## Timeline

| Date | Event | Evidence | Impact |
| --- | --- | --- | --- |

## Major Decisions

| Date | Decision | ADR/Source | Consequence |
| --- | --- | --- | --- |

## Releases

| Version | Date | Summary | Verification |
| --- | --- | --- | --- |

## Open Risks

| Risk | Owner | Mitigation | Review Date |
| --- | --- | --- | --- |
```

Rules:

- Record facts, not hype.
- Link to commits, tests, generated reports, and ADRs.
- Preserve failed attempts if they explain current constraints.
- Never rewrite history to make decisions look cleaner than they were.

## Version History Standard

ARCHAIOS should maintain three version layers:

| Layer | Scope | Record |
| --- | --- | --- |
| Product version | user-visible app/product behavior | changelog or release note |
| Runtime version | agent network, Commander, Sentinel, memory, automation | runtime manifest/version file |
| Knowledge version | canonical docs, vault records, mission state | mission log and knowledge index |

Release notes must include:

- version/date
- summary
- changed systems
- migrations
- security impact
- user impact
- rollback notes
- verification commands/results

Version rules:

- Code without verification is not production-ready.
- Migrations must identify apply order and rollback posture.
- Generated dashboards must record `generatedAt`.
- Knowledge changes must preserve source provenance.

## Knowledge Preservation Standard

Every important record must include:

- title
- source type
- source path or URI
- owner
- date created
- date ingested
- classification
- tags
- summary
- provenance
- relationship links
- importance score

Relationship types:

```text
supports
contradicts
supersedes
derived_from
duplicates
belongs_to_project
mentions_entity
requires_review
```

Classification:

```text
public
internal
private
sensitive
restricted
```

Rules:

- Originals are immutable.
- Derived records must link to originals.
- AI summaries are not sources.
- Sensitive exports require redaction before semantic indexing.
- Canonical knowledge requires review by Archivist or Knowledge Curator.
- Security can block publication, export, embedding, or deletion.

## Mission Logs

Mission logs preserve operational memory.

Mission log path:

```text
knowledge/logs/YYYY/YYYY-MM-DD_mission-log.md
```

Mission log template:

```text
# Mission Log: YYYY-MM-DD

Commander:
Mode:
Primary objective:
Operational status:

## Decisions

| Decision | Owner | Evidence | Follow-up |
| --- | --- | --- | --- |

## Work Completed

| Item | Files/Systems | Verification |
| --- | --- | --- |

## Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |

## Deferred Work

| Item | Reason | Next review |
| --- | --- | --- |

## Preservation Notes

What must future engineers know about today's work?
```

Rules:

- Log meaningful decisions, not every minor edit.
- Include verification commands when code changes.
- Include explicit non-actions when important: no deploy, no billing activation, no secret change.
- Link to ADRs for architectural choices.

## Historical Integrity Rules

Future engineers must be able to distinguish:

- source vs summary
- current vs archived
- plan vs implemented
- test mode vs live production
- projection vs verified revenue
- local evidence vs externally verified fact
- operator-approved action vs prepared recommendation

Required language:

- Use `verified` only when evidence exists.
- Use `projected` for estimates.
- Use `prepared` for planned but unexecuted actions.
- Use `blocked` when approval, credentials, law, security, or missing evidence prevents action.
- Use `superseded` when a better canonical path replaces an older one.

## Review Cadence

| Record Type | Review |
| --- | --- |
| ADRs | when affected system changes |
| Mission/identity docs | quarterly |
| Production deployment docs | every release |
| Security standards | monthly and after incident |
| Revenue/billing docs | before any paid launch change |
| Knowledge taxonomy | monthly |
| Project histories | after each milestone |
| Migration manifest | before database changes |

## Agent Responsibilities

| Agent | Preservation Duty |
| --- | --- |
| Commander | ensures decisions are logged and priorities are understandable |
| Archivist | preserves source records and provenance |
| Knowledge Curator | maintains canonical source map and resolves duplicates |
| Researcher | records evidence quality and uncertainty |
| Engineer | links code changes to tests, ADRs, and deployment notes |
| Security | protects secrets, classifications, and approval boundaries |
| Analyst | distinguishes projections from verified metrics |
| Writer | keeps docs readable without overstating certainty |
| Automation | writes audit trails for generated or scheduled actions |
| Deployment | records release evidence and rollback notes |

## Minimum Standard Before Major Change

Before any major change, create or update:

- relevant ADR
- project history entry
- mission log entry
- test or verification record
- rollback or recovery note
- affected documentation links

If the change touches auth, billing, deployment, secrets, production data, or permanent memory, Security must review or block it.

## 100-Year Rule

Assume a future engineer opens this repository in 2126 with no personal context.

They should be able to answer:

- What was ARCHAIOS?
- What did it protect?
- What did it sell?
- What did it know?
- What was canonical?
- What was experimental?
- What was dangerous to change?
- Which decisions shaped the system?
- Which records can be trusted, and why?

If the repository cannot answer those questions, preserve more context before moving faster.
