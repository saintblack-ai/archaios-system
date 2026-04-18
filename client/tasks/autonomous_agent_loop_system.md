# Autonomous Agent Loop System

## Purpose

Provide a repeatable local loop for ARCHAIOS infrastructure validation and system-file regeneration.

## Command Surface

- `npm run loop:once` - runs one full cycle.
- `npm run loop:start` - runs continuous cycles using `LOOP_INTERVAL_SECONDS`.
- `npm run loop:status` - prints last recorded loop snapshot.

## Loop Cycle Actions

1. Validate infrastructure:
   - Vercel primary routes.
   - GitHub Pages backup routes.
   - Cloudflare Worker health endpoint.
2. Validate monetization readiness:
   - Subscription tier tests.
   - Frontend build health.
   - Stripe wrapper presence.
3. Regenerate:
   - `system_status.md`
   - `agent_roles.md`
   - `next_actions.md`
4. Persist loop status:
   - `logs/autonomous-agent-loop.log`
   - `logs/autonomous-agent-loop-last.json`

## Safety Constraints

- No deployment commands.
- No DNS changes.
- No secret writes.
- No billing activation.
