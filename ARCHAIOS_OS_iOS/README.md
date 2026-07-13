# ARCHAIOS OS iOS

ARCHAIOS OS is the local-first Founder Edition mobile command center for Saint Black. Sprint 17 adds the Living Intelligence Engine: a primary Commander workspace that connects memory, missions, knowledge, decisions, timeline, and resume state without production APIs or network calls.

## Current Sprint

- Current sprint: Sprint 17 - Living Intelligence Engine
- Primary workspace: `LivingIntelligenceView`
- Architecture: SwiftUI, SwiftData, MVVM-style observable view models, protocol-backed mock services
- Runtime policy: local-first, no authentication, no production APIs, no URLSession, no API keys

## Project Layout

```text
ARCHAIOS OS/
  App/                    Root navigation, sprint-level composite screens
  Components/             Shared visual components
  Models/                 Domain structs and SwiftData models
  Modules/                Feature modules with view models
  Services/               Mock services and future provider protocols
  Theme/                  Founder Edition theme and theme manager
Docs/
  Architecture/           Architecture, routing, model, and feature docs
  Sprint Reports/         Sprint completion reports
```

## Primary Screens

- Living Intelligence
- Commander Mode
- Founder Operations
- Live Command Bridge
- Core Network
- Mission Control AI
- Intelligence Core
- Commander
- AI Commander
- Black Vault
- Operations
- Music Command
- Infrastructure
- Founder Mode
- Daily OS
- Settings

## Build

Open the project:

```bash
open "ARCHAIOS OS.xcodeproj"
```

Generic iOS build:

```bash
xcodebuild \
  -project "ARCHAIOS OS.xcodeproj" \
  -scheme "ARCHAIOS OS" \
  -configuration Debug \
  -destination 'generic/platform=iOS' \
  -derivedDataPath /tmp/archaios_docs_check_derived \
  CODE_SIGNING_ALLOWED=NO \
  build
```

## Documentation

- [Docs Index](Docs/README.md)
- [Architecture Overview](Docs/Architecture/ARCHITECTURE.md)
- [SwiftData Models](Docs/Architecture/SWIFTDATA_MODELS.md)
- [Application Routing](Docs/Architecture/ROUTING.md)
- [Commander Architecture](Docs/Architecture/COMMANDER_ARCHITECTURE.md)
- [Black Vault](Docs/Architecture/BLACK_VAULT.md)
- [Living Intelligence Engine](Docs/Architecture/LIVING_INTELLIGENCE_ENGINE.md)
- [Roadmap](Docs/ROADMAP.md)
- [Feature Matrix](Docs/FEATURE_MATRIX.md)
- [Changelog](CHANGELOG.md)
- [Release Notes](RELEASE_NOTES.md)

## Integration Policy

Production integrations remain disabled. Future provider protocols and mock adapters exist for OpenAI, Codex, OpenClaw, GitHub, Notion, Supabase, Cloudflare, and Local LLM, but Sprint 17 does not connect them to live services.

Do not add API keys, secrets, URLSession calls, authentication flows, deployments, commits, or pushes without an explicit future sprint requirement.
