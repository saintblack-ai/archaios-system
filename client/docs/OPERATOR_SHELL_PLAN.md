# Operator Shell Plan

Generated: 2026-04-17

## Objective

Make `/operator` feel like a working ARCHAIOS system shell before live service credentials and the ChatGPT export are available.

## Implemented

- Shared command navigation added.
- Central `/links` launcher added for public/member/operator surfaces.
- Operator shell now links to Landing, Pricing, Dashboard, Mock Dashboard, and Book Growth.
- Operator seed data now includes:
  - Export intake readiness.
  - Mock data mode status.
  - Existing repo/deploy/content/roadmap/blocked panels.

## Operator Panels

| Panel | Purpose |
|---|---|
| Repository Health | Shows role and risk for each major repo. |
| Deployment Health | Tracks frontend, Worker, public marketing, and operator-plane readiness. |
| Pipeline Status | Shows source ingestion, brief generation, approval, and delivery state. |
| Export Intake Readiness | Shows inbox, scanner, taxonomy, and consolidation readiness. |
| Mock Data Mode | Shows how dashboard QA works without live credentials. |
| Pending Tasks | Lists production preparation tasks. |
| Roadmap Board | Tracks phase-level readiness. |
| Awaiting Authorization | Lists actions blocked by explicit approval boundaries. |

## Next Operator Improvements

- Add read-only live worker health fetch.
- Add local `export-inventory.json` summary after the export arrives.
- Add Stripe/Supabase status only after credentials are available.
- Add GitHub workflow status only after GitHub auth is available.

## Safety

The operator shell remains read-only. It does not deploy, change DNS, mutate billing, or connect external automation.
