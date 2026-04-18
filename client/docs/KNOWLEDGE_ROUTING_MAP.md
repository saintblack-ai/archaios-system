# Knowledge Routing Map

Generated: 2026-04-17

## Routing Rules

| Source Signal | Target Folder | Primary Files |
| --- | --- | --- |
| AI infra / platform architecture | `knowledge/ai-infrastructure.md` | routing, worker, deployment, control-plane content |
| SaaS / subscriptions / pricing | `knowledge/saas-systems.md` | Free/Pro/Elite, Stripe, dashboard SaaS flows |
| Saint Black music | `knowledge/music-saint-black.md` | albums, promos, artist identity, release concepts |
| Books / Apple Books | `knowledge/books-apple-books.md` | manuscripts, publishing, trilogy and campaign notes |
| Game / OS systems | `knowledge/game-development.md` | game plans, OS/system control ideas |
| Crypto / finance | `knowledge/crypto-finance.md` | token/coin/finance strategy and concept material |
| Spiritual / research archive | `knowledge/spiritual-research.md` | doctrine, sermons, Mazzaroth, biblical research |
| Automation / agent systems | `knowledge/automation-systems.md` | loop, agent orchestration, automation workflows |

## Index State

From `knowledge/knowledge-index.json`:

- Files parsed: 25
- Conversations parsed: 631
- Total records indexed: 656

## Processing Path

1. `raw_exports/chatgpt_export_2026-04-16` (source)
2. `scripts/archaios-ingest-build.mjs` (classification + generation)
3. `knowledge/*.md` and `knowledge/knowledge-index.json` (active knowledge layer)
4. `processed_exports/knowledge_snapshots/*` (frozen snapshot copies)
