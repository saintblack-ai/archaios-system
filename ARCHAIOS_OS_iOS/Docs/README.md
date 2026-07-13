# ARCHAIOS OS Documentation Index

This index is the starting point for the Sprint 17 ARCHAIOS OS iOS documentation set.

## Core Docs

- [Architecture Overview](Architecture/ARCHITECTURE.md)
- [SwiftData Models](Architecture/SWIFTDATA_MODELS.md)
- [Application Routing](Architecture/ROUTING.md)
- [Commander Architecture](Architecture/COMMANDER_ARCHITECTURE.md)
- [Black Vault](Architecture/BLACK_VAULT.md)
- [Living Intelligence Engine](Architecture/LIVING_INTELLIGENCE_ENGINE.md)
- [Maintenance Audit](Architecture/MAINTENANCE_AUDIT.md)

## Planning

- [Project Roadmap](ROADMAP.md)
- [Feature Matrix](FEATURE_MATRIX.md)
- [Changelog](../CHANGELOG.md)
- [Release Notes](../RELEASE_NOTES.md)

## Sprint Reports

- [Sprint Reports Index](Sprint%20Reports/README.md)

## Source Anchors

- App entry: `ARCHAIOS OS/ARCHAIOSOSApp.swift`
- Root navigation: `ARCHAIOS OS/App/RootView.swift`
- Routes: `ARCHAIOS OS/App/AppRoute.swift`
- Living Intelligence: `ARCHAIOS OS/App/LivingIntelligenceView.swift`
- Sprint 17 models: `ARCHAIOS OS/Models/LivingIntelligenceModels.swift`
- Shared SwiftData models: `ARCHAIOS OS/Models/SwiftDataModels.swift`
- Mock services: `ARCHAIOS OS/Services/MockBackendServices.swift`
- Future provider protocols: `ARCHAIOS OS/Services/FutureCommandBridgeProtocols.swift`

## Verification Policy

Before treating a sprint as complete, verify:

- generic iOS build succeeds
- physical iPhone build succeeds when a device is available
- physical install and launch succeed when a device is available
- no `URLSession` production calls were introduced
- no API keys, tokens, or secrets were added
- routes remain reachable through `AppRoute` and `RootView`
- Sprint report is filed under `Docs/Sprint Reports/`
