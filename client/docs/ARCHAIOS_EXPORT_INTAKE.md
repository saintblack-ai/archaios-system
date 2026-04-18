# ARCHAIOS Export Intake Plan

Generated: 2026-04-16

## Current State

The OpenAI / ChatGPT legacy export has not arrived yet. The local ARCHAIOS intake infrastructure is now prepared so the export can be dropped into the iCloud-backed project workspace and scanned safely.

## Drop Zone

Place the export contents here:

```text
ARCHAIOS_INFRASTRUCTURE/inbox/
```

Recommended layout after extraction:

```text
ARCHAIOS_INFRASTRUCTURE/inbox/
  conversations.json
  chat.html
  assets/
  ...
```

If OpenAI gives you a zip file, place it in `inbox/` first. The scanner will detect it and report that it needs extraction. It will not extract automatically.

## Scanner Command

Default scan:

```bash
npm run archaios:intake
```

Scan a specific folder:

```bash
node scripts/archaios-export-intake.mjs "/path/to/export/folder"
```

## What The Scanner Produces

- `ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json`
- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md`
- `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md`

## Classification Buckets

- Product vision
- Architecture
- Prompts
- Pricing / business model
- Content / intelligence sources
- Brand assets
- Unfinished build instructions
- Unknown / review

## Safety Rules

- Source export files are never moved, deleted, or overwritten.
- No external API calls are made.
- No secrets are requested.
- No deployment or live service action is taken.
- All conclusions are labeled as local-file evidence only.

## After The First Scan

Review these first:

1. `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md`
2. `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md`
3. `ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json`

Then the next build step should be a reviewed consolidation pass:

- Extract product requirements into `docs/PRODUCT_REQUIREMENTS_FROM_EXPORT.md`.
- Extract architecture references into `docs/ARCHAIOS_LEGACY_ARCHITECTURE_FROM_EXPORT.md`.
- Extract prompts into a controlled prompt registry.
- Extract monetization notes into the revenue architecture.
- Map any new repo/build instructions into `docs/FEATURE_GAP_ANALYSIS.md`.

