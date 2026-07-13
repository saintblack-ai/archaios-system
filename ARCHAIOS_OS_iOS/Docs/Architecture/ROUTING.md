# Application Routing

Routing is centralized in `ARCHAIOS OS/App/AppRoute.swift` and resolved by `ARCHAIOS OS/App/RootView.swift`.

## Route Registry

| Route | Title | Destination |
| --- | --- | --- |
| `livingIntelligence` | Living Intelligence | `LivingIntelligenceView` |
| `livingCommander` | Commander Mode | `LivingCommanderView` |
| `founderOperations` | Founder Ops | `FounderOperationsView` |
| `liveCommandBridge` | Live Bridge | `LiveCommandBridgeView` |
| `coreNetwork` | Core Network | `CoreNetworkView` |
| `missionControlAI` | Mission Control AI | `MissionControlAIView` |
| `intelligenceCore` | Intelligence Core | `IntelligenceCoreView` |
| `commander` | Commander | `CommanderView` |
| `dailyCommandCenter` | Daily OS | `DailyCommandCenterView` |
| `aiAssassins` | AI Assassins | `AIAssassinsView` |
| `blackVault` | Black Vault | `BlackVaultView` |
| `operations` | Operations | `OperationsView` |
| `musicCommand` | Music Command | `MusicCommandView` |
| `infrastructure` | Infrastructure | `InfrastructureView` |
| `founderMode` | Founder Mode | `FounderModeView` |
| `aiCommander` | AI Commander | `AICommanderChatView` |
| `macCoreBridge` | Mac Core Bridge | `MacCoreBridgeView` |
| `splash` | Branding | `FounderBrandingView` |
| `settings` | Settings | `SettingsView` |

## Navigation Model

`RootView` uses one `NavigationStack`. The launch screen contains a primary Living Intelligence launch card, Commander Mode and Founder Operations launch cards, and a module grid generated from `AppRoute.allCases`.

Because the module grid iterates over every route, every route remains reachable from the root surface. The `destination(for:)` switch is exhaustive.

## Sprint 17 Routing Change

Sprint 17 added:

- `AppRoute.livingIntelligence`
- `LivingIntelligenceLaunchCard`
- `LivingIntelligenceView` destination

No existing route was removed.
