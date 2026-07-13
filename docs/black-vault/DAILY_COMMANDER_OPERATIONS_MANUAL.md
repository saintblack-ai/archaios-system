# Daily Commander Operations Manual

**Audience:** Founder, operator, executive assistant  
**Related:** [Founder Handbook](FOUNDER_HANDBOOK.md), [Admin Operations Guide](ADMIN_OPERATIONS_GUIDE.md), [Security Operations Manual](SECURITY_OPERATIONS_MANUAL.md)

## Executive Summary

Commander is the daily executive officer for ARCHAIOS. Commander turns platform signals into one operational brief: readiness, revenue, infrastructure, risks, and next actions.

## Daily Commander Brief

| Section | Question Commander Answers |
| --- | --- |
| Situation | What changed since last brief? |
| Readiness | Is production GO or NO-GO? |
| Revenue | Are subscriptions and checkout healthy? |
| Infrastructure | Are Cloudflare, Supabase, Stripe, and GitHub healthy? |
| Security | Are there actionable findings? |
| Mission Queue | What unfinished work matters most? |
| Founder Focus | What is the one move today? |

## Morning Procedure

1. Review latest session handoff.
2. Check `git status --short`.
3. Review readiness report.
4. Check public backend health.
5. Review Supabase status.
6. Review Stripe dashboard or controlled metrics endpoint.
7. Review GitHub Actions.
8. Review Sentinel findings.
9. Produce one executive brief.

## Commander Status Levels

| Status | Meaning | Action |
| --- | --- | --- |
| Green | Ready for normal execution | Continue planned mission |
| Amber | Action needed, no immediate production stop | Assign owner and due date |
| Red | Production blocker or security risk | Stop expansion and resolve |
| Black | Incident or data/security exposure | Enter incident response |

## Brief Template

```markdown
# Commander Executive Brief

Date:
Readiness:
Recommendation:

## Situation

## System Status

| System | Status | Evidence | Action |
| --- | --- | --- | --- |

## Top Actions

1.
2.
3.
```

## Evening Procedure

- [ ] Record accomplishments
- [ ] Record blockers
- [ ] Record readiness score
- [ ] Record uncommitted/staged files
- [ ] Record next mission
- [ ] Protect creative work block if planned

## Escalation Rules

- Cloudflare identity mismatch: escalate immediately.
- Supabase DNS/Auth failure: escalate before any billing test.
- Stripe webhook failure: pause billing launch.
- Secret exposure: enter [Security Operations Manual](SECURITY_OPERATIONS_MANUAL.md).
- Interrupted session: use [Disaster Recovery Playbook](DISASTER_RECOVERY_PLAYBOOK.md).
