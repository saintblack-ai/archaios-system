# ARCHIVIST Agent MVP

## Scope

ARCHIVIST is the authenticated institutional-memory API for Archaios. This MVP stores research, retrieves it by text and tag, updates tags, and creates durable AI summaries. It uses the existing root Cloudflare Worker, Supabase bearer authentication, Supabase Postgres, and the Worker OpenAI integration.

## Apply The Database Migration

Apply `client/supabase/sql/2026-06-20_archivist_mvp.sql` after the core Supabase tables. It creates:

- `archivist_items` for research records and tags.
- `archivist_summaries` for retained summary history.
- Owner-scoped RLS policies. No delete policy is created.

## API

Every route requires `Authorization: Bearer <Supabase access token>`.

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/archivist/items` | Save research with optional tags. |
| `GET` | `/api/archivist/items?q=&tag=&item_type=&category=&limit=` | Search the authenticated user's research. |
| `PATCH` | `/api/archivist/items/:id` | Replace an item's tag set with `{ "tags": [] }`. |
| `POST` | `/api/archivist/items/:id/summarize` | Generate and persist a factual, uncertainty-preserving summary. |

### Save Research

```json
{
  "item_type": "research",
  "title": "QX materials notes",
  "body": "Preserved research content.",
  "source_ref": "https://example.com/source",
  "category": "QX Technology",
  "tags": ["materials", "supply chain"],
  "importance": "high"
}
```

Tags are normalized to lowercase URL-safe labels such as `supply-chain`. Search results are always filtered to the bearer-token owner's records. Summary generation requires the existing `OPENAI_API_KEY` Worker secret.

## Verification

```sh
node --check worker.js
node --test tests/archivist-agent.test.mjs
wrangler deploy --dry-run --name archaios-saas-worker
```

## Deliberate MVP Limits

- No hard delete endpoint.
- No automated truth assessment, claim acceptance, or publishing.
- Duplicate detection, concept graph links, and a visual dashboard remain later ARCHIVIST phases.
