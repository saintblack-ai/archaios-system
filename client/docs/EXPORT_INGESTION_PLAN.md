# ARCHAIOS Export Ingestion Plan

Generated: 2026-04-17

## Objective

Prepare for the incoming ChatGPT / OpenAI legacy export so it can become structured ARCHAIOS source material instead of a chaotic archive dump.

## Intake Location

Current prepared intake folder:

```text
ARCHAIOS_INFRASTRUCTURE/inbox/
```

Current scanner command:

```bash
npm run archaios:intake
```

Generated outputs:

```text
ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json
ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md
ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md
```

## Ingestion Phases

### Phase 1: Drop And Preserve

- Put the export zip or extracted folder in `ARCHAIOS_INFRASTRUCTURE/inbox/`.
- Do not edit source export files.
- If zip arrives, extract into a named folder under `inbox/`.
- Run `npm run archaios:intake`.
- Review generated reports before any consolidation.

### Phase 2: Classify

Classify material into:

| Bucket | Description | Destination |
|---|---|---|
| Prompts | System prompts, agent roles, recurring instructions, workflows | `classified/prompts/` |
| Product ideas | Product concepts, features, app ideas, user journeys | `classified/product-ideas/` or product docs |
| Business model | Pricing, offers, funnels, revenue strategy, Stripe plans | `classified/business-model/` |
| Spiritual research | Doctrine, sermons, Mazzaroth, scripture, theology, research threads | `classified/spiritual-research/` |
| Books | Manuscripts, outlines, chapter ideas, publishing plans | `classified/books/` |
| Music | Albums, lyrics, promo, release strategy, art direction | `classified/music/` |
| Game / OS systems | ARCHAIOS OS, game mechanics, simulation systems, local apps | `classified/game-os-systems/` |
| Crypto systems | Tokens, crypto app ideas, on-chain systems, financial mechanisms | `classified/crypto-systems/` |
| Raw conversations | Full raw conversation exports and unmapped threads | `classified/raw-conversations/` |
| App feature docs | Material that should become issues, specs, pages, routes, APIs | `classified/app-features/` |

### Phase 3: Extract Decisions

Create reviewed docs from the highest-value classified material:

- `docs/PRODUCT_REQUIREMENTS_FROM_EXPORT.md`
- `docs/ARCHAIOS_LEGACY_ARCHITECTURE_FROM_EXPORT.md`
- `docs/PROMPT_REGISTRY_FROM_EXPORT.md`
- `docs/REVENUE_NOTES_FROM_EXPORT.md`
- `docs/CONTENT_SOURCE_MAP_FROM_EXPORT.md`
- `docs/APP_FEATURE_BACKLOG_FROM_EXPORT.md`

### Phase 4: Route Into Systems

Route extracted material into the right active repo:

| Material | Primary Destination |
|---|---|
| Customer-facing feature ideas | `ai-assassins-client` docs/backlog |
| Worker/API/intelligence pipeline ideas | `Ai-Assassins` migration notes or current Worker plan |
| Public brand/landing copy | `saintblack-ai.github.io` launcher plan or `ai-assassins-client/landing` |
| Operator workflows | `Archaios OS` or `ai-assassins-client/operator` |
| Local worker ideas | `openclaw-work` |

### Phase 5: Build Only After Review

- Turn extracted feature docs into small implementation tickets.
- Keep raw export untouched.
- Do not auto-merge large generated content into product code.
- Use source links and manifest IDs so decisions remain traceable.

## Folder Structure To Add After Export Arrives

These folders should be created when real content exists:

```text
ARCHAIOS_INFRASTRUCTURE/classified/product-ideas/
ARCHAIOS_INFRASTRUCTURE/classified/business-model/
ARCHAIOS_INFRASTRUCTURE/classified/spiritual-research/
ARCHAIOS_INFRASTRUCTURE/classified/books/
ARCHAIOS_INFRASTRUCTURE/classified/music/
ARCHAIOS_INFRASTRUCTURE/classified/game-os-systems/
ARCHAIOS_INFRASTRUCTURE/classified/crypto-systems/
ARCHAIOS_INFRASTRUCTURE/classified/raw-conversations/
ARCHAIOS_INFRASTRUCTURE/classified/app-features/
```

## Safety Rules

- Do not delete raw exports.
- Do not overwrite source exports.
- Do not upload export content to external systems without explicit approval.
- Do not expose private content on public GitHub Pages.
- Do not paste secrets into docs.
- Label uncertain classifications as tentative.

## Moment Export Arrives

- Put it in `ARCHAIOS_INFRASTRUCTURE/inbox/`.
- Run `npm run archaios:intake`.
- Review the two markdown reports.
- Ask for a consolidation pass only after the inventory looks correct.

