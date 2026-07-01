# Archaios Executive Dashboard

**As of 2026-06-20:** command view for Saint Black. Verify each status before acting; this dashboard records current evidence, not assumed health.

| Domain | Current Status | Immediate Command |
| --- | --- | --- |
| Infrastructure | **At risk** | Reconcile source, deployment targets, and the wrong live Worker identity. |
| Production | **Blocked** | Set Vercel Supabase variables, redeploy, and remove dashboard `500`. |
| Revenue | **Blocked** | Verify Stripe product/price/webhook inventory and end-to-end test checkout only after Worker and Supabase recover. |
| Research | **Partial** | Keep source-backed research in the Black Vault; export Notion indexes regularly. |
| Legacy | **Partial** | Create verified independent encrypted and offline archive copies; assemble successor package. |
| Risk | **High** | Supabase reachability, Worker mismatch, dirty worktree, and unverified payment data are active risks. |
| Operations | **Unstandardized** | Execute the daily/weekly/monthly routines in `ARCHAIOS_OPERATOR_MANUAL.md`. |

## Verified Service Signals

| Surface | Signal |
| --- | --- |
| GitHub | Repository is reachable; no open PRs or issues were returned by the connected search; local workspace has extensive uncommitted and untracked material. |
| Vercel | `archaios-core` has one `READY` production deployment, but `/dashboard` is `500`; missing Supabase variables are confirmed. |
| Supabase | The configured host is `pedymtymubpirhaikymj.supabase.co`; independent health/DNS check was unresolved. |
| Cloudflare | Workers.dev `/api/health` is `200` but reports `archaios-daily-automation`, not the intended SaaS Worker. |
| Stripe | QX Technology account connection works; product/price/subscription/dispute inventory was not retrievable through the available connector. |
| Notion | Used as second brain, but no API integration or backup evidence was found in the repository. |

## Today

1. Restore Vercel Supabase environment configuration and verify `/dashboard` no longer returns `500`.
2. Restore the correct Cloudflare Worker deployment and prove its identity through `/api/health`.
3. Determine Supabase project state in the Supabase dashboard before modifying migrations, secrets, or customer flows.

## Guardrails

- No paid traffic before Stripe, Worker, Supabase, and subscription reconciliation pass together.
- No data cleanup until independent Black Vault backups and Git preservation are verified.
- No feature work until the two production identity failures are resolved.
