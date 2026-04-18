# ARCHAIOS Output Manifest

This manifest tags files that belong to the ARCHAIOS infrastructure mission. Files are intentionally left in their existing locations to avoid breaking live routes, imports, or workflows.

## Infrastructure Docs

- `docs/MASTER_SYSTEM_MAP.md`
- `docs/REPO_AUDIT.md`
- `docs/REPO_ROLES.md`
- `docs/FEATURE_GAP_ANALYSIS.md`
- `docs/REVENUE_ARCHITECTURE.md`
- `docs/INFRA_DISCOVERY.md`
- `docs/INFRA_STATUS.md`
- `docs/INFRA_WATCH_REPORT.md`
- `docs/DOMAIN_MAP.md`
- `docs/ENV_GAPS.md`
- `docs/BUILD_HEALTH.md`
- `docs/APP_URLS.md`
- `docs/DASHBOARD_LINKS.md`
- `docs/NAVIGATION_PLAN.md`
- `docs/ARCHAIOS_TIGHTENING_REPORT.md`
- `docs/PRE_EXPORT_BUILD_PLAN.md`
- `docs/MOCK_DATA_PLAN.md`
- `docs/OPERATOR_SHELL_PLAN.md`
- `docs/MOBILE_POLISH_REPORT.md`
- `docs/INTAKE_HARDENING_REPORT.md`
- `docs/ARCHAIOS_BUILD_LOG.md`
- `docs/REVENUE_IMPLEMENTATION_STATUS.md`

## Export Intake And Routing

- `ARCHAIOS_INFRASTRUCTURE/`
- `scripts/archaios-export-intake.mjs`
- `scripts/archaios-repo-audit.mjs`
- `docs/ARCHAIOS_EXPORT_INTAKE.md`
- `docs/EXPORT_INGESTION_PLAN.md`
- `docs/CONTENT_ROUTING_MAP.md`
- `docs/architecture/CHATGPT_EXPORT_CLASSIFICATION.md`

## Product, Billing, Deployment, And Architecture

- `docs/PRICING_AND_GATING_PLAN.md`
- `docs/STRIPE_SETUP.md`
- `docs/STRIPE_STATUS.md`
- `docs/BILLING_FLOW.md`
- `docs/DEPLOYMENT_PLAN.md`
- `docs/ENV_VARS_REQUIRED.md`
- `docs/GO_LIVE_CHECKLIST.md`
- `docs/architecture/PRODUCT_ARCHITECTURE.md`
- `docs/architecture/ROUTE_MAP.md`
- `docs/architecture/COMPONENT_INVENTORY.md`
- `docs/architecture/DATABASE_SCHEMA_PROPOSAL.md`

## Infrastructure UI And Runtime Code

- `src/components/CommandNav.jsx`
- `src/components/ProtectedContent.jsx`
- `src/components/operator/`
- `src/pages/Dashboard.jsx`
- `src/pages/operator/`
- `src/pages/revenue/`
- `src/lib/pricing.js`
- `src/lib/subscription.js`
- `src/lib/mockPlatform.js`
- `src/lib/platform.js`
- `worker/`
- `supabase/`
- `wrangler.jsonc`
- `vercel.json`
- `.github/workflows/`

## Shared Or Crossover Files

These files touch both infrastructure and business logic. ARCHAIOS can maintain their system-level structure, but should not write marketing copy inside them.

- `data/architect-mode.json`
- `data/operator/system-health.json`
- `docs/REVENUE_ARCHITECTURE.md`
- `docs/REVENUE_IMPLEMENTATION_STATUS.md`
