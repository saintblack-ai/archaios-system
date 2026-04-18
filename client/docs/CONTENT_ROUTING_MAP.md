# ARCHAIOS Content Routing Map

Generated: 2026-04-17

## Purpose

This map defines where incoming ChatGPT export material should go after classification.

## Routing Table

| Incoming Material | Classification | Destination | Owner Repo / System | Output Format |
|---|---|---|---|---|
| Agent prompts and role instructions | Prompts | Prompt registry | `ai-assassins-client` docs, future agent registry | Markdown + JSON |
| ARCHAIOS app architecture | Product architecture | Architecture docs | `ai-assassins-client` | Markdown diagrams/specs |
| AI Assassins briefing logic | Intelligence pipeline | Worker migration notes | `Ai-Assassins` then current Worker | Markdown + issues |
| Landing page copy | Marketing content | Landing/pricing copy backlog | `ai-assassins-client` or `saintblack-ai.github.io` | Markdown snippets |
| Offer/pricing notes | Business model | Revenue architecture | `ai-assassins-client` docs | Markdown |
| Stripe funnel ideas | Billing and conversion | Stripe setup/backlog | `ai-assassins-client` Worker | Markdown + implementation tasks |
| Spiritual doctrine/research | Spiritual research | Research vault | `ARCHAIOS_INFRASTRUCTURE/classified/spiritual-research/` | Markdown |
| Sermons/outlines | Spiritual research / books | Writing backlog | classified export folders | Markdown |
| Manuscripts/books | Books | Book project map | Book Growth OS + classified folders | Markdown |
| Lyrics/music/promo | Music | Saint Black creative system | Book Growth/brand folders | Markdown |
| Art/visual direction | Brand assets | Brand asset map | `saintblack-ai.github.io` or docs | Markdown + asset list |
| ARCHAIOS OS concepts | Game / OS systems | Operator/control-plane backlog | `Archaios OS` | Markdown + issues |
| Game mechanics/simulation ideas | Game / OS systems | Future module backlog | `Archaios OS` or new repo later | Markdown |
| Crypto/token systems | Crypto systems | Hold queue | classified folders only until approved | Markdown |
| Raw conversation exports | Raw conversations | Raw archive | `ARCHAIOS_INFRASTRUCTURE/inbox/` and manifest | JSON references |
| Implementation instructions | App feature docs | Feature backlog | current active repo docs | Markdown tickets |

## Active System Destinations

### Customer App

- Repo: `ai-assassins-client`
- Receives:
  - Dashboard feature ideas.
  - Pricing/landing copy.
  - Tier gates.
  - Export viewer or archive search features after approval.
  - Operator dashboards that are safe for web display.

### Product Engine

- Repo: `Ai-Assassins`
- Receives:
  - Daily briefing pipeline ideas.
  - Source ingestion ideas.
  - Worker/API patterns.
  - Mobile app or store prep material.

### Public Static Launcher

- Repo: `saintblack-ai.github.io`
- Receives:
  - Public brand copy.
  - High-level links.
  - Non-private public landing assets.

### Internal Operator

- Repo: `Archaios OS`
- Receives:
  - Internal workflows.
  - Local automation tasks.
  - Metrics/logging structure.
  - Daily job orchestration.

### Local Worker Lab

- Workspace: `openclaw-work`
- Receives:
  - Local-only worker experiments.
  - OpenClaw command scripts.
  - Non-public organization experiments.

## Hold Queues

Material that should not immediately become app code:

- Crypto systems.
- Private spiritual notes.
- Unverified claims.
- Raw personal conversations.
- Any content containing secrets, personal data, or private third-party data.
- Large speculative systems that need a product decision first.

## Conversion Rule

Every extracted idea should become one of:

- A product requirement.
- A prompt registry entry.
- A content asset.
- A research note.
- A backlog ticket.
- A hold item awaiting authorization.

If it does not fit one of these, keep it in `unknown-review`.

## Traceability Rule

Every converted doc should include:

- Source export file.
- Conversation title, if available.
- Date detected.
- Classification confidence.
- Decision owner.
- Next action.

