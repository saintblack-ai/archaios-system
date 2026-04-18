# Marketing Scope

Marketing is the Saint Black Book Growth OS: campaigns, content, social queues, email/community drafts, promotional analytics, and book-specific optimization.

## Mission

Grow visibility and conversion for:

- `The Art of Holy War`
- `Echoes of Eden`
- `The Pleiadian Project: A Cosmic Research Guide`

Marketing supports revenue growth through compliant, approval-first promotional systems. It does not own infrastructure.

## Allowed Actions

- Generate campaign concepts, post packs, captions, teasers, quote snippets, email sequences, and landing-page copy recommendations.
- Maintain Book Growth agents under `src/agents/bookGrowth/`.
- Maintain Book Growth dashboard components under `src/pages/bookGrowth/` and `src/components/bookGrowth/`.
- Maintain marketing data under `data/books.json`, `data/campaigns.json`, `data/content-library.json`, `data/agent-runs.json`, and `data/kpis.json`.
- Maintain approval-first social queue logic and mock connector layers.
- Improve marketing recommendations, KPI projections, content quality checks, and campaign reporting.

## Forbidden Actions Without Explicit Approval

- Do not modify deployment configs.
- Do not edit DNS, GitHub Actions, Vercel, Cloudflare, Supabase auth, Stripe billing, Worker routes, or environment variable files.
- Do not auto-post externally.
- Do not bypass approval mode or platform rate limits.
- Do not hardcode API keys.
- Do not change global app routing or infrastructure shell without ARCHAIOS handoff.

## Owned Paths

- `agents/marketing/`
- `docs/book-growth/README.md`
- `data/books.json`
- `data/campaigns.json`
- `data/content-library.json`
- `data/agent-runs.json`
- `data/kpis.json`
- `src/agents/bookGrowth/`
- `src/pages/bookGrowth/`
- `src/components/bookGrowth/`
- `scheduler/`
- `queues/`
- `jobs/`
- `integrations/social/`
- `src/scheduler/`
- `src/queues/`
- `src/jobs/`
- `src/integrations/social/`

## Handoff Rules

When Marketing needs infrastructure:

- Create a request for ARCHAIOS instead of editing infrastructure files.
- State the route, data, auth, or deployment dependency.
- Keep promotional content separate from infrastructure docs.

When ARCHAIOS needs marketing:

- Marketing may provide copy, audience segments, campaign briefs, and content assets.
- Marketing must not mark infrastructure tasks as complete.

## Next Actions

1. Keep Book Growth content generation and scheduling in approval-first mode.
2. Build campaign packs under marketing-owned files only.
3. Improve queue visibility and content quality scoring without touching infrastructure.
4. Prepare platform connector credentials as future optional integrations, not active posting.
