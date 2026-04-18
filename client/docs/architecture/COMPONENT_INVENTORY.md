# Component Inventory

## Current Client Components / Pages

| File | Role |
|---|---|
| `src/App.jsx` | Main public app and path router |
| `src/pages/Dashboard.jsx` | Authenticated dashboard and admin view |
| `src/pages/bookGrowth/BookGrowthCommand.jsx` | Book Growth OS dashboard |
| `src/components/ProtectedContent.jsx` | Tier-aware content lock |
| `src/components/bookGrowth/BookGrowthCards.jsx` | Reusable Book Growth/Architect panels |
| `src/lib/platform.js` | API client, auth helpers, Stripe client calls |
| `src/lib/subscription.js` | Subscription normalization and feature access |
| `src/agents/*` | Client-side intelligence/marketing helper agents |
| `worker/index.js` | Cloudflare Worker backend |

## New Operator Components

| File | Role |
|---|---|
| `data/operator/system-health.json` | Local operator seed data |
| `src/pages/operator/OperatorMode.jsx` | Internal operator dashboard scaffold |
| `src/components/operator/OperatorCards.jsx` | Reusable operator cards |

## Backend Candidates From `Ai-Assassins`

| Path | Role |
|---|---|
| `worker/src/index.ts` | Mature Cloudflare Worker entry |
| `worker/src/services/dailyBrief.ts` | Daily brief service |
| `worker/src/services/subscription.ts` | Tier limits and subscription helpers |
| `worker/src/services/supabase.ts` | Supabase persistence |
| `worker/src/agents/*` | Backend agent set |

