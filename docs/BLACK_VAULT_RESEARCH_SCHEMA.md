# Black Vault Research Schema

## Scope

This is a portable, documentation-level schema for Black Vault entries. It is a future mapping target, not proof of an existing Notion integration. Notion remains the canonical record.

## Core entry model

| Field | Requirement | Meaning |
| --- | --- | --- |
| `vault_id` | Required, stable | Non-secret unique identifier; never reuse it. |
| `title` | Required | Clear, neutral entry title. |
| `category` | Required | One primary category from the controlled model. |
| `research_status` | Required | Workflow stage defined below. |
| `classification` | Required | Access/sensitivity level. |
| `summary` | Required | Bounded neutral synopsis, distinct from claims. |
| `claims` | Recommended | Atomic statements, each linked to evidence and confidence. |
| `sources` | Required for substantive entries | Source records meeting source standards. |
| `tags` | Recommended | Controlled discovery labels. |
| `confidence_score` | Required | Score and band for the entry or individual claim. |
| `counterevidence` | Recommended | Credible disputes, limitations, and alternative explanations. |
| `created_at`, `updated_at` | Required | Canonical timestamps. |
| `author`, `reviewer` | Required when known | Accountable researcher and last reviewer. |
| `related_ids` | Optional | Stable references to related entries; no private links required. |

## Category model

Categories are controlled, singular primary labels. Cross-cutting work uses tags and `related_ids` rather than multiple primary categories.

| Domain | Categories |
| --- | --- |
| Ancient & esoteric research | Enoch Research; Watchers; Nephilim; Rephaim; Archons; Ancient Civilizations; Hyperborea; Pleiadian Research; Spiritual Studies |
| Historical & strategic research | Intelligence History; Military Doctrine; Strategic Philosophy |
| Foresight | Future Predictions |

`Future Predictions` entries must state the prediction horizon, indicators, assumptions, and falsification/review date. They are forecasts, not established fact.

## Classification levels

| Level | Use | Repository/sync treatment |
| --- | --- | --- |
| `public` | Approved for open distribution | May be exported after review. |
| `internal` | Operational or unlisted research | Keep out of public artifacts by default. |
| `confidential` | Sensitive research, relationships, or analysis | Restricted integration only; no Git content export. |
| `personal` | Personal records or identifiable private context | Do not sync without explicit owner approval. |
| `sealed` | Embargoed, legally restricted, or need-to-know material | No automated read/write/export; manual controlled access only. |

Classification governs access, not truth. Any change to a more permissive level requires explicit human review.

## Research-status workflow

`inbox` → `triage` → `collecting` → `analyzing` → `review` → `published` → `archived`

- `inbox`: unprocessed lead or capture.
- `triage`: scope, category, classification, and research question assigned.
- `collecting`: sources gathered; no conclusion implied.
- `analyzing`: claims, evidence, counterevidence, and confidence assessed.
- `review`: independent or designated review pending.
- `published`: approved for its stated audience; not necessarily public.
- `archived`: retained historical record; changes require a revision note.

`disputed` may be applied as a status flag at any stage when material counterevidence or unresolved conflict exists. Never move an entry to `published` solely because it is old or frequently repeated.

## Tags

Use lowercase, hyphenated, non-secret tags. Prefer 3–8 tags drawn from these facets:

- `topic:` people, places, texts, events, organizations, or concepts (`topic:book-of-enoch`)
- `period:` historical era or forecast horizon (`period:late-antiquity`)
- `method:` research method (`method:comparative-textual-analysis`)
- `source-type:` evidence form (`source-type:primary-document`)
- `region:` geographic scope (`region:mediterranean`)
- `lens:` analytic frame (`lens:military-history`)
- `status:` exceptional discovery marker only when needed (`status:needs-citation`)

Do not encode names of restricted sources, credentials, addresses, personal details, or access paths in tags.

