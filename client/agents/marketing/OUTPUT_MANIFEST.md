# Marketing Output Manifest

This manifest tags files that belong to the Saint Black book marketing mission. Files are intentionally left in their existing locations to avoid breaking live routes, imports, or workflows.

## Book Growth Docs

- `docs/book-growth/README.md`

## Marketing Data

- `data/books.json`
- `data/campaigns.json`
- `data/content-library.json`
- `data/agent-runs.json`
- `data/kpis.json`

## Book Growth Agents

- `src/agents/bookGrowth/`

Includes:

- `strategyCommander.js`
- `brandStoryAgent.js`
- `contentCreatorAgent.js`
- `seoMetadataAgent.js`
- `funnelAgent.js`
- `socialDistributionAgent.js`
- `emailCommunityAgent.js`
- `analyticsAgent.js`
- `salesOptimizerAgent.js`
- `operationsAgent.js`
- `architectMode.js`
- `contentQuality.js`
- `shared.js`
- `index.js`

## Marketing UI

- `src/pages/bookGrowth/BookGrowthCommand.jsx`
- `src/components/bookGrowth/BookGrowthCards.jsx`

## Social Scheduling And Queue System

- `scheduler/README.md`
- `queues/README.md`
- `jobs/README.md`
- `integrations/social/README.md`
- `src/scheduler/cronRunner.js`
- `src/queues/postQueue.js`
- `src/jobs/postingJobs.js`
- `src/integrations/social/connectors.js`

## Marketing Boundaries

Marketing can read infrastructure status if needed for display, but cannot modify:

- `worker/`
- `wrangler.jsonc`
- `vercel.json`
- `.github/workflows/`
- `supabase/`
- `src/pages/revenue/`
- `src/pages/operator/`
- `src/lib/subscription.js`
- `src/lib/platform.js`
