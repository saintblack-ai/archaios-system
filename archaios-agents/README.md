# archaios-agents

Cloudflare Worker with 7 scheduled agents, Supabase logging, and a status endpoint.

## Required environment variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. In Supabase SQL editor, run:
   - `sql/002_archaios_revenue_protocol.sql`
3. Set worker secrets:
   ```bash
   wrangler secret put SUPABASE_URL
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   wrangler secret put OPENAI_API_KEY
   ```

## Run locally

```bash
npm run dev
```

## Endpoint

- `GET /api/agents/status`

## Deploy

```bash
npm run deploy
```
