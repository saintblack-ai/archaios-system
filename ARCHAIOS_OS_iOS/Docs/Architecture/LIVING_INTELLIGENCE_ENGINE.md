# Living Intelligence Engine

## Purpose

Sprint 17 adds the Living Intelligence Engine so ARCHAIOS OS behaves like a connected Executive Intelligence System rather than separate dashboards.

## Files

- `App/LivingIntelligenceView.swift`
- `Models/LivingIntelligenceModels.swift`
- `Services/LivingIntelligenceEngine.swift`
- `App/AppRoute.swift`
- `App/RootView.swift`
- `ARCHAIOSOSApp.swift`

## View Composition

`LivingIntelligenceView` contains:

- Executive Dashboard
- Commander Memory panel
- Intelligence Score panel
- editable Knowledge Graph panel
- Executive Decision Engine panel
- searchable Knowledge Engine panel
- Living Timeline
- Resume Engine panel
- persistent Commander Dock

## Persistence

Sprint 17 added five SwiftData models:

- `CommanderMemoryRecord`
- `IntelligenceRelationshipRecord`
- `ExecutiveDecisionRecord`
- `KnowledgeCollectionRecord`
- `ResumeStateRecord`

## Local Engine

`LivingIntelligenceViewModel` is an `@Observable` local model. It provides:

- time-based Commander greeting
- deterministic readiness and growth score calculation
- local daily recommendation logic
- search state for the Knowledge Engine
- selected dock state

## Security Boundary

The Living Intelligence Engine does not use:

- authentication
- `URLSession`
- production URLs
- API keys
- secrets
- live provider calls

All generated intelligence is local and derived from SwiftData queries or deterministic local rules.
