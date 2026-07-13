# ARCHAIOS Intelligence Operating System Implementation

Status: production architecture ready for phased implementation  
Primary frontend: `client/` Vite React app deployed to GitHub Pages  
Backend: root Cloudflare Worker in `worker.js` deployed as `archaios-saas-worker`  
Schema migration: `sql/20260710_archaios_intelligence_os.sql`

## Mission Definition

ARCHAIOS becomes an Intelligence Command Center: a realtime SITREP engine, full-screen tactical mission map, Commander briefing layer, live adapter pipeline, pgvector semantic memory, and interactive intelligence graph.

This is an operational intelligence product, not a game surface. The UI should feel like a professional command system: black, graphite, restrained gold accents, glass panels, animated grid, satellite glow, dense information hierarchy, and smooth transitions.

## Canonical Event Schema

Every adapter must normalize into this event contract before storage:

```ts
export type IntelligenceEventInput = {
  externalId: string;
  sourceKey: string;
  section:
    | "global"
    | "us"
    | "markets"
    | "ai"
    | "cybersecurity"
    | "defense"
    | "space"
    | "energy"
    | "science"
    | "weather"
    | "osint";
  eventType:
    | "ai"
    | "cyber"
    | "military"
    | "economics"
    | "weather"
    | "breaking_news"
    | "research"
    | "space"
    | "energy"
    | "science"
    | "status";
  title: string;
  summary: string;
  content?: string;
  threatLevel: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  occurredAt?: string;
  detectedAt: string;
  publishedAt?: string;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  countries: string[];
  organizations: string[];
  people: string[];
  technologies: string[];
  tags: string[];
  sourceUrl?: string;
  sourceTitle?: string;
  rawPayload: unknown;
  suggestedActions: Array<{ label: string; priority: "low" | "medium" | "high"; rationale: string }>;
};
```

Hashing rule: `content_hash = sha256(sourceKey + externalId + title + publishedAt)`. Upsert by `(source_id, external_id)` first and `content_hash` second to prevent duplicate breaking-news items.

## Supabase Data Model

The new migration creates:

- `intelligence_sources`: adapter registry, reliability score, polling cadence, health.
- `intelligence_events`: normalized event ledger for timeline, map, heatmap, and feeds.
- `intelligence_reports`: Morning SITREP, Noon Update, Evening Review, Weekly Assessment, Monthly Strategic Report.
- `intelligence_research_assessments`: GPT summary, bias estimate, confidence, counterarguments, historical context, strategic importance.
- `intelligence_event_embeddings`: `vector(1536)` embeddings for semantic memory.
- `intelligence_relationships`: event-to-event graph edges such as `causes`, `references`, `contradicts`, `escalates`.
- `intelligence_entities` and `intelligence_event_entities`: people, organizations, countries, technologies, locations, topics.
- `intelligence_ingestion_runs`: adapter observability and scheduler audit trail.
- `match_intelligence_events(...)`: pgvector semantic search RPC.
- `intelligence_latest_sitrep`: read view for `/api/sitrep`.

RLS posture: service role writes everything; authenticated users can read active intelligence surfaces. Public read should stay disabled until entitlement and product gating are finalized.

## Cloudflare Worker File Structure

Add these files around the existing root Worker without moving payment routes:

```txt
worker.js
worker/
  intelligence/
    adapters/
      news.js
      weather.js
      nasa.js
      usgs.js
      markets.js
      github.js
      openaiStatus.js
      cloudflareStatus.js
      supabaseStatus.js
      stripeStatus.js
    commander.js
    embeddings.js
    graph.js
    ingest.js
    research.js
    routes.js
    schemas.js
    scoring.js
    supabase.js
```

`worker.js` should delegate intelligence routes to `worker/intelligence/routes.js` while keeping the existing health, Stripe, pricing, lead, and marketing routes intact.

## Worker API Routes

Implement these production routes:

- `GET /api/sitrep`: returns grouped sections from `intelligence_latest_sitrep`, latest report, threat heatmap, commander notes, daily priorities, research queue.
- `GET /api/intelligence/events?section=&type=&since=&limit=`: paginated event timeline.
- `GET /api/intelligence/events/:id`: event detail with research assessment, timeline, sources, related events, and LLM analysis.
- `GET /api/intelligence/map`: compact geo event payload for Mission Map.
- `GET /api/intelligence/graph?eventId=&depth=2`: nodes and edges from events, relationships, and entities.
- `POST /api/intelligence/search`: body `{ query, section?, limit? }`; embeds query and calls `match_intelligence_events`.
- `POST /api/intelligence/ingest/run`: authenticated internal route for manual adapter run.
- `POST /api/intelligence/reports/generate`: authenticated internal route for ad hoc Commander report generation.

Response caching:

- `/api/sitrep`: `Cache-Control: private, max-age=30, stale-while-revalidate=120`
- `/api/intelligence/map`: `max-age=60`
- `/api/intelligence/events`: `max-age=30`
- Search and report generation: no store.

## Live Data Adapters

Each adapter exports:

```ts
export async function fetchAdapterEvents(env, source): Promise<IntelligenceEventInput[]>;
```

Adapter requirements:

- News APIs: top headlines and topic queries for Global, US, AI, Cybersecurity, Defense, Energy, Science, OSINT.
- Weather: Open-Meteo or paid weather provider for severe weather markers.
- NASA: DONKI space weather, near-earth objects, APOD only when tied to science report context.
- USGS: earthquakes and major geological events.
- Financial Markets: indexes, crypto, treasury/yield stress, volatility. Use a paid market API for production.
- GitHub Activity: trending repositories, security advisories, notable releases, ecosystem activity.
- OpenAI Status, Cloudflare Status, Supabase Status, Stripe Status: provider incident feeds and component states.

Normalization must happen at adapter boundary. Downstream code should never parse provider-specific shapes.

## Commander Voice

Commander reports should sound like an intelligence officer:

- clear threat posture
- direct operational consequence
- confidence stated plainly
- source caveats surfaced
- action recommendations prioritized

Report types:

- Morning Brief: overnight changes, daily priorities, threat posture.
- Noon Update: deltas only, new escalations, market/infra checks.
- Evening Review: what changed, what mattered, what to watch overnight.
- Weekly Assessment: trend analysis, clusters, strategic risks, opportunities.
- Monthly Strategic Report: broader horizon, recurring actors, technology shifts, mission history.

Use JSON schema responses for report generation. Store the final report in `intelligence_reports`; do not rely on transient LLM output.

## Semantic Memory Pipeline

For every inserted or materially updated event:

1. Build embedding text from title, summary, content, entities, countries, technologies, and source.
2. Embed with the configured embedding model.
3. Upsert `intelligence_event_embeddings`.
4. Run entity extraction.
5. Upsert `intelligence_entities` and `intelligence_event_entities`.
6. Run relationship detection against nearby semantic matches and recent same-section events.
7. Upsert `intelligence_relationships`.

Supported memory features:

- semantic search via `match_intelligence_events`
- relationship graph via event and entity tables
- topic clustering via embeddings plus entity overlap
- timeline reconstruction by `occurred_at`, `detected_at`, and relationships
- mission history through report/event joins

## Intelligence Graph

Graph nodes:

- event nodes: id, title, section, eventType, threatLevel, confidence, timestamp
- entity nodes: organization, person, country, technology, topic, location

Graph edges:

- event-to-event from `intelligence_relationships`
- event-to-entity from `intelligence_event_entities`

The graph endpoint should return:

```json
{
  "nodes": [{ "id": "event:...", "kind": "event", "label": "...", "threatLevel": 3 }],
  "edges": [{ "id": "...", "source": "...", "target": "...", "type": "references", "confidence": 0.82 }]
}
```

## Frontend File Structure

Add a dedicated command center surface inside `client/src`:

```txt
client/src/pages/sitrep/SitrepPage.jsx
client/src/pages/sitrep/SitrepTimeline.jsx
client/src/pages/sitrep/ThreatHeatmap.jsx
client/src/pages/sitrep/MissionFeed.jsx
client/src/pages/sitrep/CommanderNotes.jsx
client/src/pages/sitrep/DailyPriorities.jsx
client/src/pages/sitrep/ResearchQueue.jsx
client/src/pages/mission/IntelligenceMissionMap.jsx
client/src/pages/mission/IntelligenceMarkerLayer.jsx
client/src/pages/mission/MarkerIntelPanel.jsx
client/src/pages/graph/IntelligenceGraph.jsx
client/src/api/intelligence.js
client/src/lib/intelligenceTypes.js
```

Route model in the current Vite app:

- Add `sitrep` and `map` views to the existing `App.jsx` view router.
- Keep `/app/sitrep` as the Next.js target if the root Next app becomes canonical later.
- In the deployed `client/`, expose `#/sitrep` or the existing router equivalent unless GitHub Pages rewrite support is added.

## SITREP Page

Required panels:

- Live Timeline: latest active events sorted by threat and time.
- Threat Heatmap: section-level threat intensity from `intelligence_latest_sitrep`.
- Mission Feed: Commander-ready operational feed.
- Commander Notes: latest report `commander_notes`.
- Daily Priorities: report-generated action list.
- Research Queue: articles/events needing deeper assessment.

The page should stream updates by polling `/api/sitrep` every 30-60 seconds initially. Upgrade to Server-Sent Events only after Worker route stability is proven.

## Mission Map

Recommended library: MapLibre GL JS with a dark vector style, because it is production-proven and supports animated layers. Add it only when implementing the UI package:

```sh
npm --prefix client install maplibre-gl
```

Marker types:

- AI
- Cyber
- Military
- Economics
- Weather
- Breaking News
- Research

Marker click panel:

- Summary
- Timeline
- Sources
- Related Events
- LLM Analysis

Map rendering rules:

- full-screen tactical map, no decorative card wrapper
- animated grid overlay via CSS
- satellite glow through map layer styling
- gold accent only for focus, selection, or critical command affordances
- dense glass panels for detail panes
- markers sized by threat level and confidence

## AI Orchestrator

Cloudflare Cron Triggers:

```toml
[triggers]
crons = [
  "*/5 * * * *",
  "0 7 * * *",
  "0 12 * * *",
  "30 20 * * *",
  "0 8 * * 1",
  "0 8 1 * *"
]
```

Scheduled behavior:

- Every 5 minutes: poll due sources by `polling_interval_seconds`; insert normalized events.
- 07:00 America/Chicago: Morning SITREP.
- 12:00 America/Chicago: Noon Update.
- 20:30 America/Chicago: Evening Review.
- Monday 08:00: Weekly Intelligence Assessment.
- First day 08:00: Monthly Strategic Report.

The Worker scheduled handler should use `event.cron` to select a job, write `intelligence_ingestion_runs`, and store reports in Supabase.

## Performance Plan

- Edge render via Cloudflare Worker JSON endpoints and static GitHub Pages frontend.
- Cache read endpoints for 30-60 seconds with stale-while-revalidate.
- Use incremental polling with `since` timestamps for event feeds.
- Keep map payload compact: id, type, title, threat, confidence, lat/lon, timestamp.
- Fetch detail panel data only after marker click.
- Use optimistic UI for user annotations and saved research tasks after those tables are added.
- Batch embeddings and relationship detection in small chunks to protect Worker CPU time.
- Store adapter raw payloads but serve only normalized fields by default.

## Implementation Tasks

### Phase 1: Data Foundation

- Apply `sql/20260710_archaios_intelligence_os.sql` to Supabase.
- Confirm `vector` extension is available in the target Supabase project.
- Add env secrets for provider APIs and embeddings.
- Add Supabase helper functions under `worker/intelligence/supabase.js`.
- Implement content hashing and source lookup/upsert.

### Phase 2: Adapter Layer

- Build status adapters first: OpenAI, Cloudflare, Supabase, Stripe.
- Build USGS and weather adapters next because they are deterministic and geo-friendly.
- Build NASA and GitHub adapters.
- Add paid News and Markets providers last, after key selection and rate limits are confirmed.
- Record every adapter run in `intelligence_ingestion_runs`.

### Phase 3: SITREP API

- Add `worker/intelligence/routes.js`.
- Add `GET /api/sitrep`.
- Add `GET /api/intelligence/events`.
- Add `GET /api/intelligence/events/:id`.
- Add route-level auth using existing Supabase bearer-token pattern.
- Add cache headers and error envelopes.

### Phase 4: Commander Reports

- Implement `commander.js` with report schemas.
- Generate Morning, Noon, Evening, Weekly, Monthly reports.
- Store all generated reports in `intelligence_reports`.
- Link reports to event ids.
- Add Commander tone tests for directness, confidence, and actionability.

### Phase 5: Semantic Memory

- Implement `embeddings.js`.
- Embed every new event.
- Add `POST /api/intelligence/search`.
- Add relationship detection in `graph.js`.
- Add topic clustering job.
- Add timeline reconstruction endpoint.

### Phase 6: Research Mode

- Implement `research.js`.
- Generate GPT summary, bias estimate, confidence, counterarguments, historical context, strategic importance.
- Store assessments in `intelligence_research_assessments`.
- Add research queue ranking by threat, novelty, source reliability, and missing assessment.

### Phase 7: Frontend SITREP

- Add `client/src/api/intelligence.js`.
- Add `client/src/pages/sitrep/SitrepPage.jsx`.
- Add timeline, heatmap, feed, notes, priorities, queue components.
- Register the view in `client/src/App.jsx`.
- Style in `client/src/app.css` with the command aesthetic.

### Phase 8: Mission Map

- Install MapLibre GL JS.
- Add full-screen `IntelligenceMissionMap`.
- Render event markers from `/api/intelligence/map`.
- Add click detail panel with event detail route.
- Add smooth marker transitions and selected-marker focus.

### Phase 9: Intelligence Graph

- Add graph endpoint.
- Add frontend graph view using a proven graph renderer.
- Support event-centered depth traversal.
- Add filters for relationship type, entity type, and threat level.

### Phase 10: Production Hardening

- Add Worker tests for adapter normalization and route envelopes.
- Add frontend smoke tests for SITREP, map, graph.
- Add rate-limit handling per adapter.
- Add failure-mode UI for stale data.
- Add health cards for adapter freshness.
- Deploy backend with `npx wrangler deploy --name archaios-saas-worker`.
- Deploy frontend from `client/` with the GitHub Pages workflow.

## Environment Variables

Worker secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEWS_API_KEY`
- `NASA_API_KEY`
- `MARKETS_API_KEY`
- `GITHUB_TOKEN`

Worker vars:

- `OPENAI_MODEL`
- `OPENAI_EMBEDDING_MODEL`
- `LOCAL_TIMEZONE`
- `WORKER_BASE_URL`
- `FRONTEND_URL`

Frontend vars:

- `VITE_BACKEND_URL=https://archaios-saas-worker.quandrix357.workers.dev`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Frontend production must not rely on localhost fallback behavior.

## Definition of Done

- `/api/health` is green.
- `/api/sitrep` returns live Supabase-backed sections with timestamps, threat level, confidence, source, summary, related events, and suggested actions.
- At least five live adapters are running on cron with ingestion audit records.
- Every stored event has an embedding or a recorded embedding failure.
- Commander reports are persisted and linked to source events.
- Mission Map renders real geo events and opens event intelligence panels.
- SITREP page shows live timeline, heatmap, mission feed, commander notes, daily priorities, and research queue.
- Intelligence graph displays event and entity relationships.
- Stripe checkout remains gated for signed-out users and unaffected by intelligence routes.
