# Saint Black Book Growth Command

## What Was Built

`SAINT BLACK BOOK GROWTH COMMAND` is a local, approval-first growth system inside the existing Vite dashboard app. It is available at `/book-growth` and is designed to promote:

- `The Art of Holy War`
- `Echoes of Eden`
- `The Pleiadian Project: A Cosmic Research Guide`

The system creates a compliant organic marketing operating layer for Apple Books visibility, content production, campaign planning, funnel recommendations, KPI projections, and execution logs. It does not auto-post, fake engagement, generate fake reviews, scrape private accounts, or claim guaranteed sales.

## File Map

- `data/books.json`: seed records for the three Apple Books titles.
- `data/campaigns.json`: seeded campaign pipeline.
- `data/content-library.json`: email sequences, landing variants, and bundle campaign ideas.
- `data/agent-runs.json`: initial execution log seed.
- `data/kpis.json`: projection assumptions for the `$100,000/year` target.
- `src/agents/bookGrowth/`: local agent definitions and runners.
- `src/pages/bookGrowth/BookGrowthCommand.jsx`: dashboard module.
- `src/components/bookGrowth/BookGrowthCards.jsx`: reusable KPI, book, agent, campaign, content, analytics, and log panels.
- `src/app.css`: premium command-center styling for the Book Growth OS.
- `src/App.jsx`: route wiring for `/book-growth`.

## Agents

- `Strategy Commander`: sets weekly priorities and campaign focus.
- `Brand Story Agent`: extracts themes, hooks, audience angles, and positioning.
- `Content Creator Agent`: generates the 30-day promotional content engine.
- `SEO + Metadata Agent`: drafts Apple Books keyword and metadata recommendations.
- `Landing Page / Funnel Agent`: maps book promo pages, CTA structure, and tracking requirements.
- `Social Distribution Agent`: prepares approval-ready post queues.
- `Email / Community Agent`: creates newsletter sequences, lead magnets, and reader journeys.
- `Analytics Agent`: estimates traffic, click, conversion, and revenue trajectory.
- `Sales Optimizer Agent`: recommends CTA, funnel, and cadence improvements.
- `Operations Agent`: monitors schedules, logs, and local automation health.

## How To Run

From the project root:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5174/book-growth
```

If the dev server uses another port, open the printed Vite URL and append `/book-growth`.

## How It Persists Data

The current implementation uses JSON seed files plus browser `localStorage` under:

```text
saint-black-book-growth-os-v1
```

This is intentional for local/dev mode. It is modular and can later be moved to Supabase, Cloudflare D1, KV, or another persistent backend.

## What Is Mocked

- Apple Books links are placeholders.
- Book cover images are styled placeholders.
- Clicks, CTR, traffic, and revenue are projection proxies.
- Social publishing is approval-ready only and does not auto-post.
- Landing pages are mapped but not yet generated as public pages.
- Analytics are modeled locally until real click tracking is connected.

## Expansion Path

1. Replace Apple Books placeholder URLs with live links.
2. Add real book cover assets.
3. Add trackable redirect routes for each book and campaign source.
4. Store events and agent runs in Supabase or Cloudflare D1.
5. Add email provider integration for lead capture and reader sequences.
6. Add social publishing integrations only after platform policy review and explicit approval workflow.
7. Add a public `/books/:slug` landing page for each title.
8. Add verified review/testimonial fields only from real readers.

## Social Posting Scheduler

The Book Growth Command now includes a modular posting system:

- `src/scheduler/cronRunner.js`: five-field cron parser and scheduler mode helpers.
- `src/queues/postQueue.js`: pending, scheduled, posted, failed, approval, and retry queue helpers.
- `src/jobs/postingJobs.js`: safe scheduled posting job runner with daily limits and spacing checks.
- `src/integrations/social/connectors.js`: placeholder connectors for `X`, `Facebook`, and `Instagram`.

Posting modes:

- `manual`: default mode. No queue item is posted automatically.
- `scheduled`: posts can be scheduled and processed only when due and approved.
- `auto-post`: optional mode that removes manual approval in local state, but still runs mock-only until real server-side credentials are connected.

Safety controls:

- Maximum posts per day.
- Minimum minutes between posts.
- Manual approval toggle through mode selection.
- Retry cap per post.
- Failed-post retry helper.
- Mock connector logs until real APIs are wired.

Credential notes:

- Do not put social API keys in frontend source.
- Real posting should be moved behind a server-side worker/API route.
- Required future credentials include X API v2 credentials and Meta Graph API page/business tokens.
- Keep approval-first mode available even after real integrations are added.

## Architect Mode

`ARCHITECT MODE` is the internal orchestration layer for controlled self-expansion. It adds:

- Agent registry for primary agents and support agents.
- Parent/child agent relationships.
- Build log.
- Execution log visibility through existing agent runs.
- Dependency map.
- Permissions map.
- Roadmap queue.
- Awaiting authorization queue.
- System health checks.
- Safe next steps.

Support agents currently registered:

- `Architecture Orchestrator`
- `Compliance Guardian`
- `Queue Auditor`
- `Content Quality Reviewer`
- `Projection Skeptic`

These support agents are internal planning and review structures. They do not connect external services or post content.

## Quality Gate

The system now creates a local content quality report and manual approval packets:

- `src/agents/bookGrowth/contentQuality.js`

The quality gate checks generated social posts for CTA presence, risky promotional language, platform-length concerns, and Apple Books CTA language. Approval packets summarize copy, platform, scheduled time, approval state, and a manual review checklist.

## Safety Rules

- No spam automation.
- No fake activity, fake reviews, or fake testimonials.
- No paid ads unless explicitly enabled later.
- No platform posting without credentials, approval, rate limits, and policy review.
- Projections are estimates, not guaranteed sales.
