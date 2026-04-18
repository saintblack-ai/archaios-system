# Export Intake Hardening Report

Generated: 2026-04-17

## Objective

Make the export intake pipeline ready before the OpenAI / ChatGPT export arrives.

## Implemented

- Intake folder exists at `ARCHAIOS_INFRASTRUCTURE/inbox/`.
- Scanner exists at `scripts/archaios-export-intake.mjs`.
- Scanner command exists:

```bash
npm run archaios:intake
```

- Scanner remains read-only against source files.
- Scanner ignores `.gitkeep` placeholders.
- Scanner produces:
  - `ARCHAIOS_INFRASTRUCTURE/manifests/export-inventory.json`
  - `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_INTAKE_REPORT.md`
  - `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CLASSIFICATION_SUMMARY.md`
  - `ARCHAIOS_INFRASTRUCTURE/reports/EXPORT_CONSOLIDATION_QUEUE.md`

## Expanded Taxonomy

The scanner now reports these categories:

- Prompts
- Product ideas
- Business model
- Spiritual research
- Books
- Music
- Game / OS systems
- Crypto systems
- Raw conversations
- Docs to convert into app features
- Brand assets
- Unknown / review

## Current Validation

`npm run archaios:intake` passed with an empty inbox and produced clean zero-file reports plus a consolidation queue.

## Export Arrival Flow

1. Put export zip or extracted folder into `ARCHAIOS_INFRASTRUCTURE/inbox/`.
2. If zip, extract into a named folder.
3. Run `npm run archaios:intake`.
4. Review generated reports.
5. Run a consolidation pass into product requirements, prompt registry, revenue notes, architecture notes, and feature backlog.

## Safety

- No upload.
- No external API calls.
- No source deletion.
- No source move.
- No auto-publishing of private material.
