# SwiftData Models

SwiftData is the persistence layer for ARCHAIOS OS iOS. The model container is registered in `ARCHAIOS OS/ARCHAIOSOSApp.swift`.

## Registered Models

### Foundation and Sprint 5-13 Models

| Model | Purpose |
| --- | --- |
| `VaultEntry` | Local Black Vault item metadata. |
| `MissionRecord` | Early mission record for local mission tracking. |
| `FounderJournalEntry` | Founder journal entries with mood, energy, tags, and favorites. |
| `MusicProjectNote` | Music project notes, song ideas, lyrics, release tasks, and visual concepts. |
| `SavedMission` | Mission planner cards and scheduled missions. |
| `RemoteCommand` | Local command queue record for routed commands. |
| `ConversationMemory` | Saved AI Commander prompt/response memory. |
| `CommandTimelineEvent` | Chronological command and intelligence timeline events. |
| `LocalNotificationRecord` | Local notification center records. |
| `Conversation` | Founder Intelligence conversation record. |
| `Mission` | Mission Center record with priority, tags, and status. |
| `ResearchNote` | Local research memory. |
| `JournalEntry` | Personal knowledge and daily journal record. |
| `Reminder` | Local reminder record. |
| `KnowledgeNode` | Personal Knowledge Memory node. |
| `PromptTemplate` | Reusable prompt library record. |
| `Agent` | Agent console state. |
| `KnowledgeRelationship` | Relationship engine record for connected knowledge. |
| `DailyBriefCard` | Daily brief engine output. |
| `VoiceCommandDraft` | Voice Commander draft command. |
| `MissionControlCommand` | Mission Control routed command. |
| `AgentStatusRecord` | Agent Status Board record. |
| `WorkSessionRecord` | Living Commander work session lifecycle. |
| `MissionContinuationRecord` | Mission continuation and next action memory. |
| `RecentlyViewedRecord` | Mission Memory recently viewed state. |

### Sprint 17 Models

| Model | Purpose |
| --- | --- |
| `CommanderMemoryRecord` | Persistent Commander Memory: mission, sprint, objective, last context, active project, and resume point. |
| `IntelligenceRelationshipRecord` | Editable relationship object connecting mission, research, book, album, journal, idea, prompt, architecture, operation, and conversation concepts. |
| `ExecutiveDecisionRecord` | Local decision card with evidence, confidence, alternatives, risks, recommendation, final decision, and review date. |
| `KnowledgeCollectionRecord` | Searchable local knowledge collection for books, research, prompt library, architecture, Black Vault, music, military, philosophy, and ideas. |
| `ResumeStateRecord` | Local resume state: screen, scroll marker, mission, selected research, draft prompt, open journal, and last sprint. |

## Migration Notes

Sprint 17 adds new models to the existing schema. Because the project uses SwiftData local persistence, future schema changes should be additive when possible. Avoid deleting or renaming model properties without a migration plan.

## Audit Notes

- Sprint 17 model registration is present in `ARCHAIOSOSApp.swift`.
- The new models are not network-backed.
- The new models do not store secrets, API keys, or credentials.
