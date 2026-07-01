# archaios-agents Integration Plan

Generated: 2026-05-30

Mode: planning only. `archaios-agents/` was not changed.

## Current State

`archaios-agents/` is a separate Cloudflare Worker package:

```text
archaios-agents/
  package.json
  wrangler.toml
  src/index.ts
  sql/
```

It defines seven scheduled agents:

```text
revenue_sentinel
brief_generator
system_monitor
user_intelligence
marketing_agent
enterprise_lead_hunter
growth_optimizer
```

It requires:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
```

It writes to:

```text
Supabase agent_logs
```

It exposes:

```text
GET /api/agents/status
```

## Canonical Runtime Comparison

Canonical local runtime agents:

```text
infra-agent
product-agent
revenue-agent
content-agent
research-agent
```

`archaios-agents` scheduled remote agents:

```text
revenue_sentinel
brief_generator
system_monitor
user_intelligence
marketing_agent
enterprise_lead_hunter
growth_optimizer
```

The two sets are related but not aligned.

## Recommended Integration Model

Do not make Cloudflare Worker import `client/archaios-core/agents/*.js` directly.

Reason:

- Canonical runtime agent scripts are Node file-writing executables.
- Cloudflare Workers need Worker-safe code.
- Direct filesystem writes are not appropriate in Cloudflare Workers.

Instead, use canonical manifests as the contract source:

```text
client/archaios-core/runtime/agents/*.json
  -> generated shared contract
  -> archaios-agents/src/agent-contracts.ts
  -> archaios-agents/src/index.ts
```

## Proposed Mapping

| archaios-agents remote agent | Canonical runtime concept | Notes |
| --- | --- | --- |
| `revenue_sentinel` | `revenue-agent` | Revenue monitoring and monetization readiness. |
| `brief_generator` | `research-agent` + `product-agent` | Executive brief from knowledge/product state. |
| `system_monitor` | `infra-agent` | System health and remediation. |
| `user_intelligence` | `product-agent` + `research-agent` | User/product behavior insights. |
| `marketing_agent` | `content-agent` + `revenue-agent` | Campaign optimization. |
| `enterprise_lead_hunter` | `revenue-agent` | Lead opportunity discovery. |
| `growth_optimizer` | `revenue-agent` + `product-agent` | Growth levers and prioritization. |

## Integration Phases

### Phase A: Contract documentation

Add a mapping document only.

No runtime changes.

### Phase B: Generate shared contracts

Potential new script:

```text
client/scripts/export-archaios-agent-contracts.mjs
```

Input:

```text
client/archaios-core/runtime/agents/*.json
```

Output:

```text
archaios-agents/src/agent-contracts.ts
```

### Phase C: Use contracts in scheduled Worker

Files changed:

```text
archaios-agents/src/index.ts
archaios-agents/src/agent-contracts.ts
archaios-agents/package.json
```

Goals:

- Keep scheduled cron names stable.
- Add `canonicalAgentKey` to each scheduled agent.
- Include canonical manifest metadata in `agent_logs.result`.
- Keep OpenAI prompt execution Worker-safe.

### Phase D: Health alignment

Make remote status response include canonical links:

```json
{
  "agent": "system_monitor",
  "canonicalAgentKey": "infra-agent",
  "status": "success",
  "last_run_at": "...",
  "contract": {
    "mission": "...",
    "blockedActions": [...]
  }
}
```

## Validation Plan

Before changes:

```bash
npm --prefix archaios-agents run check
curl -i https://archaios-agents.quandrix357.workers.dev/api/agents/status
```

After changes:

```bash
npm --prefix archaios-agents run check
npx --prefix archaios-agents wrangler deploy --dry-run
curl -fsS https://archaios-agents.quandrix357.workers.dev/api/agents/status
```

## Risks

- `archaios-agents` currently has independent agent names.
- Scheduled cron mappings should not be changed casually.
- Supabase `agent_logs` consumers may expect current names.
- Cloudflare deploy requires Wrangler auth and secrets.

## Stop/Go

GO:

- Add contract mapping docs.
- Repair dependencies/checks.
- Add generated contract file in a future approved phase.

NO-GO:

- Do not import `client/archaios-core/agents/*.js` into Cloudflare Worker.
- Do not rename scheduled agents before checking Supabase consumers.
- Do not change cron schedules during integration.
