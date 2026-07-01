# Archaios Master Migration Manifest

Status: safe-prep only
Last updated: 2026-06-18

Compliance note: Do not transact or collect regulated data until licensed.

## Purpose

This manifest defines the controlled Supabase replacement schema order for Archaios and AI Assassins. It prioritizes the production runtime path over legacy/experimental migrations.

## Required Runtime Tables

Mandatory:

- `auth.users`
- `public.profiles`
- `public.subscriptions`
- `public.leads`
- `public.alerts`
- `public.cta_events`
- `public.revenue_events`

Operational support:

- `public.cron_job_runs`
- `public.dashboard_signal_runs`
- `public.activity_feed_runs`
- `public.metrics_snapshots`

Archaios command center:

- `public.archaios_command_entries`
- `public.archaios_division_snapshots`
- `public.archaios_archive_assets`
- `public.archaios_projects`
- `public.archaios_agent_runs`

Optional legacy/agent expansion:

- `public.briefs`
- `public.agent_logs`
- `public.agents`
- `public.agent_runs`
- `public.agent_jobs`
- `public.agent_outputs`
- `public.intelligence_reports`
- `public.content_drafts`
- `public.marketing_queue`
- `public.revenue_summary`

## Minimum Production Migration Order

### 1. Core Runtime Tables

File: `client/supabase/sql/2026-04-14_production_core_tables.sql`

Creates:

- `public.profiles`
- `public.subscriptions`
- `public.alerts`
- `public.leads`
- `public.cta_events`
- `public.revenue_events`

Auth dependencies:

- References `auth.users`.
- Creates `public.handle_auth_user_created()`.
- Creates trigger `on_auth_user_created` on `auth.users`.

Security:

- Enables RLS on all core tables.
- Adds authenticated select policies for profiles, subscriptions, and alerts.
- Adds authenticated delete policy for alerts.

Adaptation flags:

- If Supabase auth schema changes, review trigger and `auth.users` references.
- If subscription tiers change, update `tier` check constraints.
- If lead capture is paused, table can exist but write tests must stay stubbed.

### 2. Profile Tier Alignment

File: `client/supabase/sql/2026-04-25_profiles_tier_alignment.sql`

Alters:

- `public.profiles`

Purpose:

- Adds/aligns `profiles.tier`.
- Syncs profile tier from active subscriptions.

Adaptation flags:

- Must run after `public.profiles` and `public.subscriptions` exist.
- Update allowed tiers if pricing changes.

### 3. Worker Cron Tables

File: `client/supabase/sql/2026-03-31_backend_cron_tables.sql`

Creates:

- `public.cron_job_runs`
- `public.dashboard_signal_runs`
- `public.activity_feed_runs`
- `public.metrics_snapshots`

Purpose:

- Stores Worker cron telemetry and dashboard signal history.

Adaptation flags:

- Keep table names aligned with `client/wrangler.jsonc` Worker vars.

### 4. Production Scheduled Jobs

File: `client/supabase/sql/2026-03-30_production_scheduled_jobs.sql`

Creates:

- `ops.analytics_daily_rollups`

Purpose:

- Adds analytics rollup functions for leads, CTA clicks, alerts, and active subscriptions.

Adaptation flags:

- This migration expects supporting tables such as `public.leads`, `public.cta_events`, `public.alerts`, and `public.subscriptions`.
- Review hardcoded placeholder URLs or service-role placeholders before enabling scheduled invocations.

Rollback:

- `client/supabase/sql/2026-03-30_production_scheduled_jobs_rollback.sql`

### 5. Archaios Command Center

File: `client/supabase/sql/2026-06-17_archaios_command_center_v1.sql`

Creates:

- `public.archaios_command_entries`
- `public.archaios_division_snapshots`
- `public.archaios_archive_assets`
- `public.archaios_projects`
- `public.archaios_agent_runs`

Auth dependencies:

- `owner_id` references `auth.users` in command entries and division snapshots.

Security:

- Enables RLS.
- Authenticated users can read command/dashboard rows, with sensitivity filtering for archive assets.

Adaptation flags:

- If archive sensitivity policy changes, review `archaios_archive_assets` RLS.
- If anonymous dashboard access is required, policies must be intentionally changed.

## Optional Legacy/Expansion Migrations

Apply only after minimum production smoke tests pass.

Conflict rule: migrations that create or alter the same production tables as the minimum set must be treated as adapt-only. Do not apply them directly to the replacement project unless an operator has reviewed the generated SQL diff and confirmed it is additive, non-destructive, and compatible with the current Worker code.

| File | Purpose | Adaptation Risk |
| --- | --- | --- |
| `sql/20260305_archaios_saas_foundation.sql` | Earlier SaaS foundation for profiles, subscriptions, briefs, agent logs | CONFLICT: overlaps with production `profiles`, `subscriptions`, `agent_logs`; adapt only. |
| `archaios-agents/sql/002_archaios_revenue_protocol.sql` | Agent revenue protocol tables and owner policies | CONFLICT: overlaps with `profiles`, `subscriptions`, `briefs`, `agent_logs`, `revenue_events`; adapt only. |
| `sql/20260306_archaios_agent_orchestrator.sql` | Metrics, next actions, app events | Requires prior agent logs/briefs assumptions. |
| `sql/20260306_archaios_phase2_agents.sql` | Agents and agent runs | CONFLICT RISK: overlaps with later agent orchestrator foundation; choose one agent schema path. |
| `sql/20260306_archaios_phase3_autonomous_network.sql` | Agents, agent runs, agent logs | CONFLICT: overlaps with phase2 and foundation; adapt only if using legacy autonomous network. |
| `sql/20260306_archaios_phase3_marketing.sql` | Marketing calendar, drafts, leads | CONFLICT: overlaps with production `public.leads`; adapt only. |
| `sql/20260306_archaios_multi_agent_system.sql` | Intelligence reports, content drafts, marketing queue, sales content | Agent expansion only. |
| `sql/20260306_archaios_autonomous_agents.sql` | Intelligence briefs, content drafts, marketing schedule, sales content | Agent expansion only. |
| `sql/20260306_archaios_self_improving_agents.sql` | Intelligence reports, performance metrics, marketing queue | Depends on content drafts from earlier migration. |
| `sql/20260312_archaios_revenue_signals.sql` | Revenue summary and revenue event hardening | Run after `public.revenue_events`. |
| `sql/20260320_archaios_stripe_webhook_hardening.sql` | Adds Stripe event uniqueness/indexes | Run after revenue events and revenue summary if used. |
| `sql/20260320_archaios_agent_orchestrator_foundation.sql` | Agents, jobs, outputs | Preferred over older agent phase files if rebuilding agents. |
| `sql/20260320_archaios_agent_orchestrator_seed_10_jobs.sql` | Seeds agent jobs | Requires agent jobs table. |
| `sql/20260324_archaios_alerts.sql` | Earlier alerts table | CONFLICT: overlaps with production `public.alerts`; do not apply directly. |
| `sql/20260324_archaios_alerts_auth_billing.sql` | Adds user_id and billing-aware alert policies | Adapt only if production alerts schema lacks equivalent. |
| `sql/20260327_archaios_platform_core.sql` | Platform core leads/profiles/subscription updates | CONFLICT: overlaps with production core; adapt only. |
| `sql/20260328_archaios_growth_events.sql` | CTA events | CONFLICT: overlaps with production `public.cta_events`; do not apply directly. |
| `sql/20260328_archaios_pricing_tiers.sql` | Tier constraints for profiles/subscriptions | Adapt only if constraints differ from production core and tier alignment. |
| `sql/patch_agent_logs_if_missing.sql` | Safety patch for agent logs | Use only if agent logs missing. |
| `sql/phase_a_build_progress.sql` | Build progress tracking | Safe optional table. |

## Known Conflict Groups

Profiles and subscriptions:

- Minimum production source: `client/supabase/sql/2026-04-14_production_core_tables.sql`
- Adapt-only overlaps:
  - `sql/20260305_archaios_saas_foundation.sql`
  - `archaios-agents/sql/002_archaios_revenue_protocol.sql`
  - `sql/20260327_archaios_platform_core.sql`
  - `sql/20260328_archaios_pricing_tiers.sql`

Leads and CTA events:

- Minimum production source: `client/supabase/sql/2026-04-14_production_core_tables.sql`
- Adapt-only overlaps:
  - `sql/20260306_archaios_phase3_marketing.sql`
  - `sql/20260327_archaios_platform_core.sql`
  - `sql/20260328_archaios_growth_events.sql`

Alerts:

- Minimum production source: `client/supabase/sql/2026-04-14_production_core_tables.sql`
- Adapt-only overlaps:
  - `sql/20260324_archaios_alerts.sql`
  - `sql/20260324_archaios_alerts_auth_billing.sql`

Agent tables:

- Preferred future source: `sql/20260320_archaios_agent_orchestrator_foundation.sql`
- Conflicting legacy sources:
  - `sql/20260306_archaios_phase2_agents.sql`
  - `sql/20260306_archaios_phase3_autonomous_network.sql`
  - `patch_agent_logs_if_missing.sql`

Revenue telemetry:

- Minimum production source: `client/supabase/sql/2026-04-14_production_core_tables.sql`
- Additive candidates:
  - `sql/20260312_archaios_revenue_signals.sql`
  - `sql/20260320_archaios_stripe_webhook_hardening.sql`

Review these for idempotency and indexes before applying.

## Schema Change Adaptation Flags

Must review if any of these change:

- Tier names or pricing plans.
- Stripe subscription object metadata shape.
- Supabase auth trigger behavior.
- Lead capture consent/licensing rules.
- Dashboard access policy: free vs pro vs elite.
- Archive asset sensitivity model.
- Worker table-name vars in `client/wrangler.jsonc`.
- Revenue event idempotency requirements.

## Readiness Checklist

- [ ] Minimum migration order approved.
- [ ] Optional migrations classified as defer/apply/adapt.
- [ ] Conflict groups reviewed and assigned to a single source of truth.
- [ ] `auth.users` trigger reviewed.
- [ ] `profiles.tier` and `subscriptions.tier` constraints match product plan.
- [ ] `subscriptions` includes Stripe customer/subscription IDs.
- [ ] `leads` exists but real writes are blocked until licensing approval.
- [ ] `alerts` supports per-user paid dashboard history.
- [ ] `cta_events` supports non-regulated click tracking.
- [ ] `revenue_events` exists for webhook/revenue telemetry.
- [ ] RLS policies reviewed.
- [ ] Service-role-only writes remain server-side.
