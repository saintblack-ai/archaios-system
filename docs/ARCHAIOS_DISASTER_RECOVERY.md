# Archaios Disaster Recovery

**Rule zero:** preserve evidence, protect secrets, identify the exact failed surface, and make one reversible recovery step at a time.

## Incident Record

Before recovery, record: UTC timestamp, operator, affected URL/account, exact error, last known good commit/deployment, screenshots or logs, and whether customer data or payments are affected.

## GitHub Recovery

**Failure signals:** repository inaccessible, Actions failing, Pages artifact missing, branch history changed unexpectedly.

1. Preserve the local workspace and run `git status`; do not reset or overwrite uncommitted material.
2. Confirm remote: `https://github.com/saintblack-ai/archaios-system.git`.
3. Restore from a clean clone, Git mirror, or `git bundle`; verify commit signatures and the expected default branch.
4. Restore repository settings, GitHub Pages workflow, Actions variables, and secrets from the secured inventory.
5. Run the Vite build and publish only after an independent reviewer confirms the restored commit.

## Vercel Recovery

**Failure signals:** routes return `500`, deployment not `READY`, environment missing, or alias points at an unintended build.

1. Inspect `archaios-core` deployment and runtime logs before redeploying.
2. Restore the required Production variables from the approved vault using `ARCHAIOS_PRODUCTION_RECOVERY_PLAN.md`; never recreate or guess values.
3. Redeploy the known-good commit to Production.
4. Test `/`, `/login`, `/pricing`, signed-out `/dashboard`, and signed-in `/dashboard`.
5. Roll back only to a previously verified deployment and record the deployment ID.

## Supabase Recovery

**Failure signals:** project DNS/auth health fails, login fails, Worker reports Supabase errors, or subscription writes fail.

1. Confirm the project reference from the approved environment inventory: `pedymtymubpirhaikymj` is the configured reference, but availability remains unverified.
2. In the Supabase dashboard, determine whether the project is paused, deleted, inaccessible, or misconfigured. Do not replace it before a data-recovery decision.
3. If accessible, export schema, database, storage, auth metadata permitted by policy, and migration history.
4. If replacement is approved, apply only the sequence in `docs/ARCHAIOS_MIGRATION_MANIFEST.md`, including the subscription upsert contract.
5. Reconfigure Vercel, GitHub Pages, and Cloudflare through their separate secret stores; redeploy one surface at a time and verify authentication before checkout.

## Cloudflare Recovery

**Failure signals:** Worker health fails, the health service name is wrong, routes are missing, or checkout/webhooks fail.

1. Compare `/api/health` with `worker.js` and `wrangler.toml`. Current evidence shows the live URL returns `archaios-daily-automation`, not `archaios-saas-worker`.
2. Inspect the Cloudflare Worker dashboard for script name, deployment history, route, cron schedule, and secret bindings.
3. Restore required secrets from the vault: Supabase URL/service role, Stripe secret/webhook secret, OpenAI key, and internal auth token as applicable.
4. Deploy the repository-root Worker only after verifying `wrangler.toml` and use `npx wrangler deploy --name archaios-saas-worker`.
5. Verify the exact health identity and release before testing any protected API or Stripe path.

## Stripe Recovery

**Failure signals:** checkout failure, webhook signature failure, invalid price ID, subscription state drift, or dispute.

1. Determine test or live mode before any action; do not cross modes by assumption.
2. Preserve Stripe event IDs, request IDs, customer IDs, subscription IDs, and webhook logs in the incident record.
3. Confirm the intended endpoint is the currently deployed correct Worker, not merely a reachable URL.
4. Restore Stripe secret, webhook secret, and Pro/Elite price IDs only from the secured inventory; then redeploy the affected service.
5. Run one controlled test checkout, confirm webhook delivery, and reconcile the resulting subscription with Supabase before resuming traffic.

## Notion Recovery

**Failure signals:** workspace inaccessible, pages deleted, permissions lost, or records only exist in Notion.

1. Use the latest Markdown/PDF export and attachment manifest from the backup archive.
2. Recreate only the operating databases required for decisions, tasks, customer records, research index, and recovery log.
3. Import the exported material, verify page counts and attachments against checksums, then restore sharing from the access inventory.
4. Re-link source documents only after the Git and Black Vault copies are confirmed. Notion is an index and collaboration surface, not the only archival copy.

## Recovery Completion Criteria

- A named owner signs off on the incident record.
- A clean user journey passes from public route to authentication to authorized dashboard.
- Worker identity, deployment ID, and environment configuration match the intended source.
- Stripe and subscription state are reconciled before accepting paid traffic.
- The recovery decision and changed configuration locations are recorded in Notion and the Black Vault log.
