# Disaster Recovery Playbook

**Audience:** Founder, engineering operator, incident responder  
**Related:** [Security Operations Manual](SECURITY_OPERATIONS_MANUAL.md), [Architecture Guide](ARCHITECTURE_GUIDE.md), [Admin Operations Guide](ADMIN_OPERATIONS_GUIDE.md)

## Executive Summary

Disaster recovery for ARCHAIOS is based on controlled diagnosis, single-platform changes, rollback discipline, and evidence preservation. Do not rush. Capture facts first.

## Incident First Response

1. Stop deploys and feature work.
2. Record timestamp.
3. Record current `git status --short`.
4. Record affected system.
5. Capture exact error.
6. Identify last known good state.
7. Execute the smallest safe recovery action.
8. Document outcome.

## Recovery Matrix

| Failure | Likely System | First Action |
| --- | --- | --- |
| Health endpoint down | Cloudflare | Check Worker deployment history |
| Wrong service identity | Cloudflare | Redeploy canonical Worker after approval |
| Login failure | Supabase | Check Auth health and env vars |
| Checkout failure | Stripe / Worker | Check `/api/pricing`, checkout logs |
| Webhook failure | Stripe / Supabase | Verify signing secret and replay event |
| Dashboard data missing | Supabase / Worker | Check service-role and table health |
| CI failure | GitHub | Review workflow logs |

## Cloudflare Recovery

```bash
npx wrangler deployments list --name archaios-saas-worker
npx wrangler rollback --name archaios-saas-worker
curl -fsS https://archaios-saas-worker.quandrix357.workers.dev/api/health
```

Required health identity:

```json
{
  "service": "archaios-saas-worker"
}
```

## Supabase Recovery

- Confirm project ref.
- Confirm DNS resolves.
- Confirm Auth health.
- Confirm service-role key is configured only on backend.
- Confirm migrations.
- Restore from backup only after founder approval.

## Stripe Recovery

- Do not delete products or prices.
- Disable incorrect prices if needed.
- Verify webhook endpoint.
- Verify webhook signing secret.
- Replay failed events after backend recovery.
- Reconcile subscriptions with Supabase.

## Git Recovery

- Do not use destructive reset unless explicitly approved.
- Inspect staged and unstaged changes.
- Preserve handoff files.
- Commit only after founder approval.

## Recovery Exit Criteria

- [ ] Affected system is healthy
- [ ] Readiness check rerun
- [ ] Commander brief updated
- [ ] Black Vault incident note created
- [ ] Rollback path still available
