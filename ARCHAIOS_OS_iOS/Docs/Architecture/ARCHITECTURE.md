# ARCHAIOS OS Architecture

## Summary

ARCHAIOS OS iOS is a local-first SwiftUI application. Sprint 17 turns the app into a Living Intelligence Operating System by adding a primary Commander workspace backed by SwiftData persistence and deterministic local intelligence logic.

## Layers

### App Layer

- `ARCHAIOSOSApp.swift` creates the SwiftData `ModelContainer`.
- `RootView.swift` owns the `NavigationStack`, splash overlay, launch surface, and route destinations.
- `AppRoute.swift` defines every navigable route, title, and SF Symbol.

### Feature Layer

Feature modules live in two places:

- `Modules/` contains earlier modular screens with view models.
- `App/` contains sprint-level composite screens introduced in later sprints.

The later sprint screens preserve previous surfaces instead of replacing them.

### Data Layer

SwiftData is the only persistence layer in the iOS app. Models are registered in one schema in `ARCHAIOSOSApp.swift`.

Important model files:

- `Models/SwiftDataModels.swift`
- `Models/LivingIntelligenceModels.swift`

### Service Layer

The app uses protocol-backed local services:

- `BackendProtocols.swift` defines provider contracts.
- `MockBackendServices.swift` provides deterministic local data.
- `FutureCommandBridgeProtocols.swift` defines future provider adapters without network execution.
- `LivingIntelligenceEngine.swift` provides local Sprint 17 scoring, greetings, and recommendations.

## Current Primary Workspace

Sprint 17 promotes `LivingIntelligenceView` as the primary Commander workspace. It contains:

- Executive Dashboard
- Commander Memory
- Intelligence Score
- Knowledge Graph
- Executive Decision Engine
- Knowledge Engine
- Living Timeline
- Resume Engine
- Commander Dock

## Local-First Policy

The iOS app must remain local-first:

- no authentication
- no `URLSession`
- no production URLs
- no API keys
- no secrets
- no deployment hooks
- no live provider bridges

Future integrations stay behind protocols and mock adapters until explicitly authorized.
