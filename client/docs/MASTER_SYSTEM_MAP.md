# ARCHAIOS Master System Map

## Mission

ARCHAIOS is the infrastructure layer behind the Saint Black / AI Assassins intelligence platform. Its production objective is to deliver daily global intelligence briefings, gate premium features by subscription tier, and operate the internal command backbone for content, revenue, agents, deployments, and system health.

## Current Local Asset Map

| Asset | Observed Path | Current Role | Status |
|---|---|---:|---|
| `ai-assassins-client` | `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/client` | Vite React customer dashboard, Cloudflare Worker backend, Supabase/Stripe integration, Book Growth OS, Architect Mode | Active build target |
| `Ai-Assassins` | `/Users/quandrixblackburn/projects/Ai-Assassins` | Mature Cloudflare Worker + static dashboard + mobile/store assets + daily briefing APIs | Strong source of backend/product logic |
| `saintblack-ai.github.io` | `/Users/quandrixblackburn/saintblack-ai.github.io` | Public GitHub Pages / Next-style app and marketing/agent API experiments | Public/marketing candidate |
| `Archaios OS` | `/Users/quandrixblackburn/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS` | Internal Python/Streamlit agent orchestration plane and daily job logs | Internal operator layer |
| ChatGPT export | `/ARCHAIOS_INFRASTRUCTURE/` | Product vision, prompts, architecture notes, unfinished build instructions | Not found locally during audit |

## Production Architecture Target

```text
Public Traffic
  -> Saint Black marketing / landing layer
  -> Email capture and pricing CTAs
  -> Authenticated AI Assassins dashboard
  -> Supabase auth and subscription records
  -> Stripe Checkout / Billing Portal
  -> Cloudflare Worker intelligence APIs
  -> Daily briefing pipeline
  -> Dashboard, email, and future mobile delivery

Operator Traffic
  -> ARCHAIOS Operator Mode
  -> Repo/deploy/content/revenue health
  -> Agent and queue orchestration
  -> Approval-first publishing and briefing controls
```

## Final Platform Surfaces

- `Marketing/public website`: public Saint Black / AI Assassins landing pages, pricing, lead capture, sample intelligence.
- `Intelligence dashboard`: authenticated dashboard for daily briefings, alerts, premium panels, saved history.
- `User portal`: Supabase auth, subscription status, billing portal, tier-aware feature locks.
- `Admin/operator control panel`: internal ARCHAIOS Operator Mode, deploy health, revenue state, pipeline tasks.
- `Content ingestion pipeline`: global signals, news, market data, weather/sitrep sources, manually approved brief generation.
- `Revenue system`: Stripe Checkout Sessions, webhooks, subscription sync, billing portal, Pro/Elite gating.
- `Growth system`: Book Growth Command, content queues, safe scheduler, mock connectors, approval workflows.

## Tier Model

| Tier | Price | Capability |
|---|---:|---|
| Free | `$0` | Limited or delayed briefing, teaser intelligence, email capture, upgrade prompts |
| Pro | `$49/month` | Full daily briefing, expanded dashboards, premium categories, saved history, member tools |
| Elite | `$99/month` | Pro plus priority intelligence feed, deeper analysis, elite reports, urgency alerts, future concierge/operator features |

## System Boundary

Allowed now:

- Internal docs, dashboards, route maps, queue scaffolds, mock connector logic, production checklists, local build validation.

Requires explicit approval:

- Live Stripe product mutation, production secret updates, public deployment, external API connection, email sending, social posting, paid ads, destructive repo merges.

