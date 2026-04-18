# Product Architecture

## Final Platform Structure

```text
Marketing Layer
  -> landing page
  -> sample intelligence
  -> pricing page
  -> email capture
  -> checkout CTA

Authenticated Intelligence Layer
  -> Supabase auth
  -> subscription state
  -> daily briefing dashboard
  -> alerts/signals
  -> saved history
  -> Pro/Elite gated tools

Backend Intelligence Layer
  -> Cloudflare Worker APIs
  -> daily briefing generation
  -> content/source ingestion
  -> tier enforcement
  -> Stripe checkout/webhook
  -> Supabase writes

Operator Layer
  -> repo health
  -> deploy health
  -> subscription metrics
  -> content pipeline status
  -> error/task/roadmap board
```

## Platform Modules

- Public marketing website.
- Pricing and plan comparison.
- Authentication and account panel.
- Subscription and billing panel.
- Daily global intelligence briefing.
- Alert feed and alert history.
- Revenue dashboard.
- Book Growth Command.
- Architect Mode.
- Operator Mode.

## Daily Briefing Pipeline

```text
Source adapters
  -> normalized signal objects
  -> daily briefing generator
  -> tier filter
  -> approval/publish step
  -> dashboard delivery
  -> email delivery later
  -> history archive
```

## Subscription Gating

```text
Supabase session -> /api/subscription -> normalized plan -> UI locks -> Worker route authorization
```

## Admin / Operator Principle

The operator dashboard should be read-first and approval-first. It can show health, tasks, errors, and roadmap state without mutating live systems until explicit approval is given.

