# Admin Operations Guide

**Audience:** Founder, admin operator, support lead  
**Related:** [Security Operations Manual](SECURITY_OPERATIONS_MANUAL.md), [Daily Commander Operations Manual](DAILY_COMMANDER_OPERATIONS_MANUAL.md), [Disaster Recovery Playbook](DISASTER_RECOVERY_PLAYBOOK.md)

## Executive Summary

Admin operations keep ARCHAIOS usable, secure, and accountable. Admins should make small verified changes, document every production decision, and avoid changing multiple platforms at once.

## Admin Responsibilities

| Area | Responsibility |
| --- | --- |
| GitHub | Review status, workflows, branches, release notes |
| Cloudflare | Worker health, routes, secrets, deploy history |
| Supabase | Auth, database, RLS, migrations, storage |
| Stripe | Products, prices, subscriptions, webhooks |
| Vercel / Pages | Frontend deployments and env vars |
| Black Vault | Documentation and decision preservation |

## Daily Admin Checklist

- [ ] Check `git status --short`
- [ ] Review staged/uncommitted files
- [ ] Check backend health identity
- [ ] Review GitHub Actions
- [ ] Review Sentinel findings
- [ ] Review customer support queue
- [ ] Capture end-of-day handoff if work remains open

## Change Control

| Change Type | Approval |
| --- | --- |
| Documentation update | Operator discretion |
| Generated readiness report | Operator discretion |
| Dependency update | Founder approval if production package |
| Cloudflare deploy | Founder approval |
| Supabase migration | Founder approval |
| Stripe live change | Founder approval |
| Secret rotation | Founder approval unless incident |

## Admin Troubleshooting

| Problem | First Check | Reference |
| --- | --- | --- |
| Backend wrong identity | `/api/health` | [Disaster Recovery Playbook](DISASTER_RECOVERY_PLAYBOOK.md) |
| Login failure | Supabase Auth health | [Security Operations Manual](SECURITY_OPERATIONS_MANUAL.md) |
| Checkout failure | Stripe logs and Worker logs | [Customer Onboarding Guide](CUSTOMER_ONBOARDING_GUIDE.md) |
| Failed deploy | GitHub Actions and platform logs | [Architecture Guide](ARCHITECTURE_GUIDE.md) |

## Documentation Rule

Every important admin action should leave a trail:

- What changed
- Who approved it
- When it happened
- What evidence proved success
- How to roll back
