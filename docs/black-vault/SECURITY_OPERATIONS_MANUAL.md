# Security Operations Manual

**Audience:** Founder, security operator, engineering lead  
**Related:** [Architecture Guide](ARCHITECTURE_GUIDE.md), [Admin Operations Guide](ADMIN_OPERATIONS_GUIDE.md), [Disaster Recovery Playbook](DISASTER_RECOVERY_PLAYBOOK.md)

## Executive Summary

ARCHAIOS security is built around least privilege, secret isolation, verified identity, signed billing events, auditability, and controlled deployment. The security goal is not perfect complexity; it is disciplined operation.

## Security Controls

| Control | Purpose |
| --- | --- |
| Supabase Auth | User identity |
| Bearer token checks | Backend route protection |
| Supabase RLS | Data isolation |
| Cloudflare secrets | Backend credential storage |
| Stripe webhook signing | Billing event integrity |
| GitHub Actions | Controlled automation |
| Sentinel | Actionable security scanning |
| Manual approval gates | Prevent unsafe production actions |

## Secret Handling Rules

- Never print live secrets in chat, docs, terminal logs, or screenshots.
- Never commit `.env` files with live values.
- Use placeholders such as `<project-ref>` and `<scoped-production-token>`.
- Rotate secrets after suspected exposure.
- Prefer scoped tokens over account-wide tokens.
- Store recovery information outside public repos.

## Production Secret Inventory

| Secret | Runtime | Exposure Rule |
| --- | --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Never client-side |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Browser-safe but controlled |
| `STRIPE_SECRET_KEY` | Backend | Never client-side |
| `STRIPE_WEBHOOK_SECRET` | Backend | Never logged |
| `CLOUDFLARE_API_TOKEN` | Operator / CI | Scoped, rotated |
| `OPENAI_API_KEY` | Backend | Never client-side |

## Daily Security Checklist

- [ ] Review Sentinel actionable findings
- [ ] Review failed auth events if available
- [ ] Review failed Stripe webhooks
- [ ] Review GitHub Actions failures
- [ ] Confirm no new secret-bearing files
- [ ] Confirm production health identity

## Incident Severity

| Severity | Definition | Response |
| --- | --- | --- |
| Critical | Secret exposure, data exposure, live billing corruption | Stop work, rotate, preserve evidence |
| High | Auth bypass, webhook failure, production outage | Triage immediately |
| Medium | Dependency warning, missing scan, stale access | Schedule within 24 hours |
| Low | Documentation drift | Add to maintenance queue |

## Security Incident Procedure

1. Stop deployment and feature work.
2. Preserve logs, timestamps, and command history.
3. Identify exposed asset or failing control.
4. Rotate affected secrets.
5. Validate replacement secrets.
6. Audit access logs.
7. Document incident in Black Vault.
8. Resume only after Commander reports green or amber.

## Cross-References

- Recovery process: [Disaster Recovery Playbook](DISASTER_RECOVERY_PLAYBOOK.md)
- Admin procedures: [Admin Operations Guide](ADMIN_OPERATIONS_GUIDE.md)
- Architecture controls: [Architecture Guide](ARCHITECTURE_GUIDE.md)
