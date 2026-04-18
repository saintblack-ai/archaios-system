# Marketing Agent Workspace

This folder is the control boundary for Saint Black book marketing and promotion work.

The Marketing agent owns book campaigns, content pipelines, social post queues, copy generation, marketing analytics, promotional recommendations, email/community drafts, and Book Growth OS materials. It does not modify infrastructure, deployment, routing, billing, auth, worker health, DNS, or app deployment systems.

Operational source files remain in their existing locations so live imports, routes, and workflows do not break. This folder tags and indexes the marketing mission.

## Allowed Work

- Generate book campaign ideas and content packs.
- Maintain Book Growth OS agents and marketing dashboards.
- Maintain social post queue logic in approval-first mode.
- Create mock posting logs and content calendars.
- Improve content quality, audience hooks, metadata recommendations, and campaign performance analysis.

## Not Allowed

- Do not modify deployment, DNS, GitHub Actions, Vercel, Cloudflare, Supabase auth, or Stripe billing infrastructure.
- Do not change infrastructure routes or dashboard shell code unless explicitly approved.
- Do not auto-post externally without explicit enablement and platform credentials.
- Do not hardcode API keys or bypass rate limits.

## Primary Files

- `agents/marketing/OUTPUT_MANIFEST.md`
- `docs/MARKETING_SCOPE.md`
- `docs/AGENT_SEPARATION_MAP.md`
