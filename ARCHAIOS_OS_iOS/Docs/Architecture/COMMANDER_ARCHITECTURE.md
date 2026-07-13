# Commander Architecture

## Purpose

Commander is the daily operating layer for ARCHAIOS OS. It connects briefings, mission status, command routing, agent status, and local intelligence memory.

## Main Surfaces

- `CommanderView` - earlier command dashboard with readiness, agents, briefing, and shortcuts.
- `AICommanderChatView` - chat-style command interface with saved prompts, mission templates, routing, history, and mock offline responses.
- `LivingCommanderView` - Headquarters-style launch mode with mission memory, work sessions, continuation, guidance, agents, and future bridge protocols.
- `LivingIntelligenceView` - Sprint 17 primary Commander workspace that unifies memory, decisions, knowledge, score, and resume state.

## Service Contracts

Commander uses `ArchaiosBackendService`, composed from:

- `CommanderProviding`
- `AgentNetworkProviding`
- `OperationsProviding`
- `InfrastructureProviding`
- `CommandRouting`
- future integration capability flags

The concrete service today is `MockArchaiosBackendService`.

## Persistence

Commander-adjacent SwiftData models include:

- `RemoteCommand`
- `ConversationMemory`
- `CommandTimelineEvent`
- `DailyBriefCard`
- `VoiceCommandDraft`
- `MissionControlCommand`
- `AgentStatusRecord`
- `WorkSessionRecord`
- `MissionContinuationRecord`
- `RecentlyViewedRecord`
- `CommanderMemoryRecord`
- `ResumeStateRecord`

## Local Intelligence

Commander guidance is local and deterministic. The app does not call an external model. Sprint 17 uses `LivingIntelligenceViewModel` for greeting, score generation, and recommendations.
