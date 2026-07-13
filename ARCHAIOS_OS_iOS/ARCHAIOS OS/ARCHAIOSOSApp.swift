import SwiftData
import SwiftUI

@main
struct ARCHAIOSOSApp: App {
    @StateObject private var container = AppContainer.preview

    private let modelContainer: ModelContainer = {
        let schema = Schema([
            VaultEntry.self,
            MissionRecord.self,
            FounderJournalEntry.self,
            MusicProjectNote.self,
            SavedMission.self,
            RemoteCommand.self,
            ConversationMemory.self,
            CommandTimelineEvent.self,
            LocalNotificationRecord.self,
            Conversation.self,
            Mission.self,
            ResearchNote.self,
            JournalEntry.self,
            Reminder.self,
            KnowledgeNode.self,
            PromptTemplate.self,
            Agent.self,
            KnowledgeRelationship.self,
            DailyBriefCard.self,
            VoiceCommandDraft.self,
            MissionControlCommand.self,
            AgentStatusRecord.self,
            WorkSessionRecord.self,
            MissionContinuationRecord.self,
            RecentlyViewedRecord.self,
            CommanderMemoryRecord.self,
            IntelligenceRelationshipRecord.self,
            ExecutiveDecisionRecord.self,
            KnowledgeCollectionRecord.self,
            ResumeStateRecord.self,
            OperationalMissionRecord.self,
            LocalMarkdownExportRecord.self,
            DailyOperationalBriefRecord.self,
            DailyIntelligenceCycleRecord.self,
            FounderMemorySnapshotRecord.self,
            LocalIntelligenceReportRecord.self,
            DecisionRecord.self,
            DailyBriefRecord.self,
            LegacyRecord.self,
            CommanderSession.self,
            ExecutiveDashboardState.self,
            MissionQueueState.self,
            MissionHistory.self,
            FounderDecision.self,
            DailyReflection.self,
            ResearchConnection.self,
            IntelligenceInsight.self,
            LegacyEntry.self
        ])
        let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            fatalError("Unable to create SwiftData container: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(container)
                .environmentObject(container.themeManager)
        }
        .modelContainer(modelContainer)
    }
}
