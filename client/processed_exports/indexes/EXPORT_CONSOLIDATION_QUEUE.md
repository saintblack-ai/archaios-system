# ARCHAIOS Export Consolidation Queue

Generated: 2026-04-17T16:24:51.957Z

## Purpose

This queue defines the exact docs to create after the export inventory is reviewed. It is generated automatically by the intake scanner.

## Queue

| Category | Count | Output | Action | Status |
| --- | --- | --- | --- | --- |
| prompts | 1 | docs/PROMPT_REGISTRY_FROM_EXPORT.md | Extract reusable system prompts, agent roles, workflows, and safety boundaries. | ready-after-review |
| product-ideas | 2 | docs/PRODUCT_REQUIREMENTS_FROM_EXPORT.md | Convert product ideas into scoped requirements and backlog candidates. | ready-after-review |
| business-model | 4 | docs/REVENUE_NOTES_FROM_EXPORT.md | Extract pricing, funnel, offer, Stripe, and conversion ideas. | ready-after-review |
| app-features | 0 | docs/APP_FEATURE_BACKLOG_FROM_EXPORT.md | Convert implementation instructions into route, API, component, and schema tasks. | waiting-for-export |
| spiritual-research | 0 | docs/SPIRITUAL_RESEARCH_INDEX_FROM_EXPORT.md | Index doctrine, sermons, Mazzaroth, scripture, and spiritual research. | waiting-for-export |
| books | 1 | docs/BOOK_PROJECTS_FROM_EXPORT.md | Extract manuscripts, outlines, publishing plans, and book campaign material. | ready-after-review |
| music | 7 | docs/MUSIC_PROJECTS_FROM_EXPORT.md | Extract lyrics, album ideas, release plans, and promo material. | ready-after-review |
| game-os-systems | 2 | docs/ARCHAIOS_OS_SYSTEMS_FROM_EXPORT.md | Extract OS, game, simulation, and command-system concepts. | ready-after-review |
| crypto-systems | 3 | docs/CRYPTO_SYSTEMS_HOLD_QUEUE_FROM_EXPORT.md | Place crypto/token ideas into a hold queue pending explicit approval. | ready-after-review |

## Rules

- Do not publish raw export content.
- Do not move source files during consolidation.
- Keep private, sensitive, or uncertain content in hold queues.
- Convert only reviewed material into product docs or implementation tasks.

