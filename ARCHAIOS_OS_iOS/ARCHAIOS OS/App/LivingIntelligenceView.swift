// Sprint 19 primary Commander workspace for the local-first Living Intelligence Operating System.
import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

private enum IntelligenceObjectType: String, CaseIterable, Identifiable {
    case mission = "Mission"
    case research = "Research"
    case person = "Person"
    case book = "Book"
    case technology = "Technology"
    case album = "Album"
    case journal = "Journal"
    case idea = "Idea"
    case prompt = "Prompt"
    case architecture = "Architecture"
    case operation = "Operation"
    case sprint = "Sprint"
    case artwork = "Artwork"
    case engineering = "Engineering"
    case conversation = "Conversation"

    var id: String { rawValue }

    var symbol: String {
        switch self {
        case .mission: "target"
        case .research: "magnifyingglass"
        case .person: "person.crop.circle"
        case .book: "book.closed.fill"
        case .technology: "cpu.fill"
        case .album: "music.note.list"
        case .journal: "book.pages.fill"
        case .idea: "lightbulb.fill"
        case .prompt: "text.bubble.fill"
        case .architecture: "building.2.fill"
        case .operation: "scope"
        case .sprint: "flag.checkered"
        case .artwork: "paintpalette.fill"
        case .engineering: "hammer.fill"
        case .conversation: "bubble.left.and.bubble.right.fill"
        }
    }
}

private enum KnowledgeCollectionCategory: String, CaseIterable, Identifiable {
    case books = "Books"
    case research = "Research"
    case promptLibrary = "Prompt Library"
    case architecture = "Architecture"
    case blackVault = "Black Vault"
    case music = "Music"
    case military = "Military"
    case philosophy = "Philosophy"
    case ideas = "Ideas"

    var id: String { rawValue }
}

private enum DailyIntelligencePhase: String, CaseIterable, Identifiable {
    case morningBrief = "Morning Brief"
    case missionExecution = "Mission Execution"
    case researchCollection = "Research Collection"
    case journalReflection = "Journal Reflection"
    case eveningDebrief = "Evening Debrief"

    var id: String { rawValue }
}

private struct LivingKnowledgeGraphNode: Identifiable, Hashable {
    let id: String
    let title: String
    let type: IntelligenceObjectType
    let detail: String
    let date: Date
    let weight: Int
}

private struct ExplorerLine: Identifiable {
    let id = UUID()
    let section: String
    let detail: String
    let status: SystemStatus
}

private struct SuggestionLine: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let status: SystemStatus
}

struct LivingIntelligenceLaunchCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \CommanderMemoryRecord.updatedAt, order: .reverse) private var memory: [CommanderMemoryRecord]
    @Query(sort: \ResumeStateRecord.updatedAt, order: .reverse) private var resume: [ResumeStateRecord]
    @Query(sort: \ExecutiveDecisionRecord.createdAt, order: .reverse) private var decisions: [ExecutiveDecisionRecord]
    @Query(sort: \IntelligenceRelationshipRecord.createdAt, order: .reverse) private var relationships: [IntelligenceRelationshipRecord]

    var body: some View {
        CommandCard(title: "Living Intelligence", systemImage: "brain.filled.head.profile") {
            Text("Permanent Executive Intelligence System")
                .font(.title3.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            Text(memory.first?.resumePoint ?? "Restore commander memory, decisions, relationships, timeline, and resume context.")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Current Sprint", value: memory.first?.currentSprint ?? "Sprint 19", context: "Auto-restored")
                MetricCard(title: "Current Screen", value: resume.first?.currentScreen ?? "Living Intelligence", context: "Resume engine")
                MetricCard(title: "Decisions", value: "\(decisions.count)", context: "Executive engine")
                MetricCard(title: "Relations", value: "\(relationships.count)", context: "Knowledge graph")
            }
        }
    }
}

struct LivingIntelligenceView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @State private var viewModel = LivingIntelligenceViewModel()
    @Query(sort: \CommanderMemoryRecord.updatedAt, order: .reverse) private var commanderMemory: [CommanderMemoryRecord]
    @Query(sort: \ResumeStateRecord.updatedAt, order: .reverse) private var resumeStates: [ResumeStateRecord]
    @Query(sort: \IntelligenceRelationshipRecord.createdAt, order: .reverse) private var relationships: [IntelligenceRelationshipRecord]
    @Query(sort: \ExecutiveDecisionRecord.createdAt, order: .reverse) private var decisions: [ExecutiveDecisionRecord]
    @Query(sort: \KnowledgeCollectionRecord.createdAt, order: .reverse) private var collections: [KnowledgeCollectionRecord]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var legacyConversations: [ConversationMemory]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timeline: [CommandTimelineEvent]
    @Query(sort: \WorkSessionRecord.startedAt, order: .reverse) private var sessions: [WorkSessionRecord]
    @Query(sort: \MissionContinuationRecord.updatedAt, order: .reverse) private var continuations: [MissionContinuationRecord]
    @Query(sort: \DailyIntelligenceCycleRecord.updatedAt, order: .reverse) private var dailyCycle: [DailyIntelligenceCycleRecord]
    @Query(sort: \FounderMemorySnapshotRecord.updatedAt, order: .reverse) private var founderMemory: [FounderMemorySnapshotRecord]
    @Query(sort: \LocalIntelligenceReportRecord.createdAt, order: .reverse) private var localReports: [LocalIntelligenceReportRecord]
    @State private var memoryMission = ""
    @State private var memorySprint = "Sprint 19"
    @State private var memoryObjective = ""
    @State private var memoryResume = ""
    @State private var sourceType = IntelligenceObjectType.mission
    @State private var sourceTitle = ""
    @State private var targetType = IntelligenceObjectType.research
    @State private var targetTitle = ""
    @State private var relationNote = ""
    @State private var decisionText = ""
    @State private var evidenceText = ""
    @State private var confidence = 82.0
    @State private var alternativesText = ""
    @State private var risksText = ""
    @State private var recommendationText = ""
    @State private var finalDecisionText = ""
    @State private var reviewDate = Date.now
    @State private var collectionTitle = ""
    @State private var collectionBody = ""
    @State private var collectionCategory = KnowledgeCollectionCategory.research
    @State private var draftPrompt = ""
    @State private var selectedResearch = ""
    @State private var openJournal = ""
    @State private var selectedGraphNodeTitle = ""
    @State private var selectedCyclePhase = DailyIntelligencePhase.morningBrief
    @State private var cycleSummary = ""
    @State private var latestReportPreview = ""
    @State private var pulse = false

    private var memory: CommanderMemoryRecord? { commanderMemory.first }
    private var resume: ResumeStateRecord? { resumeStates.first }

    private var score: IntelligenceScoreSummary {
        viewModel.score(
            completedMissions: missions.filter { $0.status == RemoteCommandStatus.complete.label }.count + savedMissions.filter(\.isComplete).count,
            openMissions: openMissionCount,
            architectureSessions: sessions.filter { $0.title.localizedCaseInsensitiveContains("architecture") || $0.notes.localizedCaseInsensitiveContains("architecture") }.count,
            researchSessions: research.count,
            promptCount: prompts.count + collections.filter { $0.category == KnowledgeCollectionCategory.promptLibrary.rawValue }.count,
            journalCount: founderJournal.count + journal.count,
            documentationCount: vault.count + timeline.filter { $0.title.localizedCaseInsensitiveContains("report") }.count
        )
    }

    private var openMissionCount: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    var body: some View {
        VStack(spacing: 0) {
            ScrollViewReader { proxy in
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        executiveDashboard.id("Commander")
                        founderIntelligenceDashboard
                        commanderMemoryPanel.id("Memory")
                        intelligenceScorePanel
                        knowledgeGraphPanel
                        relationshipExplorerPanel
                        dailyIntelligenceCyclePanel
                        founderMemoryPanel
                        intelligenceSuggestionsPanel
                        decisionEnginePanel
                        knowledgeEnginePanel.id("Research")
                        livingTimelinePanel
                        localReportsPanel
                        resumeEnginePanel
                    }
                    .padding()
                }
                .onChange(of: viewModel.selectedDock) { _, value in
                    withAnimation(.easeInOut(duration: 0.3)) {
                        proxy.scrollTo(value, anchor: .top)
                    }
                    updateResume(screen: value)
                }
            }
            commanderDock
        }
        .background(themeManager.theme.background)
        .navigationTitle("Living Intelligence")
        .onAppear {
            pulse = true
            restoreCommanderMemory()
        }
    }

    private var executiveDashboard: some View {
        CommandCard(title: "Executive Dashboard", systemImage: "building.columns.fill") {
            HStack(alignment: .center, spacing: 16) {
                readinessRing
                VStack(alignment: .leading, spacing: 8) {
                    Text(viewModel.greeting())
                        .font(.title3.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text(memory?.currentObjective ?? "Unify every local intelligence surface into one executive system.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Daily Recommendation: \(dailyRecommendation)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Current Sprint", value: memory?.currentSprint ?? "Sprint 19", context: "Living Intelligence")
                MetricCard(title: "Readiness", value: "\(score.missionReadiness)%", context: "\(openMissionCount) pending")
                MetricCard(title: "Architecture", value: "\(score.architectureProgress)%", context: "Progress")
                MetricCard(title: "Objectives", value: "\(todayObjectives.count)", context: todayObjectives.first ?? "Set objective")
                MetricCard(title: "Discoveries", value: "\(recentDiscoveries.count)", context: recentDiscoveries.first ?? "No discoveries")
                MetricCard(title: "Research", value: research.first?.title ?? "None", context: "Current")
                MetricCard(title: "Book", value: currentBook, context: "Current book")
                MetricCard(title: "Album", value: music.first?.project ?? "None", context: music.first?.title ?? "Current album")
            }
        }
    }

    private var commanderMemoryPanel: some View {
        CommandCard(title: "Commander Memory", systemImage: "brain.head.profile") {
            TextField("Current Mission", text: $memoryMission, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Current Sprint", text: $memorySprint).livingIntelligenceField(themeManager)
            TextField("Current Objective", text: $memoryObjective, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Resume Point", text: $memoryResume, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Commander Memory", systemImage: "externaldrive.fill") {
                saveCommanderMemory()
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Last Mission", value: memory?.lastMission ?? "None", context: "Restored")
                MetricCard(title: "Last Conversation", value: memory?.lastConversation ?? "None", context: "Restored")
                MetricCard(title: "Last Journal", value: memory?.lastJournal ?? "None", context: "Restored")
                MetricCard(title: "Last Research", value: memory?.lastResearch ?? "None", context: "Restored")
                MetricCard(title: "Active Project", value: memory?.activeProject ?? "ARCHAIOS OS", context: "Local")
                MetricCard(title: "Resume Point", value: memory?.resumePoint ?? "Living Intelligence", context: "Auto restore")
            }
        }
    }

    private var founderIntelligenceDashboard: some View {
        CommandCard(title: "Founder Intelligence Dashboard", systemImage: "rectangle.grid.3x2.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Today's Focus", value: todayFocus, context: "Local brief")
                MetricCard(title: "Current Mission", value: activeMission, context: "Mission graph")
                MetricCard(title: "Recent Intel", value: recentIntelligence, context: "Newest signal")
                MetricCard(title: "Newest Research", value: research.first?.title ?? "None", context: "\(research.count) notes")
                MetricCard(title: "Newest Journal", value: founderJournal.first?.title ?? journal.first?.title ?? "None", context: "\(founderJournal.count + journal.count) entries")
                MetricCard(title: "Engineering", value: recentEngineering, context: "\(sessions.count) work sessions")
                MetricCard(title: "Music", value: music.first?.title ?? "None", context: music.first?.project ?? "Recent music")
                MetricCard(title: "System Health", value: systemHealthLabel, context: "No network required")
                MetricCard(title: "Relationships", value: "\(missionRelationships.count)", context: "Mission links")
                MetricCard(title: "Growth", value: "\(graphNodes.count)", context: "Knowledge nodes")
            }
        }
    }

    private var intelligenceScorePanel: some View {
        CommandCard(title: "Intelligence Score", systemImage: "gauge.with.dots.needle.67percent") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Mission Readiness", value: "\(score.missionReadiness)%", context: "Completion + queue")
                MetricCard(title: "Knowledge Growth", value: "\(score.knowledgeGrowth)%", context: "Research + prompts")
                MetricCard(title: "Architecture", value: "\(score.architectureProgress)%", context: "Sessions + docs")
                MetricCard(title: "Consistency", value: "\(score.consistency)%", context: "Journal rhythm")
            }
        }
    }

    private var knowledgeGraphPanel: some View {
        CommandCard(title: "Knowledge Graph", systemImage: "point.3.connected.trianglepath.dotted") {
            Text("Local graph: \(graphNodes.count) nodes, \(relationships.count + inferredRelationshipCount) relationships")
                .font(.caption.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 112), spacing: 10)], spacing: 10) {
                ForEach(graphNodes.prefix(28)) { node in
                    Button {
                        selectedGraphNodeTitle = node.title
                        relationNote = "Exploring \(node.title)"
                        Haptics.selection()
                    } label: {
                        VStack(alignment: .leading, spacing: 7) {
                            Image(systemName: node.type.symbol)
                                .font(.headline)
                                .foregroundStyle(themeManager.theme.heading)
                            Text(node.type.rawValue)
                                .font(.caption2.weight(.black))
                                .foregroundStyle(themeManager.theme.text.opacity(0.54))
                            Text(node.title)
                                .font(.caption.weight(.bold))
                                .lineLimit(2)
                                .foregroundStyle(themeManager.theme.text)
                            ProgressView(value: Double(min(node.weight, 10)), total: 10)
                                .tint(themeManager.theme.heading)
                        }
                        .frame(maxWidth: .infinity, minHeight: 112, alignment: .topLeading)
                        .padding(10)
                        .background(selectedGraphNodeTitle == node.title ? themeManager.theme.heading.opacity(0.18) : themeManager.theme.elevatedPanel)
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }
            HStack {
                Picker("Source", selection: $sourceType) {
                    ForEach(IntelligenceObjectType.allCases) { item in Text(item.rawValue).tag(item) }
                }
                Picker("Target", selection: $targetType) {
                    ForEach(IntelligenceObjectType.allCases) { item in Text(item.rawValue).tag(item) }
                }
            }
            .pickerStyle(.menu)
            TextField("Source title", text: $sourceTitle).livingIntelligenceField(themeManager)
            TextField("Target title", text: $targetTitle).livingIntelligenceField(themeManager)
            TextField("Relationship notes", text: $relationNote, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Create Relationship", systemImage: "link.circle.fill") {
                createRelationship()
            }
            ForEach(relationships.prefix(6)) { item in
                TimelineRow(title: "\(item.sourceType): \(item.sourceTitle)", detail: "\(item.relation) -> \(item.targetType): \(item.targetTitle) | \(item.notes)", status: .green)
            }
        }
    }

    private var relationshipExplorerPanel: some View {
        CommandCard(title: "Relationship Explorer", systemImage: "point.topleft.down.curvedto.point.bottomright.up.fill") {
            Picker("Node", selection: $selectedGraphNodeTitle) {
                ForEach(graphNodes.prefix(40)) { node in
                    Text(node.title).tag(node.title)
                }
            }
            .pickerStyle(.menu)
            if selectedExplorerItems.isEmpty {
                EmptyStateView(title: "No related knowledge found", detail: "Select or create a graph node to reveal local mission relationships.", systemImage: "link")
            } else {
                ForEach(selectedExplorerItems.prefix(14)) { item in
                    TimelineRow(title: item.section, detail: item.detail, status: item.status)
                }
            }
        }
    }

    private var dailyIntelligenceCyclePanel: some View {
        CommandCard(title: "Daily Intelligence Cycle", systemImage: "arrow.triangle.2.circlepath.circle.fill") {
            HStack(spacing: 6) {
                ForEach(DailyIntelligencePhase.allCases) { phase in
                    VStack(spacing: 5) {
                        Image(systemName: dailyCycle.contains { $0.phase == phase.rawValue && $0.isComplete } ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(dailyCycle.contains { $0.phase == phase.rawValue && $0.isComplete } ? themeManager.theme.success : themeManager.theme.heading)
                        Text(phase.rawValue)
                            .font(.caption2.weight(.bold))
                            .multilineTextAlignment(.center)
                            .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    }
                    .frame(maxWidth: .infinity)
                }
            }
            Picker("Cycle phase", selection: $selectedCyclePhase) {
                ForEach(DailyIntelligencePhase.allCases) { phase in
                    Text(phase.rawValue).tag(phase)
                }
            }
            .pickerStyle(.menu)
            TextField("Cycle summary", text: $cycleSummary, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Cycle Phase", systemImage: "checkmark.seal.fill") {
                saveDailyCyclePhase()
            }
            ForEach(DailyIntelligencePhase.allCases) { phase in
                let record = dailyCycle.first { $0.phase == phase.rawValue }
                TimelineRow(title: phase.rawValue, detail: record?.summary ?? defaultCycleSummary(for: phase), status: record?.isComplete == true ? .green : .standby)
            }
        }
    }

    private var founderMemoryPanel: some View {
        CommandCard(title: "Founder Memory", systemImage: "person.crop.square.filled.and.at.rectangle.fill") {
            let snapshot = founderMemory.first
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Favorite Missions", value: snapshot?.favoriteMissions ?? favoriteMissions, context: "Remembered")
                MetricCard(title: "Favorite Prompts", value: snapshot?.favoritePrompts ?? favoritePrompts, context: "Prompt memory")
                MetricCard(title: "Recent Searches", value: snapshot?.recentSearches ?? recentSearches, context: "Knowledge engine")
                MetricCard(title: "Recent Research", value: snapshot?.recentResearch ?? research.first?.title ?? "None", context: "Research memory")
                MetricCard(title: "Last Journal", value: snapshot?.lastJournal ?? founderJournal.first?.title ?? journal.first?.title ?? "None", context: "Reflection")
                MetricCard(title: "Last Sprint", value: snapshot?.lastSprint ?? memorySprint, context: "Sprint memory")
                MetricCard(title: "Commander", value: snapshot?.lastCommanderSession ?? memory?.lastConversation ?? "None", context: "Session")
                MetricCard(title: "Engineering", value: snapshot?.lastEngineeringWork ?? recentEngineering, context: "Build work")
                MetricCard(title: "Music", value: snapshot?.recentMusicWork ?? music.first?.title ?? "None", context: "Album notes")
            }
            CommanderButton(title: "Refresh Founder Memory", systemImage: "arrow.clockwise.circle.fill") {
                refreshFounderMemory()
            }
        }
    }

    private var intelligenceSuggestionsPanel: some View {
        CommandCard(title: "Intelligence Suggestions", systemImage: "sparkles.rectangle.stack.fill") {
            ForEach(localSuggestions) { suggestion in
                TimelineRow(title: suggestion.title, detail: suggestion.detail, status: suggestion.status)
            }
        }
    }

    private var decisionEnginePanel: some View {
        CommandCard(title: "Executive Decision Engine", systemImage: "checkmark.seal.fill") {
            TextField("Decision", text: $decisionText, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Evidence", text: $evidenceText, axis: .vertical).livingIntelligenceField(themeManager)
            VStack(alignment: .leading, spacing: 6) {
                Text("Confidence \(Int(confidence))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Slider(value: $confidence, in: 0...100).tint(themeManager.theme.heading)
            }
            TextField("Alternatives", text: $alternativesText, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Risks", text: $risksText, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Recommendation", text: $recommendationText, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Final Decision", text: $finalDecisionText, axis: .vertical).livingIntelligenceField(themeManager)
            DatePicker("Review Date", selection: $reviewDate, displayedComponents: .date)
                .foregroundStyle(themeManager.theme.text)
            CommanderButton(title: "Save Decision", systemImage: "tray.and.arrow.down.fill") {
                saveDecision()
            }
            ForEach(decisions.prefix(4)) { item in
                VStack(alignment: .leading, spacing: 4) {
                    Text(item.decision).font(.subheadline.weight(.black)).foregroundStyle(themeManager.theme.heading)
                    Text("Evidence: \(item.evidence)")
                    Text("Confidence: \(item.confidence)% | Review: \(item.reviewDate.formatted(date: .abbreviated, time: .omitted))")
                    Text("Recommendation: \(item.recommendation)")
                    Text("Final: \(item.finalDecision)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .padding(.vertical, 5)
            }
        }
    }

    private var knowledgeEnginePanel: some View {
        CommandCard(title: "Knowledge Engine", systemImage: "books.vertical.fill") {
            TextField("Search all collections", text: $viewModel.searchText).livingIntelligenceField(themeManager)
            Picker("Category", selection: $collectionCategory) {
                ForEach(KnowledgeCollectionCategory.allCases) { item in Text(item.rawValue).tag(item) }
            }
            .pickerStyle(.segmented)
            TextField("Collection title", text: $collectionTitle).livingIntelligenceField(themeManager)
            TextField("Collection body", text: $collectionBody, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Knowledge Item", systemImage: "plus.circle.fill") {
                saveKnowledgeItem()
            }
            ForEach(searchResults.prefix(10), id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    .padding(.vertical, 2)
            }
        }
    }

    private var livingTimelinePanel: some View {
        CommandCard(title: "Living Timeline", systemImage: "timeline.selection") {
            ForEach(livingTimeline.prefix(12), id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.75))
                    .padding(.vertical, 2)
            }
        }
    }

    private var localReportsPanel: some View {
        CommandCard(title: "Local Intelligence Reports", systemImage: "doc.text.magnifyingglass") {
            CommanderButton(title: "Generate Sprint 19 Reports", systemImage: "doc.badge.gearshape.fill") {
                generateLocalReports()
            }
            if !latestReportPreview.isEmpty {
                Text(latestReportPreview)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.76))
                    .textSelection(.enabled)
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
            ForEach(localReports.prefix(5)) { report in
                TimelineRow(title: report.title, detail: "\(report.kind) | \(report.createdAt.formatted(date: .abbreviated, time: .shortened))", status: .green)
            }
        }
    }

    private var resumeEnginePanel: some View {
        CommandCard(title: "Resume Engine", systemImage: "arrowshape.turn.up.right.circle.fill") {
            TextField("Selected Research", text: $selectedResearch).livingIntelligenceField(themeManager)
            TextField("Draft Prompt", text: $draftPrompt, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Open Journal", text: $openJournal).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Resume State", systemImage: "bookmark.fill") {
                saveResumeState()
            }
            TimelineRow(title: resume?.currentScreen ?? "Living Intelligence", detail: "Scroll \(Int(resume?.scrollPosition ?? 0)) | Mission \(resume?.mission ?? activeMission) | Research \(resume?.selectedResearch ?? "None") | Sprint \(resume?.lastSprint ?? "Sprint 19")", status: .standby)
        }
    }

    private var commanderDock: some View {
        HStack(spacing: 8) {
            dockButton("Mission", "target")
            dockButton("Commander", "scope")
            dockButton("Memory", "brain")
            dockButton("Research", "magnifyingglass")
            NavigationLink(value: AppRoute.blackVault) {
                dockLabel("Black Vault", "archivebox")
            }
            NavigationLink(value: AppRoute.settings) {
                dockLabel("Settings", "gearshape")
            }
        }
        .padding(10)
        .background(themeManager.theme.panel)
    }

    private var readinessRing: some View {
        ZStack {
            Circle().stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(score.missionReadiness) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(score.missionReadiness)%").font(.title3.weight(.black))
                Text("Intel").font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 102, height: 102)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.35).repeatForever(autoreverses: true), value: pulse)
    }

    private func dockButton(_ title: String, _ symbol: String) -> some View {
        Button {
            viewModel.selectedDock = title == "Mission" ? "Commander" : title
        } label: {
            dockLabel(title, symbol)
        }
        .buttonStyle(.plain)
    }

    private func dockLabel(_ title: String, _ symbol: String) -> some View {
        Label(title, systemImage: symbol)
            .font(.caption2.weight(.black))
            .lineLimit(1)
            .padding(.horizontal, 8)
            .padding(.vertical, 8)
            .foregroundStyle(viewModel.selectedDock == title ? .black : themeManager.theme.heading)
            .background(viewModel.selectedDock == title ? themeManager.theme.heading : themeManager.theme.elevatedPanel)
            .clipShape(Capsule())
    }

    private var activeMission: String {
        missions.first { $0.status != RemoteCommandStatus.complete.label }?.title ??
            savedMissions.first { !$0.isComplete }?.title ??
            "Living Intelligence Engine"
    }

    private var currentBook: String {
        collections.first { $0.category == KnowledgeCollectionCategory.books.rawValue }?.title ?? "None"
    }

    private var todayObjectives: [String] {
        let objective = memory?.currentObjective ?? "Update commander memory"
        return [objective, "Review pending missions", "Save one decision"]
    }

    private var recentDiscoveries: [String] {
        let items = research.map(\.title) + vault.map(\.title) + collections.map(\.title)
        return Array(items.prefix(4))
    }

    private var dailyRecommendation: String {
        viewModel.recommendation(
            openMissions: openMissionCount,
            researchCount: research.count,
            promptCount: prompts.count,
            journalCount: founderJournal.count + journal.count
        )
    }

    private var todayFocus: String {
        dailyCycle.first { $0.phase == DailyIntelligencePhase.morningBrief.rawValue }?.summary ?? memory?.currentObjective ?? "Build the Living Intelligence Engine."
    }

    private var recentIntelligence: String {
        decisions.first?.decision ?? relationships.first?.targetTitle ?? collections.first?.title ?? "No intelligence yet"
    }

    private var recentEngineering: String {
        sessions.first?.title ??
            collections.first { $0.category == KnowledgeCollectionCategory.architecture.rawValue }?.title ??
            "Living Intelligence Engine"
    }

    private var systemHealthLabel: String {
        localReports.isEmpty ? "Local Ready" : "Reports Ready"
    }

    private var favoriteMissions: String {
        let favorites = missions.filter { $0.priority == CommandPriority.critical.rawValue || $0.priority == CommandPriority.high.rawValue }.map(\.title) +
            savedMissions.filter { $0.priority == "Critical" }.map(\.title)
        return favorites.first ?? activeMission
    }

    private var favoritePrompts: String {
        prompts.first { $0.isFavorite }?.title ?? prompts.first?.title ?? draftPrompt.ifEmpty("None")
    }

    private var recentSearches: String {
        viewModel.searchText.ifEmpty(resume?.selectedResearch ?? "None")
    }

    private var missionRelationships: [IntelligenceRelationshipRecord] {
        relationships.filter { item in
            item.sourceTitle.localizedCaseInsensitiveContains(activeMission) ||
                item.targetTitle.localizedCaseInsensitiveContains(activeMission) ||
                activeMission.localizedCaseInsensitiveContains(item.sourceTitle) ||
                activeMission.localizedCaseInsensitiveContains(item.targetTitle)
        }
    }

    private var inferredRelationshipCount: Int {
        graphNodes.reduce(0) { total, node in
            total + graphNodes.filter { other in
                other.id != node.id && sharesKeyword(node.title, other.title)
            }.count
        } / 2
    }

    private var graphNodes: [LivingKnowledgeGraphNode] {
        var nodes: [LivingKnowledgeGraphNode] = []
        nodes += missions.map { LivingKnowledgeGraphNode(id: "mission-\($0.id)", title: $0.title, type: .mission, detail: $0.notes, date: $0.createdAt, weight: $0.status == RemoteCommandStatus.complete.label ? 8 : 10) }
        nodes += savedMissions.map { LivingKnowledgeGraphNode(id: "saved-\($0.id)", title: $0.title, type: .mission, detail: $0.checklistText, date: $0.createdAt, weight: $0.isComplete ? 7 : 9) }
        nodes += research.map { LivingKnowledgeGraphNode(id: "research-\($0.id)", title: $0.title, type: .research, detail: $0.body, date: $0.createdAt, weight: 8) }
        nodes += founderJournal.map { LivingKnowledgeGraphNode(id: "founder-journal-\($0.id)", title: $0.title, type: .journal, detail: $0.body, date: $0.createdAt, weight: $0.isFavorite ? 9 : 6) }
        nodes += journal.map { LivingKnowledgeGraphNode(id: "journal-\($0.id)", title: $0.title, type: .journal, detail: $0.body, date: $0.createdAt, weight: 6) }
        nodes += music.map { LivingKnowledgeGraphNode(id: "music-\($0.id)", title: "\($0.project): \($0.title)", type: .album, detail: $0.note, date: $0.createdAt, weight: $0.isFavorite ? 9 : 7) }
        nodes += vault.map { LivingKnowledgeGraphNode(id: "vault-\($0.id)", title: $0.title, type: .idea, detail: $0.tagLine, date: $0.createdAt, weight: $0.importance) }
        nodes += prompts.map { LivingKnowledgeGraphNode(id: "prompt-\($0.id)", title: $0.title, type: .prompt, detail: $0.prompt, date: $0.createdAt, weight: $0.isFavorite ? 9 : 6) }
        nodes += collections.map { item in
            LivingKnowledgeGraphNode(id: "collection-\(item.id)", title: item.title, type: graphType(for: item.category), detail: item.body, date: item.createdAt, weight: item.isFavorite ? 9 : 6)
        }
        nodes += decisions.map { LivingKnowledgeGraphNode(id: "decision-\($0.id)", title: $0.decision, type: .operation, detail: $0.finalDecision.ifEmpty($0.recommendation), date: $0.createdAt, weight: max(1, min(10, $0.confidence / 10))) }
        nodes += sessions.map { LivingKnowledgeGraphNode(id: "engineering-\($0.id)", title: $0.title, type: .engineering, detail: $0.notes, date: $0.startedAt, weight: 7) }
        nodes += timeline.filter { $0.title.localizedCaseInsensitiveContains("Sprint") || $0.detail.localizedCaseInsensitiveContains("Sprint") }
            .map { LivingKnowledgeGraphNode(id: "sprint-\($0.id)", title: $0.title, type: .sprint, detail: $0.detail, date: $0.createdAt, weight: 8) }
        if nodes.isEmpty {
            nodes.append(LivingKnowledgeGraphNode(id: "seed-living-intelligence", title: "Living Intelligence Engine", type: .operation, detail: "Sprint 19 local knowledge graph seed.", date: .now, weight: 10))
        }
        return nodes.sorted { lhs, rhs in
            if lhs.weight == rhs.weight { return lhs.date > rhs.date }
            return lhs.weight > rhs.weight
        }
    }

    private var selectedNode: LivingKnowledgeGraphNode? {
        graphNodes.first { $0.title == selectedGraphNodeTitle } ?? graphNodes.first
    }

    private var selectedExplorerItems: [ExplorerLine] {
        guard let selectedNode else { return [] }
        var output: [ExplorerLine] = []
        output += relationships.filter { relation in
            relation.sourceTitle.localizedCaseInsensitiveContains(selectedNode.title) ||
                relation.targetTitle.localizedCaseInsensitiveContains(selectedNode.title) ||
                selectedNode.title.localizedCaseInsensitiveContains(relation.sourceTitle) ||
                selectedNode.title.localizedCaseInsensitiveContains(relation.targetTitle)
        }.map { relation in
            ExplorerLine(section: "\(relation.sourceType) -> \(relation.targetType)", detail: "\(relation.sourceTitle) connects to \(relation.targetTitle). \(relation.notes)", status: .green)
        }
        output += graphNodes.filter { node in
            node.id != selectedNode.id && sharesKeyword(node.title + " " + node.detail, selectedNode.title + " " + selectedNode.detail)
        }.prefix(12).map { node in
            ExplorerLine(section: "Related \(node.type.rawValue)", detail: "\(node.title) | \(node.detail)", status: node.type == .mission ? .green : .standby)
        }
        return output
    }

    private var localSuggestions: [SuggestionLine] {
        var output: [SuggestionLine] = []
        if openMissionCount > 0 { output.append(SuggestionLine(title: "Continue Mission", detail: activeMission, status: .green)) }
        if !research.isEmpty { output.append(SuggestionLine(title: "Resume Research", detail: research.first?.title ?? "Research queue", status: .standby)) }
        if vault.count < 5 { output.append(SuggestionLine(title: "Expand Black Vault", detail: "Add a local intelligence note or document.", status: .amber)) }
        if memorySprint != "Sprint 19" || localReports.isEmpty { output.append(SuggestionLine(title: "Finish Sprint", detail: "Generate Sprint 19 reports and refresh Founder Memory.", status: .green)) }
        if !sessions.isEmpty || recentEngineering != "Living Intelligence Engine" { output.append(SuggestionLine(title: "Review Engineering", detail: recentEngineering, status: .standby)) }
        output.append(SuggestionLine(title: "Update Documentation", detail: "Keep Living Intelligence docs aligned with local-first rules.", status: .standby))
        if !music.isEmpty { output.append(SuggestionLine(title: "Continue Album Notes", detail: music.first?.title ?? "Music work", status: .standby)) }
        output.append(SuggestionLine(title: "Review Journal", detail: founderJournal.first?.title ?? journal.first?.title ?? "Capture today's reflection.", status: founderJournal.isEmpty && journal.isEmpty ? .amber : .green))
        return output
    }

    private var searchResults: [String] {
        let base = collections.map { "\($0.category): \($0.title) - \($0.body)" } +
            research.map { "Research: \($0.title) - \($0.body)" } +
            prompts.map { "Prompt Library: \($0.title) - \($0.prompt)" } +
            vault.map { "Black Vault: \($0.title) - \($0.tagLine)" } +
            music.map { "Music: \($0.title) - \($0.note)" } +
            founderJournal.map { "Journal: \($0.title) - \($0.body)" }
        let needle = viewModel.searchText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !needle.isEmpty else { return Array(base.prefix(12)) }
        return base.filter { $0.localizedCaseInsensitiveContains(needle) }
    }

    private var livingTimeline: [String] {
        let sprintReports = timeline.filter { $0.title.localizedCaseInsensitiveContains("Sprint") || $0.detail.localizedCaseInsensitiveContains("Sprint") }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Sprint Reports | \($0.title)" }
        let missionReports = missions.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Mission Reports | \($0.title)" }
        let journalItems = founderJournal.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Journal Entries | \($0.title)" }
        let researchItems = research.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Research Sessions | \($0.title)" }
        let bookItems = collections.filter { $0.category == KnowledgeCollectionCategory.books.rawValue }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Books | \($0.title)" }
        let artworkItems = collections.filter { $0.category == KnowledgeCollectionCategory.ideas.rawValue || $0.category == KnowledgeCollectionCategory.blackVault.rawValue }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Artwork / Ideas | \($0.title)" }
        let albumItems = music.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Albums | \($0.project): \($0.title)" }
        let architectureItems = collections.filter { $0.category == KnowledgeCollectionCategory.architecture.rawValue }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Architecture | \($0.title)" } +
            sessions.map { "\($0.startedAt.formatted(date: .abbreviated, time: .shortened)) | Engineering | \($0.title)" }
        let operationItems = timeline.filter { $0.category.localizedCaseInsensitiveContains("Operation") }.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Operations | \($0.title)" }
        let commanderItems = decisions.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Commander Decisions | \($0.decision)" }
        return (sprintReports + missionReports + journalItems + researchItems + bookItems + artworkItems + albumItems + architectureItems + operationItems + commanderItems).sorted(by: >)
    }

    private func graphType(for category: String) -> IntelligenceObjectType {
        if category == KnowledgeCollectionCategory.books.rawValue { return .book }
        if category == KnowledgeCollectionCategory.music.rawValue { return .album }
        if category == KnowledgeCollectionCategory.architecture.rawValue { return .architecture }
        if category == KnowledgeCollectionCategory.research.rawValue { return .research }
        if category == KnowledgeCollectionCategory.promptLibrary.rawValue { return .prompt }
        if category == KnowledgeCollectionCategory.blackVault.rawValue { return .artwork }
        if category.localizedCaseInsensitiveContains("tech") { return .technology }
        return .idea
    }

    private func sharesKeyword(_ first: String, _ second: String) -> Bool {
        let stopWords: Set<String> = ["the", "and", "for", "with", "from", "this", "that", "local", "none", "mission", "intelligence"]
        let firstWords = Set(first.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { $0.count > 3 && !stopWords.contains($0) })
        let secondWords = Set(second.lowercased().components(separatedBy: CharacterSet.alphanumerics.inverted).filter { $0.count > 3 && !stopWords.contains($0) })
        return !firstWords.intersection(secondWords).isEmpty
    }

    private func defaultCycleSummary(for phase: DailyIntelligencePhase) -> String {
        switch phase {
        case .morningBrief:
            return "Set today's focus from current mission, memory, research, and system health."
        case .missionExecution:
            return "Move the active mission forward and record the next commander decision."
        case .researchCollection:
            return "Collect local research and connect it to missions, books, engineering, or music."
        case .journalReflection:
            return "Capture founder reflection and preserve emotional, creative, and operational context."
        case .eveningDebrief:
            return "Close the loop with outcomes, blockers, resume point, and tomorrow's first action."
        }
    }

    private func restoreCommanderMemory() {
        if commanderMemory.isEmpty {
            modelContext.insert(CommanderMemoryRecord(
                currentMission: activeMission,
                currentSprint: "Sprint 19",
                lastMission: missions.first?.title ?? savedMissions.first?.title ?? "",
                lastConversation: conversations.first?.title ?? legacyConversations.first?.title ?? "",
                lastJournal: founderJournal.first?.title ?? journal.first?.title ?? "",
                lastResearch: research.first?.title ?? "",
                resumePoint: "Living Intelligence"
            ))
        }
        if resumeStates.isEmpty {
            modelContext.insert(ResumeStateRecord(currentScreen: "Living Intelligence", mission: activeMission, lastSprint: "Sprint 19"))
        }
        if dailyCycle.isEmpty {
            for phase in DailyIntelligencePhase.allCases {
                modelContext.insert(DailyIntelligenceCycleRecord(
                    phase: phase.rawValue,
                    title: phase.rawValue,
                    summary: defaultCycleSummary(for: phase),
                    relatedMission: activeMission,
                    isComplete: false
                ))
            }
        }
        memoryMission = memory?.currentMission ?? activeMission
        memorySprint = memory?.currentSprint ?? "Sprint 19"
        memoryObjective = memory?.currentObjective ?? "Unify local intelligence."
        memoryResume = memory?.resumePoint ?? "Living Intelligence"
        selectedResearch = resume?.selectedResearch ?? research.first?.title ?? ""
        draftPrompt = resume?.draftPrompt ?? ""
        openJournal = resume?.openJournal ?? founderJournal.first?.title ?? ""
        selectedGraphNodeTitle = selectedNode?.title ?? "Living Intelligence Engine"
        refreshFounderMemory()
        updateResume(screen: "Living Intelligence")
    }

    private func saveCommanderMemory() {
        let record = memory ?? CommanderMemoryRecord()
        record.currentMission = memoryMission.isEmpty ? activeMission : memoryMission
        record.currentSprint = memorySprint.isEmpty ? "Sprint 19" : memorySprint
        record.lastMission = missions.first?.title ?? savedMissions.first?.title ?? record.lastMission
        record.lastConversation = conversations.first?.title ?? legacyConversations.first?.title ?? record.lastConversation
        record.lastJournal = founderJournal.first?.title ?? journal.first?.title ?? record.lastJournal
        record.lastResearch = research.first?.title ?? record.lastResearch
        record.activeProject = "ARCHAIOS OS"
        record.currentObjective = memoryObjective
        record.resumePoint = memoryResume
        record.updatedAt = .now
        if memory == nil { modelContext.insert(record) }
    }

    private func createRelationship() {
        let source = sourceTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? activeMission : sourceTitle
        let target = targetTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? (research.first?.title ?? "Living Intelligence") : targetTitle
        modelContext.insert(IntelligenceRelationshipRecord(
            sourceType: sourceType.rawValue,
            sourceTitle: source,
            targetType: targetType.rawValue,
            targetTitle: target,
            notes: relationNote,
            strength: 7
        ))
    }

    private func saveDecision() {
        let decision = decisionText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Sprint 19 Executive Decision" : decisionText
        modelContext.insert(ExecutiveDecisionRecord(
            decision: decision,
            evidence: evidenceText,
            confidence: Int(confidence),
            alternatives: alternativesText,
            risks: risksText,
            recommendation: recommendationText,
            finalDecision: finalDecisionText,
            reviewDate: reviewDate
        ))
    }

    private func saveKnowledgeItem() {
        let title = collectionTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "\(collectionCategory.rawValue) Intelligence Note" : collectionTitle
        let body = collectionBody.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Local intelligence item captured in Sprint 19." : collectionBody
        modelContext.insert(KnowledgeCollectionRecord(title: title, category: collectionCategory.rawValue, body: body, tagsText: "sprint19,living-intelligence"))
    }

    private func saveDailyCyclePhase() {
        let summary = cycleSummary.trimmingCharacters(in: .whitespacesAndNewlines).ifEmpty(defaultCycleSummary(for: selectedCyclePhase))
        if let record = dailyCycle.first(where: { $0.phase == selectedCyclePhase.rawValue }) {
            record.summary = summary
            record.relatedMission = activeMission
            record.isComplete = true
            record.updatedAt = .now
        } else {
            modelContext.insert(DailyIntelligenceCycleRecord(
                phase: selectedCyclePhase.rawValue,
                title: selectedCyclePhase.rawValue,
                summary: summary,
                relatedMission: activeMission,
                isComplete: true
            ))
        }
        cycleSummary = ""
        Haptics.success()
    }

    private func refreshFounderMemory() {
        let snapshot = founderMemory.first ?? FounderMemorySnapshotRecord()
        snapshot.favoriteMissions = favoriteMissions
        snapshot.favoritePrompts = favoritePrompts
        snapshot.recentSearches = recentSearches
        snapshot.recentResearch = research.first?.title ?? ""
        snapshot.lastJournal = founderJournal.first?.title ?? journal.first?.title ?? ""
        snapshot.lastSprint = "Sprint 19"
        snapshot.lastCommanderSession = memory?.lastConversation ?? conversations.first?.title ?? legacyConversations.first?.title ?? ""
        snapshot.lastEngineeringWork = recentEngineering
        snapshot.recentMusicWork = music.first?.title ?? ""
        snapshot.updatedAt = .now
        if founderMemory.isEmpty { modelContext.insert(snapshot) }
    }

    private func generateLocalReports() {
        let reports = [
            ("LIVING_INTELLIGENCE_REPORT", "Living Intelligence", livingIntelligenceReportMarkdown),
            ("DAILY_INTELLIGENCE_REPORT", "Daily Intelligence", dailyIntelligenceReportMarkdown),
            ("MISSION_GRAPH_REPORT", "Mission Graph", missionGraphReportMarkdown)
        ]
        for report in reports {
            modelContext.insert(LocalIntelligenceReportRecord(title: report.0, kind: report.1, markdown: report.2))
        }
        latestReportPreview = reports.map { "# \($0.0)\n\($0.2.prefix(320))" }.joined(separator: "\n\n")
        refreshFounderMemory()
        Haptics.success()
    }

    private var livingIntelligenceReportMarkdown: String {
        """
        # LIVING_INTELLIGENCE_REPORT

        Sprint: Sprint 19 - Living Intelligence Engine
        Mode: Local-first, deterministic, no network services

        ## Dashboard
        - Today's Focus: \(todayFocus)
        - Current Mission: \(activeMission)
        - Recent Intelligence: \(recentIntelligence)
        - System Health: \(systemHealthLabel)

        ## Knowledge Graph
        - Nodes: \(graphNodes.count)
        - Saved Relationships: \(relationships.count)
        - Inferred Relationships: \(inferredRelationshipCount)
        - Mission Relationships: \(missionRelationships.count)

        ## Founder Memory
        - Favorite Missions: \(favoriteMissions)
        - Favorite Prompts: \(favoritePrompts)
        - Recent Research: \(research.first?.title ?? "None")
        - Last Journal: \(founderJournal.first?.title ?? journal.first?.title ?? "None")
        - Recent Music Work: \(music.first?.title ?? "None")
        """
    }

    private var dailyIntelligenceReportMarkdown: String {
        let phases = DailyIntelligencePhase.allCases.map { phase in
            let record = dailyCycle.first { $0.phase == phase.rawValue }
            return "- \(phase.rawValue): \(record?.summary ?? defaultCycleSummary(for: phase))"
        }.joined(separator: "\n")
        return """
        # DAILY_INTELLIGENCE_REPORT

        ## Daily Cycle
        \(phases)

        ## Suggestions
        \(localSuggestions.map { "- \($0.title): \($0.detail)" }.joined(separator: "\n"))
        """
    }

    private var missionGraphReportMarkdown: String {
        """
        # MISSION_GRAPH_REPORT

        ## Active Mission
        \(activeMission)

        ## Related Knowledge
        \(selectedExplorerItems.prefix(16).map { "- \($0.section): \($0.detail)" }.joined(separator: "\n"))

        ## Timeline
        \(livingTimeline.prefix(20).map { "- \($0)" }.joined(separator: "\n"))
        """
    }

    private func saveResumeState() {
        let record = resume ?? ResumeStateRecord()
        record.currentScreen = viewModel.selectedDock
        record.scrollPosition = 0
        record.mission = activeMission
        record.selectedResearch = selectedResearch
        record.draftPrompt = draftPrompt
        record.openJournal = openJournal
        record.lastSprint = memorySprint
        record.updatedAt = .now
        if resume == nil { modelContext.insert(record) }
    }

    private func updateResume(screen: String) {
        let record = resume ?? ResumeStateRecord()
        record.currentScreen = screen
        record.mission = activeMission
        record.selectedResearch = selectedResearch
        record.draftPrompt = draftPrompt
        record.openJournal = openJournal
        record.lastSprint = memorySprint
        record.updatedAt = .now
        if resume == nil { modelContext.insert(record) }
    }
}

private enum ExecutiveInboxStatus: String, CaseIterable, Identifiable {
    case new = "New"
    case reviewing = "Reviewing"
    case linked = "Linked"
    case archived = "Archived"

    var id: String { rawValue }
}

private struct ExecutiveInboxItem: Identifiable {
    let id: String
    let source: String
    let title: String
    let detail: String
    let priority: String
    let status: String
    let tags: String
    let relationships: String
    let createdAt: Date
}

private struct OperationsMapNode: Identifiable {
    let id = UUID()
    let title: String
    let symbol: String
    let detail: String
}

private struct KnowledgeGraphCluster: Identifiable {
    let id = UUID()
    let title: String
    let count: Int
    let strength: Int
    let influence: Int
    let detail: String
}

private struct WatchMapMarker: Identifiable {
    let id = UUID()
    let title: String
    let region: String
    let x: Double
    let y: Double
    let status: SystemStatus
}

private struct WatchGraphNode: Identifiable {
    let id = UUID()
    let title: String
    let type: String
    let strength: Int
    let angle: Double
}

private struct WatchFloorCard: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let status: SystemStatus
}

private struct OfflineWorldMapShape: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let w = rect.width
        let h = rect.height

        path.addRoundedRect(in: CGRect(x: w * 0.06, y: h * 0.24, width: w * 0.22, height: h * 0.24), cornerSize: CGSize(width: 18, height: 18))
        path.addRoundedRect(in: CGRect(x: w * 0.14, y: h * 0.48, width: w * 0.16, height: h * 0.26), cornerSize: CGSize(width: 15, height: 15))
        path.addRoundedRect(in: CGRect(x: w * 0.39, y: h * 0.20, width: w * 0.28, height: h * 0.22), cornerSize: CGSize(width: 20, height: 20))
        path.addRoundedRect(in: CGRect(x: w * 0.47, y: h * 0.42, width: w * 0.18, height: h * 0.31), cornerSize: CGSize(width: 18, height: 18))
        path.addRoundedRect(in: CGRect(x: w * 0.66, y: h * 0.30, width: w * 0.23, height: h * 0.20), cornerSize: CGSize(width: 18, height: 18))
        path.addRoundedRect(in: CGRect(x: w * 0.72, y: h * 0.62, width: w * 0.16, height: h * 0.13), cornerSize: CGSize(width: 12, height: 12))
        return path
    }
}

struct ExecutivePersistenceLaunchCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \ExecutiveDashboardState.updatedAt, order: .reverse) private var dashboard: [ExecutiveDashboardState]
    @Query(sort: \MissionRecord.sortOrder, order: .forward) private var missions: [MissionRecord]
    @Query(sort: \DailyBriefRecord.createdAt, order: .reverse) private var briefs: [DailyBriefRecord]
    @Query(sort: \CommanderSession.updatedAt, order: .reverse) private var sessions: [CommanderSession]

    var body: some View {
        CommandCard(title: "Executive Persistence", systemImage: "building.columns.fill") {
            Text("Watch Hour 9")
                .font(.title3.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            Text("Living executive headquarters, persistent mission queue, daily brief, console, legacy vault, and integrity checks.")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Sprint", value: dashboard.first?.currentSprint ?? "Sprint 22", context: "Watch Hour 9")
                MetricCard(title: "Mission", value: dashboard.first?.currentMission ?? missions.first?.title ?? "Watch Hour 9", context: "Resume ready")
                MetricCard(title: "Queue", value: "\(missions.count)", context: missions.first?.state ?? "Mission Ready")
                MetricCard(title: "Briefs", value: "\(briefs.count)", context: sessions.first?.currentScreen ?? "Headquarters")
            }
        }
    }
}

struct ExecutivePersistenceView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \MissionRecord.sortOrder, order: .forward) private var missionRecords: [MissionRecord]
    @Query(sort: \DecisionRecord.decisionDate, order: .reverse) private var decisionRecords: [DecisionRecord]
    @Query(sort: \DailyBriefRecord.createdAt, order: .reverse) private var dailyBriefs: [DailyBriefRecord]
    @Query(sort: \LegacyRecord.createdAt, order: .reverse) private var legacyRecords: [LegacyRecord]
    @Query(sort: \MissionHistory.createdAt, order: .reverse) private var missionHistory: [MissionHistory]
    @Query(sort: \FounderDecision.createdAt, order: .reverse) private var founderDecisions: [FounderDecision]
    @Query(sort: \DailyReflection.createdAt, order: .reverse) private var dailyReflections: [DailyReflection]
    @Query(sort: \ResearchConnection.createdAt, order: .reverse) private var researchConnections: [ResearchConnection]
    @Query(sort: \IntelligenceInsight.createdAt, order: .reverse) private var intelligenceInsights: [IntelligenceInsight]
    @Query(sort: \LegacyEntry.createdAt, order: .reverse) private var legacyEntries: [LegacyEntry]
    @Query(sort: \CommanderSession.updatedAt, order: .reverse) private var commanderSessions: [CommanderSession]
    @Query(sort: \ExecutiveDashboardState.updatedAt, order: .reverse) private var dashboardStates: [ExecutiveDashboardState]
    @Query(sort: \MissionQueueState.updatedAt, order: .reverse) private var queueStates: [MissionQueueState]
    @Query(sort: \CommanderMemoryRecord.updatedAt, order: .reverse) private var commanderMemory: [CommanderMemoryRecord]
    @Query(sort: \ResumeStateRecord.updatedAt, order: .reverse) private var resumeStates: [ResumeStateRecord]
    @Query(sort: \IntelligenceRelationshipRecord.createdAt, order: .reverse) private var relationships: [IntelligenceRelationshipRecord]
    @Query(sort: \LocalIntelligenceReportRecord.createdAt, order: .reverse) private var localReports: [LocalIntelligenceReportRecord]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \KnowledgeCollectionRecord.createdAt, order: .reverse) private var collections: [KnowledgeCollectionRecord]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \WorkSessionRecord.startedAt, order: .reverse) private var workSessions: [WorkSessionRecord]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timeline: [CommandTimelineEvent]
    @State private var queueSortMode = "Manual"
    @State private var missionTitle = "Watch Hour 9"
    @State private var missionPriority = CommandPriority.high.rawValue
    @State private var missionState = MissionState.missionReady
    @State private var inboxSearch = ""
    @State private var decisionTitle = ""
    @State private var decisionReason = ""
    @State private var decisionAlternatives = ""
    @State private var decisionOutcome = ""
    @State private var decisionLessons = ""
    @State private var legacySection = "ARCHAIOS History"
    @State private var legacyTitle = ""
    @State private var legacySummary = ""
    @State private var quickNote = ""
    @State private var sitrep = ""
    @State private var showResumePrompt = true
    @State private var latestIntegrity = ""
    @State private var graphFilter = "All"
    @State private var graphCluster = "Mission"
    @State private var graphZoom = 1.0
    @State private var graphTimelineMode = false
    @State private var reflectionWins = ""
    @State private var reflectionBlockers = ""
    @State private var insightTitle = ""
    @State private var insightSummary = ""
    @State private var watchStartedAt = Date.now
    @State private var watchGraphSearch = ""
    @State private var selectedRelationshipTitle = ""
    @State private var commanderNoteDraft = ""
    @State private var watchBriefPreview = ""

    private let legacySections = ["Books", "Artwork", "Research", "Music", "Military History", "ARCHAIOS History", "QX Technology", "Mission Reports", "Historical Timeline"]

    private var dashboard: ExecutiveDashboardState? { dashboardStates.first }
    private var memory: CommanderMemoryRecord? { commanderMemory.first }
    private var resume: ResumeStateRecord? { resumeStates.first }
    private var session: CommanderSession? { commanderSessions.first }

    private var activeMission: String {
        missionRecords.first { $0.state == MissionState.missionActive.rawValue }?.title ??
            missions.first { $0.status != RemoteCommandStatus.complete.label }?.title ??
            savedMissions.first { !$0.isComplete }?.title ??
            memory?.currentMission ??
            "Watch Hour 9"
    }

    private var sortedMissionRecords: [MissionRecord] {
        switch queueSortMode {
        case "Priority":
            return missionRecords.sorted { priorityRank($0.priority) > priorityRank($1.priority) }
        case "State":
            return missionRecords.sorted { $0.state < $1.state }
        case "Updated":
            return missionRecords.sorted { $0.updatedAt > $1.updatedAt }
        default:
            return missionRecords.sorted { $0.sortOrder < $1.sortOrder }
        }
    }

    private var inboxItems: [ExecutiveInboxItem] {
        var items: [ExecutiveInboxItem] = []
        items += research.map { ExecutiveInboxItem(id: "research-\($0.id)", source: "Research", title: $0.title, detail: $0.body, priority: $0.isFavorite ? "High" : "Normal", status: ExecutiveInboxStatus.reviewing.rawValue, tags: $0.tagsText, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += founderJournal.map { ExecutiveInboxItem(id: "founder-journal-\($0.id)", source: "Journal", title: $0.title, detail: $0.body, priority: $0.isFavorite ? "High" : "Normal", status: ExecutiveInboxStatus.new.rawValue, tags: $0.tagsText, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += journal.map { ExecutiveInboxItem(id: "journal-\($0.id)", source: "Journal", title: $0.title, detail: $0.body, priority: "Normal", status: ExecutiveInboxStatus.new.rawValue, tags: $0.tagsText, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += collections.map { ExecutiveInboxItem(id: "collection-\($0.id)", source: inboxSource(for: $0.category), title: $0.title, detail: $0.body, priority: $0.isFavorite ? "High" : "Normal", status: ExecutiveInboxStatus.linked.rawValue, tags: $0.tagsText, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += music.map { ExecutiveInboxItem(id: "music-\($0.id)", source: "Music", title: $0.title, detail: $0.note, priority: $0.isFavorite ? "High" : "Normal", status: ExecutiveInboxStatus.reviewing.rawValue, tags: $0.tagsText, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += vault.map { ExecutiveInboxItem(id: "vault-\($0.id)", source: "Black Vault", title: $0.title, detail: $0.tagLine, priority: $0.importance > 7 ? "High" : "Normal", status: ExecutiveInboxStatus.linked.rawValue, tags: $0.category, relationships: relationshipsFor($0.title), createdAt: $0.createdAt) }
        items += workSessions.map { ExecutiveInboxItem(id: "engineering-\($0.id)", source: $0.notes.localizedCaseInsensitiveContains("architecture") ? "Architecture" : "Engineering", title: $0.title, detail: $0.notes, priority: $0.status == "Active" ? "High" : "Normal", status: $0.status, tags: "engineering,local", relationships: relationshipsFor($0.title), createdAt: $0.startedAt) }
        let needle = inboxSearch.trimmingCharacters(in: .whitespacesAndNewlines)
        let filtered = needle.isEmpty ? items : items.filter { item in
            item.title.localizedCaseInsensitiveContains(needle) ||
                item.detail.localizedCaseInsensitiveContains(needle) ||
                item.source.localizedCaseInsensitiveContains(needle) ||
                item.tags.localizedCaseInsensitiveContains(needle)
        }
        return filtered.sorted { $0.createdAt > $1.createdAt }
    }

    private var integrityWarnings: [String] {
        var warnings: [String] = []
        let titles = missionRecords.map { $0.title.lowercased() }
        let duplicates = Set(titles.filter { title in titles.filter { $0 == title }.count > 1 })
        if !duplicates.isEmpty { warnings.append("Duplicate missions: \(duplicates.sorted().joined(separator: ", "))") }
        if relationships.contains(where: { $0.sourceTitle.isEmpty || $0.targetTitle.isEmpty }) { warnings.append("Missing relationship references detected.") }
        if inboxItems.filter({ $0.relationships == "None" }).count > 6 { warnings.append("Orphan knowledge exceeds review threshold.") }
        if timeline.contains(where: { $0.title.isEmpty || $0.detail.isEmpty }) { warnings.append("Broken timeline link placeholder detected.") }
        if missionRecords.isEmpty { warnings.append("Mission queue needs Sentinel seed mission.") }
        return warnings.isEmpty ? ["Integrity stable. Relationships, queue, inbox, and timeline are locally coherent."] : warnings
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Executive Persistence", subtitle: "Sprint 22 Watch Hour 9: living executive headquarters for command, intelligence, missions, vault knowledge, and long-term legacy.")
                if showResumePrompt {
                    resumePrompt
                }
                commanderWatchFloorPanel
                watchFounderDashboardPanel
                watchIntelligenceTimelinePanel
                strategicWorldMapPanel
                knowledgeGraph3Panel
                missionQueueCommanderPanel
                blackVaultIntelligencePanel
                watchExecutiveBriefGeneratorPanel
                commandCenter2Panel
                founderDailyOSPanel
                livingMemoryPanel
                knowledgeGraph2Panel
                commanderAssistPanel
                executiveDashboard2Panel
                dailyExecutiveBriefPanel
                commanderDashboard
                missionQueuePanel
                intelligenceInboxPanel
                decisionLogPanel
                missionResumePanel
                strategicOperationsMap
                dailyBriefPanel
                legacyVaultPanel
                commanderConsolePanel
                intelligenceIntegrityPanel
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Executive HQ")
        .onAppear {
            ensureSentinelBaseline()
            restoreDashboardState()
        }
    }

    private var resumePrompt: some View {
        CommandCard(title: "Resume Previous Operation?", systemImage: "arrowshape.turn.up.right.circle.fill") {
            Text("Last mission: \(session?.currentMission ?? resume?.mission ?? activeMission)")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(themeManager.theme.text)
            Text("Screen: \(session?.currentScreen ?? resume?.currentScreen ?? "Executive Persistence") | Sprint: \(session?.currentSprint ?? "Sprint 22")")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.66))
            HStack {
                CommanderButton(title: "Resume Operation", systemImage: "play.fill") {
                    resumePreviousOperation()
                }
                CommanderButton(title: "Dismiss", systemImage: "xmark.circle") {
                    showResumePrompt = false
                }
            }
        }
    }

    private var commanderWatchFloorPanel: some View {
        CommandCard(title: "Commander Watch Floor", systemImage: "dot.radiowaves.left.and.right") {
            TimelineView(.periodic(from: .now, by: 1)) { context in
                let elapsed = max(0, Int(context.date.timeIntervalSince(watchStartedAt)))
                let cards = rotatingWatchCards
                let card = cards[(elapsed / 6) % max(cards.count, 1)]

                VStack(alignment: .leading, spacing: 12) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 5) {
                            Text(card.title)
                                .font(.title3.weight(.black))
                                .foregroundStyle(themeManager.theme.heading)
                            Text(card.detail)
                                .font(.caption)
                                .foregroundStyle(themeManager.theme.text.opacity(0.68))
                        }
                        Spacer()
                        StatusPill(title: card.status.label, status: card.status)
                    }
                    HStack {
                        watchMetric("Operation", activeMission, "Current operation")
                        watchMetric("Priority", topMissionPriority, "Mission priority")
                    }
                    HStack {
                        watchMetric("Timer", missionTimerString(elapsed), "Watch duration")
                        watchMetric("Status", "\(operationalHealth)%", "Executive board")
                    }
                }
                .animation(.easeInOut(duration: 0.35), value: card.id)
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Active Ops", value: "\(activeOperations.count)", context: activeOperations.first ?? "Standing by")
                MetricCard(title: "Blocked", value: "\(missionRecords.filter { $0.state == MissionState.blocked.rawValue }.count)", context: "Mission risk")
                MetricCard(title: "Inbox", value: "\(inboxItems.count)", context: "Intel signals")
                MetricCard(title: "Briefs", value: "\(dailyBriefs.count)", context: "Archive")
            }
        }
    }

    private func watchMetric(_ title: String, _ value: String, _ context: String) -> some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title.uppercased())
                .font(.caption2.weight(.black))
                .foregroundStyle(themeManager.theme.heading.opacity(0.82))
            Text(value)
                .font(.subheadline.weight(.black))
                .foregroundStyle(themeManager.theme.text)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(context)
                .font(.caption2)
                .foregroundStyle(themeManager.theme.text.opacity(0.55))
        }
        .frame(maxWidth: .infinity, minHeight: 72, alignment: .topLeading)
        .padding(10)
        .background(themeManager.theme.elevatedPanel.opacity(0.9))
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var watchFounderDashboardPanel: some View {
        CommandCard(title: "Founder Dashboard", systemImage: "rectangle.grid.2x2.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Readiness", value: "\(missionReadiness)%", context: "Mission readiness")
                MetricCard(title: "Integrity", value: integrityWarnings.first?.hasPrefix("Integrity stable") == true ? "Stable" : "Review", context: "\(integrityWarnings.count) signals")
                MetricCard(title: "Knowledge", value: "\(knowledgeGrowth)", context: "Knowledge growth")
                MetricCard(title: "Research", value: "\(research.count)", context: "Research count")
                MetricCard(title: "Architecture", value: architectureHealth, context: "Architecture health")
                MetricCard(title: "Sprint", value: "22", context: "Watch Hour 9")
                MetricCard(title: "Focus", value: currentFocus, context: "Commander focus")
            }
        }
    }

    private var watchIntelligenceTimelinePanel: some View {
        CommandCard(title: "Intelligence Timeline", systemImage: "timeline.selection") {
            ForEach(watchTimelineItems.prefix(12), id: \.self) { item in
                TimelineRow(title: item.components(separatedBy: " | ").dropFirst().first ?? "Timeline", detail: item, status: .standby)
            }
        }
    }

    private var strategicWorldMapPanel: some View {
        CommandCard(title: "Strategic World Map", systemImage: "globe.americas.fill") {
            GeometryReader { proxy in
                ZStack {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(themeManager.theme.elevatedPanel.opacity(0.9))
                    OfflineWorldMapShape()
                        .fill(themeManager.theme.heading.opacity(0.18))
                        .overlay(OfflineWorldMapShape().stroke(themeManager.theme.heading.opacity(0.34), lineWidth: 1))
                        .padding(16)
                    ForEach(watchMapMarkers) { marker in
                        VStack(spacing: 3) {
                            Image(systemName: marker.status == .green ? "mappin.circle.fill" : "mappin.circle")
                                .font(.title3)
                                .foregroundStyle(marker.status == .green ? themeManager.theme.heading : themeManager.theme.text.opacity(0.72))
                            Text(marker.title)
                                .font(.caption2.weight(.black))
                                .foregroundStyle(themeManager.theme.text)
                                .lineLimit(1)
                                .minimumScaleFactor(0.62)
                        }
                        .position(x: proxy.size.width * marker.x, y: proxy.size.height * marker.y)
                    }
                }
            }
            .frame(height: 230)
            ForEach(watchMapMarkers) { marker in
                TimelineRow(title: "\(marker.region): \(marker.title)", detail: marker.status == .green ? "Operation marker active" : "Future expansion marker", status: marker.status)
            }
        }
    }

    private var knowledgeGraph3Panel: some View {
        CommandCard(title: "Living Knowledge Graph 3.0", systemImage: "network") {
            TextField("Search graph relationships", text: $watchGraphSearch)
                .livingIntelligenceField(themeManager)
            HStack {
                Picker("Filter", selection: $graphFilter) {
                    ForEach(["All", "Mission", "Research", "Music", "Engineering", "Legacy"], id: \.self) { item in
                        Text(item).tag(item)
                    }
                }
                .pickerStyle(.menu)
                Toggle("Timeline", isOn: $graphTimelineMode)
                    .tint(themeManager.theme.heading)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text("Zoom \(Int(graphZoom * 100))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.text.opacity(0.70))
                Slider(value: $graphZoom, in: 0.75...1.65)
                    .tint(themeManager.theme.heading)
            }
            GeometryReader { proxy in
                ZStack {
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(themeManager.theme.elevatedPanel.opacity(0.88))
                    ForEach(filteredWatchGraphNodes) { node in
                        let radius = min(proxy.size.width, proxy.size.height) * 0.32 * graphZoom
                        let center = CGPoint(x: proxy.size.width / 2, y: proxy.size.height / 2)
                        let point = CGPoint(
                            x: center.x + cos(node.angle) * radius,
                            y: center.y + sin(node.angle) * radius
                        )
                        Path { path in
                            path.move(to: center)
                            path.addLine(to: point)
                        }
                        .stroke(themeManager.theme.heading.opacity(Double(node.strength) / 16.0), lineWidth: max(1, CGFloat(node.strength) / 3.0))
                        VStack(spacing: 3) {
                            Circle()
                                .fill(themeManager.theme.heading)
                                .frame(width: CGFloat(10 + node.strength), height: CGFloat(10 + node.strength))
                            Text(node.title)
                                .font(.caption2.weight(.black))
                                .foregroundStyle(themeManager.theme.text)
                                .lineLimit(1)
                                .minimumScaleFactor(0.58)
                        }
                        .position(point)
                        .onTapGesture {
                            selectedRelationshipTitle = relationshipInspector(for: node)
                        }
                    }
                    VStack(spacing: 3) {
                        Image(systemName: "scope")
                            .foregroundStyle(themeManager.theme.heading)
                        Text(activeMission)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.text)
                            .lineLimit(2)
                            .multilineTextAlignment(.center)
                    }
                    .frame(width: 110)
                    .position(x: proxy.size.width / 2, y: proxy.size.height / 2)
                }
            }
            .frame(height: 260)
            .animation(.easeInOut(duration: 0.4), value: graphZoom)
            TimelineRow(title: "Relationship Inspector", detail: selectedRelationshipTitle.ifEmpty(defaultRelationshipInspector), status: .green)
        }
    }

    private var missionQueueCommanderPanel: some View {
        CommandCard(title: "Mission Queue Commander", systemImage: "list.bullet.clipboard.fill") {
            TextField("Commander notes", text: $commanderNoteDraft, axis: .vertical)
                .livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Commander Notes", systemImage: "square.and.arrow.down.fill") {
                saveCommanderQueueNote()
            }
            ForEach(sortedMissionRecords.prefix(8)) { mission in
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        VStack(alignment: .leading, spacing: 3) {
                            Text(mission.title)
                                .font(.subheadline.weight(.black))
                                .foregroundStyle(themeManager.theme.text)
                            Text("\(mission.priority) | \(mission.state)")
                                .font(.caption)
                                .foregroundStyle(themeManager.theme.text.opacity(0.62))
                        }
                        Spacer()
                        StatusPill(title: mission.state, status: status(for: mission.state))
                    }
                    Text(mission.historyText.ifEmpty("Awaiting commander note."))
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.64))
                        .lineLimit(3)
                    HStack {
                        Button { moveMission(mission, delta: -1) } label: { Label("Up", systemImage: "arrow.up.circle") }
                        Button { moveMission(mission, delta: 1) } label: { Label("Down", systemImage: "arrow.down.circle") }
                        Button { updateMission(mission, state: .paused) } label: { Label("Pause", systemImage: "pause.circle") }
                        Button { resumeMission(mission) } label: { Label("Resume", systemImage: "play.circle") }
                        Button { updateMission(mission, state: .archived) } label: { Label("Archive", systemImage: "archivebox") }
                    }
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
                }
                .padding(10)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
        }
    }

    private var blackVaultIntelligencePanel: some View {
        CommandCard(title: "Black Vault Intelligence", systemImage: "lock.shield.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 135), spacing: 10)], spacing: 10) {
                MetricCard(title: "Classified", value: "\(vault.count)", context: vault.first?.title ?? "Notes")
                MetricCard(title: "Doctrine", value: "\(collections.filter { $0.category.localizedCaseInsensitiveContains("doctrine") }.count)", context: "Local doctrine")
                MetricCard(title: "Research", value: "\(research.count)", context: research.first?.title ?? "Archive")
                MetricCard(title: "Artwork", value: "\(collections.filter { $0.category.localizedCaseInsensitiveContains("art") }.count)", context: "Visual legacy")
                MetricCard(title: "Books", value: "\(collections.filter { $0.category.localizedCaseInsensitiveContains("book") }.count)", context: "Library")
                MetricCard(title: "Music", value: "\(music.count)", context: music.first?.title ?? "Studio")
                MetricCard(title: "Legacy", value: "\(legacyRecords.count + legacyEntries.count)", context: "Permanent archive")
            }
            ForEach(vault.prefix(6)) { entry in
                TimelineRow(title: "\(entry.category): \(entry.title)", detail: entry.tagLine, status: entry.importance > 7 ? .amber : .standby)
            }
        }
    }

    private var watchExecutiveBriefGeneratorPanel: some View {
        CommandCard(title: "Executive Brief Generator", systemImage: "doc.richtext.fill") {
            Text(watchBriefPreview.ifEmpty(watchHourBriefMarkdown))
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
                .textSelection(.enabled)
            CommanderButton(title: "Generate Watch Hour Brief", systemImage: "doc.badge.plus") {
                generateWatchHourBrief()
            }
        }
    }

    private var commandCenter2Panel: some View {
        CommandCard(title: "Command Center 2.0", systemImage: "map.fill") {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(activeMission)
                        .font(.title3.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Current Focus: \(currentFocus)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.68))
                }
                Spacer()
                StatusPill(title: "\(operationalHealth)% Health", status: operationalHealth > 70 ? .green : .amber)
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 118), spacing: 10)], spacing: 10) {
                ForEach(commandMapNodes) { node in
                    VStack(alignment: .leading, spacing: 7) {
                        Image(systemName: node.symbol)
                            .foregroundStyle(themeManager.theme.heading)
                        Text(node.title)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.text)
                        Text(node.detail)
                            .font(.caption2)
                            .lineLimit(2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    }
                    .frame(maxWidth: .infinity, minHeight: 96, alignment: .topLeading)
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel.opacity(0.88))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(themeManager.theme.heading.opacity(0.18), lineWidth: 1)
                    )
                }
            }
            ForEach(executiveTimeline.prefix(6), id: \.self) { item in
                TimelineRow(title: "Executive Timeline", detail: item, status: .standby)
            }
        }
    }

    private var founderDailyOSPanel: some View {
        CommandCard(title: "Founder Daily OS", systemImage: "sun.max.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Morning Brief", value: dailyBriefs.first?.todaysMission ?? activeMission, context: "Local brief")
                MetricCard(title: "Objectives", value: "\(openOperationCount)", context: "Open operations")
                MetricCard(title: "Research", value: research.first?.title ?? "None", context: "Active research")
                MetricCard(title: "Music", value: music.first?.title ?? "None", context: music.first?.project ?? "Project")
                MetricCard(title: "Engineering", value: workSessions.first?.title ?? "None", context: "\(workSessions.count) tasks")
                MetricCard(title: "Black Vault", value: vault.first?.title ?? "None", context: "\(vault.count) queued")
                MetricCard(title: "Alerts", value: "\(intelligenceAlerts.count)", context: intelligenceAlerts.first ?? "Clear")
                MetricCard(title: "EOD Review", value: dailyReflections.first?.title ?? "Pending", context: "\(dailyReflections.count) reflections")
            }
            TextField("Wins from today", text: $reflectionWins, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Blockers / review notes", text: $reflectionBlockers, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save End-of-Day Review", systemImage: "moon.stars.fill") {
                saveDailyReflection()
            }
        }
    }

    private var livingMemoryPanel: some View {
        CommandCard(title: "Living Memory", systemImage: "brain.head.profile") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Mission History", value: "\(missionHistory.count)", context: missionHistory.first?.eventTitle ?? "Auto-built")
                MetricCard(title: "Founder Decisions", value: "\(founderDecisions.count)", context: founderDecisions.first?.title ?? "None")
                MetricCard(title: "Reflections", value: "\(dailyReflections.count)", context: dailyReflections.first?.nextFocus ?? "Daily OS")
                MetricCard(title: "Connections", value: "\(researchConnections.count)", context: researchConnections.first?.cluster ?? "Knowledge")
                MetricCard(title: "Insights", value: "\(intelligenceInsights.count)", context: intelligenceInsights.first?.title ?? "None")
                MetricCard(title: "Legacy Entries", value: "\(legacyEntries.count)", context: legacyEntries.first?.domain ?? "Legacy")
            }
            TextField("Insight title", text: $insightTitle).livingIntelligenceField(themeManager)
            TextField("Insight summary", text: $insightSummary, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Capture Intelligence Insight", systemImage: "sparkles") {
                saveInsight()
            }
            CommanderButton(title: "Build Local Relationships", systemImage: "link.circle.fill") {
                buildLocalRelationships()
            }
        }
    }

    private var knowledgeGraph2Panel: some View {
        CommandCard(title: "Knowledge Graph 2.0", systemImage: "point.3.connected.trianglepath.dotted") {
            HStack {
                Picker("Filter", selection: $graphFilter) {
                    ForEach(["All", "Mission", "Research", "Music", "Engineering", "Legacy"], id: \.self) { item in
                        Text(item).tag(item)
                    }
                }
                .pickerStyle(.menu)
                Picker("Cluster", selection: $graphCluster) {
                    ForEach(["Mission", "Domain", "Timeline", "Strength"], id: \.self) { item in
                        Text(item).tag(item)
                    }
                }
                .pickerStyle(.menu)
            }
            Toggle("Timeline Mode", isOn: $graphTimelineMode)
                .tint(themeManager.theme.heading)
            VStack(alignment: .leading, spacing: 4) {
                Text("Zoom \(Int(graphZoom * 100))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.text.opacity(0.70))
                Slider(value: $graphZoom, in: 0.75...1.5)
                    .tint(themeManager.theme.heading)
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: CGFloat(118.0 * graphZoom)), spacing: 10)], spacing: 10) {
                ForEach(filteredGraphClusters) { cluster in
                    VStack(alignment: .leading, spacing: 7) {
                        Text(cluster.title)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.heading)
                        Text("\(cluster.count) nodes")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(themeManager.theme.text.opacity(0.62))
                        ProgressView(value: Double(cluster.strength), total: 10)
                            .tint(themeManager.theme.heading)
                        Text("Influence \(cluster.influence)%")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        Text(cluster.detail)
                            .font(.caption2)
                            .lineLimit(2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.56))
                    }
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel.opacity(graphTimelineMode ? 0.72 : 0.92))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
            }
        }
    }

    private var commanderAssistPanel: some View {
        CommandCard(title: "Commander Assist", systemImage: "wand.and.stars.inverse") {
            ForEach(commanderAssistSuggestions, id: \.self) { suggestion in
                TimelineRow(title: "Recommendation", detail: suggestion, status: suggestion.localizedCaseInsensitiveContains("blocked") ? .amber : .green)
            }
            TimelineRow(title: "Today's Activity", detail: todaysActivitySummary, status: .standby)
        }
    }

    private var executiveDashboard2Panel: some View {
        CommandCard(title: "Executive Dashboard", systemImage: "gauge.with.dots.needle.67percent") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Completion", value: "\(missionCompletionPercent)%", context: "Mission completion")
                MetricCard(title: "Health", value: "\(operationalHealth)%", context: "Operational health")
                MetricCard(title: "Knowledge", value: "\(knowledgeGrowth)", context: "Growth")
                MetricCard(title: "Founder Activity", value: "\(founderActivity)", context: "Daily signal")
                MetricCard(title: "Legacy", value: "\(legacyProgress)%", context: "Legacy progress")
                MetricCard(title: "Sprint", value: "21", context: "Sprint counter")
                MetricCard(title: "Velocity", value: "\(projectVelocity)", context: "Project velocity")
            }
        }
    }

    private var dailyExecutiveBriefPanel: some View {
        CommandCard(title: "Daily Brief Generator", systemImage: "doc.text.fill") {
            Text(dailyExecutiveBriefMarkdown)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
                .textSelection(.enabled)
            CommanderButton(title: "Generate Daily Executive Brief", systemImage: "doc.badge.plus") {
                generateDailyExecutiveBrief()
            }
        }
    }

    private var commanderDashboard: some View {
        CommandCard(title: "Executive Commander Dashboard", systemImage: "rectangle.grid.3x2.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Current Mission", value: activeMission, context: "Resume engine")
                MetricCard(title: "Current Sprint", value: dashboard?.currentSprint ?? "Sprint 22", context: "Watch Hour 9")
                MetricCard(title: "Intel Score", value: "\(intelligenceScore)%", context: "Local signals")
                MetricCard(title: "Readiness", value: "\(missionReadiness)%", context: "Queue health")
                MetricCard(title: "Weekly Progress", value: "\(weeklyProgress)%", context: "Completed vs open")
                MetricCard(title: "Daily Focus", value: dashboard?.dailyFocus ?? dailyFocus, context: "Daily brief")
                MetricCard(title: "Operations", value: "\(activeOperations.count)", context: activeOperations.first ?? "None")
                MetricCard(title: "Founder Status", value: dashboard?.founderStatus ?? founderStatus, context: "Journal energy")
                MetricCard(title: "Last Session", value: session?.title ?? "None", context: session?.updatedAt.formatted(date: .abbreviated, time: .shortened) ?? "Ready")
            }
            CommanderButton(title: "Resume Button", systemImage: "arrowshape.turn.up.right.fill") {
                resumePreviousOperation()
            }
        }
    }

    private var missionQueuePanel: some View {
        CommandCard(title: "Persistent Mission Queue", systemImage: "list.bullet.rectangle.portrait.fill") {
            HStack {
                Picker("Sort", selection: $queueSortMode) {
                    ForEach(["Manual", "Priority", "State", "Updated"], id: \.self) { mode in
                        Text(mode).tag(mode)
                    }
                }
                .pickerStyle(.menu)
                Spacer()
                Text("\(missionRecords.count) missions")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
            }
            TextField("Mission title", text: $missionTitle).livingIntelligenceField(themeManager)
            HStack {
                Picker("State", selection: $missionState) {
                    ForEach(MissionState.allCases) { state in Text(state.rawValue).tag(state) }
                }
                .pickerStyle(.menu)
                Picker("Priority", selection: $missionPriority) {
                    ForEach(CommandPriority.allCases) { priority in Text(priority.rawValue).tag(priority.rawValue) }
                }
                .pickerStyle(.menu)
            }
            CommanderButton(title: "Save Mission", systemImage: "tray.and.arrow.down.fill") {
                saveMission()
            }
            VStack(spacing: 8) {
                ForEach(sortedMissionRecords) { mission in
                    missionQueueRow(mission)
                }
            }
            Text("Manual ordering uses local up/down controls to preserve installable iPhone behavior.")
                .font(.caption2)
                .foregroundStyle(themeManager.theme.text.opacity(0.52))
        }
    }

    private func missionQueueRow(_ mission: MissionRecord) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(mission.title)
                        .font(.subheadline.weight(.black))
                        .foregroundStyle(themeManager.theme.text)
                    Text("\(mission.priority) | \(mission.state) | \(mission.owner)")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.62))
                }
                Spacer()
                StatusPill(title: mission.state, status: status(for: mission.state))
            }
            Text(mission.historyText.ifEmpty("No mission history yet."))
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.66))
            HStack {
                Button { moveMission(mission, delta: -1) } label: { Image(systemName: "arrow.up.circle") }
                Button { moveMission(mission, delta: 1) } label: { Image(systemName: "arrow.down.circle") }
                Button { resumeMission(mission) } label: { Label("Resume", systemImage: "play.circle.fill") }
                Menu {
                    ForEach(MissionState.allCases) { state in
                        Button(state.rawValue) { updateMission(mission, state: state) }
                    }
                } label: {
                    Label("State", systemImage: "slider.horizontal.3")
                }
            }
            .font(.caption.weight(.bold))
            .foregroundStyle(themeManager.theme.heading)
        }
        .padding(10)
        .background(themeManager.theme.elevatedPanel)
        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    }

    private var intelligenceInboxPanel: some View {
        CommandCard(title: "Executive Intelligence Inbox", systemImage: "tray.full.fill") {
            TextField("Search research, journal, books, music, engineering, architecture, business, ideas, and Black Vault", text: $inboxSearch)
                .livingIntelligenceField(themeManager)
            ForEach(inboxItems.prefix(14)) { item in
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(item.source)
                            .font(.caption2.weight(.black))
                            .foregroundStyle(themeManager.theme.heading)
                        Spacer()
                        Text("\(item.priority) | \(item.status)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    }
                    Text(item.title)
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(themeManager.theme.text)
                    Text(item.detail)
                        .font(.caption)
                        .lineLimit(2)
                        .foregroundStyle(themeManager.theme.text.opacity(0.66))
                    Text("Tags: \(item.tags.ifEmpty("None")) | Relationships: \(item.relationships)")
                        .font(.caption2)
                        .foregroundStyle(themeManager.theme.text.opacity(0.52))
                }
                .padding(.vertical, 6)
            }
        }
    }

    private var decisionLogPanel: some View {
        CommandCard(title: "Decision Intelligence", systemImage: "checkmark.seal.fill") {
            TextField("Decision title", text: $decisionTitle).livingIntelligenceField(themeManager)
            TextField("Reason", text: $decisionReason, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Alternatives", text: $decisionAlternatives, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Outcome", text: $decisionOutcome, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Lessons learned", text: $decisionLessons, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Decision", systemImage: "square.and.arrow.down.fill") {
                saveDecisionRecord()
            }
            ForEach(decisionRecords.prefix(8)) { decision in
                TimelineRow(title: decision.title, detail: "\(decision.mission) | \(decision.reason) | Outcome: \(decision.outcome.ifEmpty("Pending")) | Lessons: \(decision.lessonsLearned.ifEmpty("None"))", status: .green)
            }
        }
    }

    private var missionResumePanel: some View {
        CommandCard(title: "Mission Resume Engine", systemImage: "arrow.clockwise.circle.fill") {
            TimelineRow(title: "Last Mission", detail: session?.currentMission ?? resume?.mission ?? activeMission, status: .green)
            TimelineRow(title: "Last Screen", detail: session?.currentScreen ?? resume?.currentScreen ?? "Executive Persistence", status: .standby)
            TimelineRow(title: "Open Documents", detail: session?.openDocuments ?? "Local reports and intelligence inbox", status: .standby)
            TimelineRow(title: "Current Operation", detail: session?.currentOperation ?? "Watch Hour 9", status: .green)
            TimelineRow(title: "Current Sprint", detail: session?.currentSprint ?? "Sprint 22", status: .green)
            TimelineRow(title: "Current Objective", detail: session?.currentObjective ?? memory?.currentObjective ?? "Executive persistence", status: .standby)
            TimelineRow(title: "Last Commander Session", detail: session?.lastCommanderSession ?? memory?.lastConversation ?? "None", status: .standby)
        }
    }

    private var strategicOperationsMap: some View {
        CommandCard(title: "Strategic Operations Map", systemImage: "point.3.connected.trianglepath.dotted") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 118), spacing: 10)], spacing: 10) {
                ForEach(operationsMapNodes) { node in
                    VStack(alignment: .leading, spacing: 7) {
                        Image(systemName: node.symbol)
                            .foregroundStyle(themeManager.theme.heading)
                        Text(node.title)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.text)
                        Text(node.detail)
                            .font(.caption2)
                            .lineLimit(2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    }
                    .frame(maxWidth: .infinity, minHeight: 92, alignment: .topLeading)
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                }
            }
            ForEach(relationships.prefix(8)) { relation in
                TimelineRow(title: "\(relation.sourceTitle) -> \(relation.targetTitle)", detail: "\(relation.sourceType) to \(relation.targetType) | \(relation.notes)", status: .green)
            }
        }
    }

    private var dailyBriefPanel: some View {
        CommandCard(title: "Executive Daily Brief", systemImage: "sunrise.fill") {
            Text(currentDailyBriefMarkdown)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
                .textSelection(.enabled)
            CommanderButton(title: "Generate Local Brief", systemImage: "doc.text.fill") {
                generateDailyBrief()
            }
            ForEach(dailyBriefs.prefix(3)) { brief in
                TimelineRow(title: brief.todaysMission, detail: "Focus \(brief.focusScore)% | \(brief.suggestedNextAction)", status: .green)
            }
        }
    }

    private var legacyVaultPanel: some View {
        CommandCard(title: "Founder Legacy Vault", systemImage: "archivebox.fill") {
            Picker("Section", selection: $legacySection) {
                ForEach(legacySections, id: \.self) { section in Text(section).tag(section) }
            }
            .pickerStyle(.menu)
            TextField("Legacy title", text: $legacyTitle).livingIntelligenceField(themeManager)
            TextField("Summary", text: $legacySummary, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Archive Legacy Record", systemImage: "tray.and.arrow.down.fill") {
                saveLegacyRecord()
            }
            ForEach(legacyRecords.prefix(10)) { record in
                TimelineRow(title: "\(record.section): \(record.title)", detail: "\(record.summary) | Tags: \(record.tagsText.ifEmpty("legacy,sprint20"))", status: record.isPinned ? .green : .standby)
            }
        }
    }

    private var commanderConsolePanel: some View {
        CommandCard(title: "Commander Console", systemImage: "terminal.fill") {
            TextField("Quick note", text: $quickNote, axis: .vertical).livingIntelligenceField(themeManager)
            TextField("Daily SITREP", text: $sitrep, axis: .vertical).livingIntelligenceField(themeManager)
            CommanderButton(title: "Save Console Update", systemImage: "square.and.arrow.down.fill") {
                saveConsoleUpdate()
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Prompt Library", value: prompts.first?.title ?? "None", context: "\(prompts.count) prompts")
                MetricCard(title: "Recent Commands", value: timeline.first?.title ?? "None", context: "\(timeline.count) timeline")
                MetricCard(title: "Recent Decisions", value: decisionRecords.first?.title ?? "None", context: "\(decisionRecords.count) decisions")
                MetricCard(title: "Pinned Missions", value: pinnedMissionTitles, context: "Priority queue")
            }
        }
    }

    private var intelligenceIntegrityPanel: some View {
        CommandCard(title: "Intelligence Integrity", systemImage: "checkmark.shield.fill") {
            CommanderButton(title: "Generate Integrity Report", systemImage: "doc.badge.gearshape.fill") {
                generateIntegrityReport()
            }
            ForEach(integrityWarnings, id: \.self) { warning in
                TimelineRow(title: "Integrity", detail: warning, status: warning.hasPrefix("Integrity stable") ? .green : .amber)
            }
            if !latestIntegrity.isEmpty {
                Text(latestIntegrity)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    .textSelection(.enabled)
                    .padding(10)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
            }
        }
    }

    private var rotatingWatchCards: [WatchFloorCard] {
        [
            WatchFloorCard(title: "Current Operation", detail: activeMission, status: operationalHealth > 70 ? .green : .amber),
            WatchFloorCard(title: "Mission Priority", detail: topMissionPriority, status: topMissionPriority == CommandPriority.critical.rawValue ? .amber : .green),
            WatchFloorCard(title: "Executive Status Board", detail: "\(activeOperations.count) active operations, \(missionReadiness)% readiness", status: missionReadiness > 70 ? .green : .amber),
            WatchFloorCard(title: "Commander Focus", detail: currentFocus, status: .standby)
        ]
    }

    private var topMissionPriority: String {
        sortedMissionRecords.first?.priority ?? CommandPriority.high.rawValue
    }

    private var architectureHealth: String {
        workSessions.contains { $0.notes.localizedCaseInsensitiveContains("architecture") || $0.title.localizedCaseInsensitiveContains("architecture") } ? "Mapped" : "Stable"
    }

    private var watchTimelineItems: [String] {
        let sprintItems = localReports
            .filter { $0.title.localizedCaseInsensitiveContains("SPRINT") || $0.kind.localizedCaseInsensitiveContains("Sprint") }
            .map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Sprint History | \($0.title)" }
        let briefItems = dailyBriefs.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Daily Brief | \($0.todaysMission)" }
        let memoryItems = commanderSessions.map { "\($0.updatedAt.formatted(date: .abbreviated, time: .shortened)) | Memory | \($0.currentMission)" }
        let founderItems = founderJournal.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Founder History | \($0.title)" } +
            dailyReflections.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Reflection | \($0.title)" }
        return (executiveTimeline + sprintItems + briefItems + memoryItems + founderItems).sorted(by: >)
    }

    private var watchMapMarkers: [WatchMapMarker] {
        [
            WatchMapMarker(title: "HQ", region: "North America", x: 0.18, y: 0.34, status: .green),
            WatchMapMarker(title: "Research", region: "Europe", x: 0.52, y: 0.31, status: research.isEmpty ? .standby : .green),
            WatchMapMarker(title: "Legacy", region: "Africa", x: 0.53, y: 0.56, status: legacyRecords.isEmpty && legacyEntries.isEmpty ? .standby : .green),
            WatchMapMarker(title: "Music", region: "Pacific", x: 0.82, y: 0.69, status: music.isEmpty ? .standby : .green),
            WatchMapMarker(title: "Expansion", region: "Asia", x: 0.76, y: 0.39, status: .amber)
        ]
    }

    private var filteredWatchGraphNodes: [WatchGraphNode] {
        let nodes = [
            WatchGraphNode(title: activeMission, type: "Mission", strength: max(5, missionReadiness / 10), angle: 0),
            WatchGraphNode(title: research.first?.title ?? "Research", type: "Research", strength: max(4, min(10, research.count + researchConnections.count)), angle: .pi * 0.35),
            WatchGraphNode(title: music.first?.title ?? "Music", type: "Music", strength: max(4, min(10, music.count + 3)), angle: .pi * 0.72),
            WatchGraphNode(title: workSessions.first?.title ?? "Engineering", type: "Engineering", strength: max(4, min(10, workSessions.count + 3)), angle: .pi * 1.08),
            WatchGraphNode(title: vault.first?.title ?? "Black Vault", type: "Legacy", strength: max(4, min(10, vault.count + legacyEntries.count + 2)), angle: .pi * 1.45),
            WatchGraphNode(title: decisionRecords.first?.title ?? "Decision", type: "Mission", strength: max(4, min(10, decisionRecords.count + founderDecisions.count + 2)), angle: .pi * 1.78)
        ]
        let filtered = graphFilter == "All" ? nodes : nodes.filter { $0.type == graphFilter }
        let needle = watchGraphSearch.trimmingCharacters(in: .whitespacesAndNewlines)
        return needle.isEmpty ? filtered : filtered.filter { $0.title.localizedCaseInsensitiveContains(needle) || $0.type.localizedCaseInsensitiveContains(needle) }
    }

    private var defaultRelationshipInspector: String {
        "\(activeMission) connects to \(filteredWatchGraphNodes.map(\.type).joined(separator: ", ").ifEmpty("local knowledge")) with \(relationships.count + researchConnections.count) saved relationship signals."
    }

    private var watchHourBriefMarkdown: String {
        """
        # WATCH HOUR 9 EXECUTIVE BRIEF

        ## Morning Brief
        \(activeMission) is the active headquarters operation. Mission readiness is \(missionReadiness)% and operational health is \(operationalHealth)%.

        ## Mission Summary
        \(sortedMissionRecords.prefix(5).map { "- \($0.title): \($0.state) / \($0.priority)" }.joined(separator: "\n").ifEmpty("- Watch Hour 9 is standing by."))

        ## Intelligence Summary
        Research \(research.count), vault \(vault.count), decisions \(decisionRecords.count + founderDecisions.count), relationships \(relationships.count + researchConnections.count).

        ## Daily Objectives
        \(commanderAssistSuggestions.prefix(4).map { "- \($0)" }.joined(separator: "\n"))

        ## Threat Assessment
        \(integrityWarnings.map { "- \($0)" }.joined(separator: "\n"))

        ## Knowledge Recommendations
        \(filteredWatchGraphNodes.prefix(5).map { "- Expand \($0.type): \($0.title)" }.joined(separator: "\n").ifEmpty("- Capture one new research note and connect it to the current mission."))
        """
    }

    private var activeOperations: [String] {
        missionRecords.filter { $0.state == MissionState.missionActive.rawValue || $0.state == MissionState.missionReady.rawValue }.map(\.title)
    }

    private var commandMapNodes: [OperationsMapNode] {
        [
            OperationsMapNode(title: "HQ", symbol: "building.columns.fill", detail: "Executive OS"),
            OperationsMapNode(title: "Operations", symbol: "scope", detail: "\(activeOperations.count) active"),
            OperationsMapNode(title: "Priority", symbol: "list.star", detail: pinnedMissionTitles),
            OperationsMapNode(title: "Timeline", symbol: "timeline.selection", detail: "\(executiveTimeline.count) events"),
            OperationsMapNode(title: "Focus", symbol: "target", detail: currentFocus),
            OperationsMapNode(title: "Legacy", symbol: "archivebox.fill", detail: "\(legacyEntries.count + legacyRecords.count) records")
        ]
    }

    private var currentFocus: String {
        dailyReflections.first?.nextFocus.ifEmpty(activeMission) ?? dailyBriefs.first?.suggestedNextAction ?? activeMission
    }

    private var executiveTimeline: [String] {
        let missionItems = missionHistory.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Mission | \($0.eventTitle)" }
        let decisionItems = founderDecisions.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Founder Decision | \($0.title)" } +
            decisionRecords.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Decision | \($0.title)" }
        let insightItems = intelligenceInsights.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Insight | \($0.title)" }
        let reflectionItems = dailyReflections.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | Reflection | \($0.title)" }
        return (missionItems + decisionItems + insightItems + reflectionItems).sorted(by: >)
    }

    private var openOperationCount: Int {
        missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var intelligenceAlerts: [String] {
        var alerts: [String] = []
        if missionRecords.contains(where: { $0.state == MissionState.blocked.rawValue }) { alerts.append("Blocked mission requires review.") }
        if researchConnections.isEmpty && !research.isEmpty { alerts.append("Research needs graph connections.") }
        if dailyReflections.isEmpty { alerts.append("End-of-day review pending.") }
        if intelligenceInsights.isEmpty { alerts.append("No Sprint 22 insight captured.") }
        return alerts.isEmpty ? ["All local systems steady."] : alerts
    }

    private var filteredGraphClusters: [KnowledgeGraphCluster] {
        let clusters = [
            KnowledgeGraphCluster(title: "Mission", count: missionRecords.count + missions.count, strength: min(10, missionRecords.count + relationships.count), influence: missionCompletionPercent, detail: activeMission),
            KnowledgeGraphCluster(title: "Research", count: research.count + researchConnections.count, strength: min(10, researchConnections.map(\.strength).max() ?? research.count), influence: min(100, research.count * 12), detail: research.first?.title ?? "No active research"),
            KnowledgeGraphCluster(title: "Music", count: music.count, strength: min(10, music.count + 3), influence: min(100, music.count * 15), detail: music.first?.title ?? "No music project"),
            KnowledgeGraphCluster(title: "Engineering", count: workSessions.count, strength: min(10, workSessions.count + 4), influence: min(100, workSessions.count * 14), detail: workSessions.first?.title ?? "No engineering task"),
            KnowledgeGraphCluster(title: "Legacy", count: legacyEntries.count + legacyRecords.count, strength: min(10, (legacyEntries.count + legacyRecords.count) + 2), influence: legacyProgress, detail: legacyEntries.first?.title ?? legacyRecords.first?.title ?? "Legacy archive")
        ]
        if graphFilter == "All" { return clusters }
        return clusters.filter { $0.title == graphFilter }
    }

    private var commanderAssistSuggestions: [String] {
        var suggestions: [String] = []
        if let blocked = missionRecords.first(where: { $0.state == MissionState.blocked.rawValue }) {
            suggestions.append("Resolve blocked work: \(blocked.title).")
        }
        if let unfinished = missionRecords.first(where: { $0.state == MissionState.paused.rawValue || $0.state == MissionState.waiting.rawValue }) {
            suggestions.append("Resume unfinished mission: \(unfinished.title).")
        }
        if researchConnections.isEmpty && !research.isEmpty {
            suggestions.append("Connect active research to \(activeMission).")
        }
        if dailyReflections.isEmpty {
            suggestions.append("Complete today's end-of-day review.")
        }
        suggestions.append("Next mission recommendation: \(activeOperations.first ?? activeMission).")
        suggestions.append("Priority recommendation: \(suggestedNextAction)")
        return suggestions
    }

    private var todaysActivitySummary: String {
        "Missions \(missionRecords.count), insights \(intelligenceInsights.count), decisions \(decisionRecords.count + founderDecisions.count), reflections \(dailyReflections.count), graph links \(relationships.count + researchConnections.count)."
    }

    private var missionCompletionPercent: Int {
        let total = max(missionRecords.count + savedMissions.count, 1)
        let complete = missionRecords.filter { $0.state == MissionState.completed.rawValue || $0.state == MissionState.archived.rawValue }.count + savedMissions.filter(\.isComplete).count
        return min(100, Int((Double(complete) / Double(total)) * 100))
    }

    private var operationalHealth: Int {
        let blockers = missionRecords.filter { $0.state == MissionState.blocked.rawValue }.count
        let waiting = missionRecords.filter { $0.state == MissionState.waiting.rawValue }.count
        return max(0, min(100, 88 - blockers * 18 - waiting * 8 + min(activeOperations.count * 2, 8)))
    }

    private var knowledgeGrowth: Int {
        research.count + collections.count + vault.count + researchConnections.count + intelligenceInsights.count
    }

    private var founderActivity: Int {
        founderJournal.count + journal.count + dailyReflections.count + founderDecisions.count
    }

    private var legacyProgress: Int {
        let stored = legacyEntries.map(\.progress).reduce(0, +)
        let base = legacyEntries.isEmpty ? min(100, legacyRecords.count * 10) : stored / max(legacyEntries.count, 1)
        return min(100, base)
    }

    private var projectVelocity: Int {
        min(100, missionHistory.count * 5 + decisionRecords.count * 4 + workSessions.count * 3 + intelligenceInsights.count * 4)
    }

    private var intelligenceScore: Int {
        min(100, 58 + relationships.count * 2 + min(inboxItems.count, 12) + decisionRecords.count)
    }

    private var missionReadiness: Int {
        let total = max(missionRecords.count, 1)
        let blocked = missionRecords.filter { $0.state == MissionState.blocked.rawValue || $0.state == MissionState.waiting.rawValue }.count
        return max(0, min(100, 82 - blocked * 12 + missionRecords.filter { $0.state == MissionState.missionActive.rawValue }.count * 4 - max(total - 8, 0)))
    }

    private var weeklyProgress: Int {
        let total = max(missionRecords.count + savedMissions.count, 1)
        let complete = missionRecords.filter { $0.state == MissionState.completed.rawValue }.count + savedMissions.filter(\.isComplete).count
        return min(100, Int((Double(complete) / Double(total)) * 100) + min(decisionRecords.count * 3, 18))
    }

    private var dailyFocus: String {
        dailyBriefs.first?.todaysMission ?? memory?.currentObjective ?? "Stabilize executive persistence."
    }

    private var founderStatus: String {
        founderJournal.first?.energy ?? journal.first?.mood ?? "Focused"
    }

    private var pinnedMissionTitles: String {
        missionRecords.filter { priorityRank($0.priority) >= priorityRank(CommandPriority.high.rawValue) }.map(\.title).first ?? activeMission
    }

    private var operationsMapNodes: [OperationsMapNode] {
        [
            OperationsMapNode(title: "Commander", symbol: "scope", detail: session?.title ?? "Console ready"),
            OperationsMapNode(title: "Living Intelligence", symbol: "brain.filled.head.profile", detail: "\(relationships.count) relationships"),
            OperationsMapNode(title: "Mission Graph", symbol: "point.3.connected.trianglepath.dotted", detail: "\(missionRecords.count) queue nodes"),
            OperationsMapNode(title: "Black Vault", symbol: "archivebox.fill", detail: "\(vault.count) vault entries"),
            OperationsMapNode(title: "Research", symbol: "magnifyingglass", detail: research.first?.title ?? "No research"),
            OperationsMapNode(title: "Engineering", symbol: "hammer.fill", detail: workSessions.first?.title ?? "No session"),
            OperationsMapNode(title: "Music", symbol: "music.note.list", detail: music.first?.title ?? "No music"),
            OperationsMapNode(title: "Business", symbol: "chart.line.uptrend.xyaxis", detail: collections.first { $0.category.localizedCaseInsensitiveContains("business") }?.title ?? "Local planning"),
            OperationsMapNode(title: "Journal", symbol: "book.pages.fill", detail: founderJournal.first?.title ?? journal.first?.title ?? "No journal"),
            OperationsMapNode(title: "Knowledge", symbol: "books.vertical.fill", detail: "\(collections.count) collections"),
            OperationsMapNode(title: "Legacy", symbol: "building.columns.fill", detail: "\(legacyRecords.count) archives"),
            OperationsMapNode(title: "Relationships", symbol: "link.circle.fill", detail: "\(relationships.count) saved links")
        ]
    }

    private var currentDailyBriefMarkdown: String {
        """
        # Executive Daily Brief

        ## Today's Mission
        \(activeMission)

        ## Top Priorities
        \(sortedMissionRecords.prefix(3).map { "- \($0.title) (\($0.priority))" }.joined(separator: "\n").ifEmpty("- Stabilize Watch Hour 9"))

        ## Recent Decisions
        \(decisionRecords.prefix(3).map { "- \($0.title): \($0.outcome.ifEmpty("Pending"))" }.joined(separator: "\n").ifEmpty("- No decisions recorded yet."))

        ## Research Progress
        \(research.first?.title ?? "No research captured yet.")

        ## Sprint Progress
        Sprint 22 Watch Hour 9 is active with \(missionRecords.count) local missions.

        ## Open Tasks
        \(missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.prefix(5).map { "- \($0.title)" }.joined(separator: "\n").ifEmpty("- No open queue tasks."))

        ## Suggested Next Action
        \(suggestedNextAction)

        ## Mission Health
        \(missionReadiness)% readiness

        ## Focus Score
        \(intelligenceScore)%
        """
    }

    private var dailyExecutiveBriefMarkdown: String {
        """
        # DAILY_EXECUTIVE_BRIEF

        ## Mission Summary
        \(activeMission) is operating at \(operationalHealth)% health with \(missionCompletionPercent)% completion.

        ## Open Operations
        \(missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.prefix(8).map { "- \($0.title): \($0.state) / \($0.priority)" }.joined(separator: "\n").ifEmpty("- No open operations."))

        ## Recommendations
        \(commanderAssistSuggestions.prefix(5).map { "- \($0)" }.joined(separator: "\n"))

        ## Knowledge Added
        - Research: \(research.first?.title ?? "None")
        - Insights: \(intelligenceInsights.first?.title ?? "None")
        - Connections: \(researchConnections.count)

        ## Next Priorities
        \(sortedMissionRecords.prefix(4).map { "- \($0.title)" }.joined(separator: "\n").ifEmpty("- Maintain Founder Daily OS."))
        """
    }

    private var suggestedNextAction: String {
        if let blocked = missionRecords.first(where: { $0.state == MissionState.blocked.rawValue }) {
            return "Clear blocker on \(blocked.title)."
        }
        if let waiting = missionRecords.first(where: { $0.state == MissionState.waiting.rawValue }) {
            return "Review waiting state for \(waiting.title)."
        }
        return "Resume \(activeMission) and save one executive decision."
    }

    private func missionTimerString(_ elapsed: Int) -> String {
        let hours = elapsed / 3600
        let minutes = (elapsed % 3600) / 60
        let seconds = elapsed % 60
        return String(format: "%02d:%02d:%02d", hours, minutes, seconds)
    }

    private func relationshipInspector(for node: WatchGraphNode) -> String {
        let saved = relationships.first { relation in
            relation.sourceTitle.localizedCaseInsensitiveContains(node.title) ||
                relation.targetTitle.localizedCaseInsensitiveContains(node.title) ||
                node.title.localizedCaseInsensitiveContains(relation.sourceTitle) ||
                node.title.localizedCaseInsensitiveContains(relation.targetTitle)
        }
        if let saved {
            return "\(node.type): \(node.title) | Strength \(node.strength)/10 | \(saved.sourceTitle) -> \(saved.targetTitle) | \(saved.notes)"
        }
        return "\(node.type): \(node.title) | Strength \(node.strength)/10 | Connected to \(activeMission) by local Watch Hour inference."
    }

    private func saveCommanderQueueNote() {
        let note = commanderNoteDraft.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !note.isEmpty else { return }
        if let mission = sortedMissionRecords.first {
            mission.historyText = [mission.historyText, "\(Date.now.formatted(date: .abbreviated, time: .shortened)): \(note)"].filter { !$0.isEmpty }.joined(separator: "\n")
            mission.updatedAt = .now
            modelContext.insert(MissionHistory(missionTitle: mission.title, eventTitle: "Commander note", eventDetail: note, state: mission.state, influenceScore: 7))
        }
        let record = session ?? CommanderSession()
        record.title = "Watch Hour Commander"
        record.currentMission = activeMission
        record.currentScreen = "Executive HQ"
        record.currentOperation = "Watch Hour 9"
        record.currentSprint = "Sprint 22"
        record.currentObjective = note
        record.notes = [record.notes, note].filter { !$0.isEmpty }.joined(separator: "\n")
        record.updatedAt = .now
        if session == nil { modelContext.insert(record) }
        commanderNoteDraft = ""
        Haptics.success()
    }

    private func generateWatchHourBrief() {
        watchBriefPreview = watchHourBriefMarkdown
        modelContext.insert(LocalIntelligenceReportRecord(title: "WATCH_HOUR_9_EXECUTIVE_BRIEF", kind: "Executive Brief", markdown: watchHourBriefMarkdown))
        modelContext.insert(DailyBriefRecord(
            todaysMission: activeMission,
            topPriorities: sortedMissionRecords.prefix(5).map(\.title).joined(separator: "\n"),
            recentDecisions: (decisionRecords.prefix(3).map(\.title) + founderDecisions.prefix(3).map(\.title)).joined(separator: "\n"),
            researchProgress: "Research \(research.count), connections \(researchConnections.count)",
            sprintProgress: "Sprint 22 Watch Hour 9 active.",
            openTasks: missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.map(\.title).joined(separator: "\n"),
            suggestedNextAction: commanderAssistSuggestions.first ?? suggestedNextAction,
            missionHealth: "\(missionReadiness)% readiness",
            focusScore: intelligenceScore
        ))
        Haptics.success()
    }

    private func ensureSentinelBaseline() {
        if missionRecords.isEmpty {
            modelContext.insert(MissionRecord(
                title: "Watch Hour 9",
                status: MissionState.missionActive.rawValue,
                owner: "Founder",
                state: MissionState.missionActive.rawValue,
                priority: CommandPriority.critical.rawValue,
                sortOrder: 0,
                historyText: "Sprint 22 Watch Hour 9 seed mission."
            ))
        }
        if missionHistory.isEmpty {
            modelContext.insert(MissionHistory(missionTitle: activeMission, eventTitle: "Sprint 22 Watch Hour 9 activated", eventDetail: "Commander Watch Floor, Intelligence Timeline, Strategic World Map, Knowledge Graph 3.0, Mission Queue Commander, Black Vault Intelligence, Founder Dashboard, and Executive Brief Generator initialized.", state: MissionState.missionActive.rawValue, influenceScore: 9))
        }
        if legacyEntries.isEmpty {
            modelContext.insert(LegacyEntry(title: "ARCHAIOS Founder Edition", domain: "ARCHAIOS History", summary: "Local-first executive headquarters preserving engineering, research, music, operations, watch floor intelligence, and legacy.", progress: 22, tagsText: "archaios,sprint22,watch-hour-9"))
        }
        if dashboardStates.isEmpty {
            modelContext.insert(ExecutiveDashboardState(
                currentMission: activeMission,
                currentSprint: "Sprint 22",
                intelligenceScore: intelligenceScore,
                missionReadiness: missionReadiness,
                weeklyProgress: weeklyProgress,
                dailyFocus: dailyFocus,
                activeOperations: activeOperations.joined(separator: ", "),
                founderStatus: founderStatus,
                lastSession: session?.title ?? "Executive Persistence"
            ))
        }
        if queueStates.isEmpty {
            modelContext.insert(MissionQueueState(sortMode: queueSortMode, lastResumeMission: activeMission))
        }
        if commanderSessions.isEmpty {
            modelContext.insert(CommanderSession(currentMission: activeMission, currentOperation: "Watch Hour 9", currentSprint: "Sprint 22", currentObjective: memory?.currentObjective ?? "Operate Watch Hour 9", openDocuments: "Watch Floor, Mission Queue, Knowledge Graph 3.0, Black Vault"))
        }
        buildLocalRelationships()
    }

    private func restoreDashboardState() {
        queueSortMode = queueStates.first?.sortMode ?? "Manual"
        missionTitle = activeMission
        quickNote = session?.notes ?? ""
        let state = dashboard ?? ExecutiveDashboardState()
        state.currentMission = activeMission
        state.currentSprint = "Sprint 22"
        state.intelligenceScore = intelligenceScore
        state.missionReadiness = missionReadiness
        state.weeklyProgress = weeklyProgress
        state.dailyFocus = dailyFocus
        state.activeOperations = activeOperations.joined(separator: ", ")
        state.founderStatus = founderStatus
        state.lastSession = session?.title ?? "Executive Persistence"
        state.updatedAt = .now
        if dashboard == nil { modelContext.insert(state) }
    }

    private func resumePreviousOperation() {
        showResumePrompt = false
        if let mission = missionRecords.first(where: { $0.title == (session?.currentMission ?? activeMission) }) {
            resumeMission(mission)
        }
    }

    private func saveMission() {
        let cleanTitle = missionTitle.trimmingCharacters(in: .whitespacesAndNewlines).ifEmpty("Executive Mission")
        let nextOrder = (missionRecords.map(\.sortOrder).max() ?? -1) + 1
        modelContext.insert(MissionRecord(
            title: cleanTitle,
            status: missionState.rawValue,
            owner: "Founder",
            state: missionState.rawValue,
            priority: missionPriority,
            sortOrder: nextOrder,
            historyText: "Created in Sprint 22 Watch Hour 9."
        ))
        missionTitle = ""
        Haptics.success()
    }

    private func moveMission(_ mission: MissionRecord, delta: Int) {
        let targetOrder = mission.sortOrder + delta
        guard let other = missionRecords.first(where: { $0.sortOrder == targetOrder }) else { return }
        other.sortOrder = mission.sortOrder
        mission.sortOrder = targetOrder
        mission.updatedAt = .now
        other.updatedAt = .now
    }

    private func updateMission(_ mission: MissionRecord, state: MissionState) {
        mission.state = state.rawValue
        mission.status = state.rawValue
        mission.updatedAt = .now
        mission.archivedAt = state == .archived ? .now : mission.archivedAt
        mission.historyText = [mission.historyText, "\(Date.now.formatted(date: .abbreviated, time: .shortened)): \(state.rawValue)"].filter { !$0.isEmpty }.joined(separator: "\n")
        modelContext.insert(MissionHistory(missionTitle: mission.title, eventTitle: "Mission state changed", eventDetail: state.rawValue, state: state.rawValue, influenceScore: state == .missionActive ? 8 : 5))
    }

    private func resumeMission(_ mission: MissionRecord) {
        updateMission(mission, state: .missionActive)
        let record = session ?? CommanderSession()
        record.currentMission = mission.title
        record.currentScreen = "Executive Persistence"
        record.currentOperation = "Watch Hour 9"
        record.currentSprint = "Sprint 22"
        record.currentObjective = mission.historyText.ifEmpty("Resume mission execution.")
        record.openDocuments = "Mission Queue, Commander Console, Daily Brief"
        record.lastCommanderSession = session?.title ?? memory?.lastConversation ?? ""
        record.updatedAt = .now
        if session == nil { modelContext.insert(record) }
        queueStates.first?.lastResumeMission = mission.title
        Haptics.success()
    }

    private func saveDecisionRecord() {
        let title = decisionTitle.trimmingCharacters(in: .whitespacesAndNewlines).ifEmpty("Executive Decision")
        modelContext.insert(DecisionRecord(
            title: title,
            mission: activeMission,
            reason: decisionReason,
            alternatives: decisionAlternatives,
            outcome: decisionOutcome,
            lessonsLearned: decisionLessons,
            relatedIntelligence: inboxItems.prefix(3).map(\.title).joined(separator: ", ")
        ))
        modelContext.insert(FounderDecision(title: title, mission: activeMission, rationale: decisionReason, priority: CommandPriority.high.rawValue, impact: decisionOutcome))
        decisionTitle = ""
        decisionReason = ""
        decisionAlternatives = ""
        decisionOutcome = ""
        decisionLessons = ""
        Haptics.success()
    }

    private func generateDailyBrief() {
        modelContext.insert(DailyBriefRecord(
            todaysMission: activeMission,
            topPriorities: sortedMissionRecords.prefix(3).map(\.title).joined(separator: "\n"),
            recentDecisions: decisionRecords.prefix(3).map(\.title).joined(separator: "\n"),
            researchProgress: research.first?.title ?? "No research captured.",
            sprintProgress: "Sprint 22 Watch Hour 9 active.",
            openTasks: missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.map(\.title).joined(separator: "\n"),
            suggestedNextAction: suggestedNextAction,
            missionHealth: "\(missionReadiness)% readiness",
            focusScore: intelligenceScore
        ))
        Haptics.success()
    }

    private func generateDailyExecutiveBrief() {
        modelContext.insert(LocalIntelligenceReportRecord(title: "DAILY_EXECUTIVE_BRIEF", kind: "Daily Executive Brief", markdown: dailyExecutiveBriefMarkdown))
        modelContext.insert(DailyBriefRecord(
            todaysMission: activeMission,
            topPriorities: sortedMissionRecords.prefix(4).map(\.title).joined(separator: "\n"),
            recentDecisions: (decisionRecords.prefix(3).map(\.title) + founderDecisions.prefix(3).map(\.title)).joined(separator: "\n"),
            researchProgress: research.first?.title ?? "No research captured.",
            sprintProgress: "Sprint 22 Watch Hour 9 active.",
            openTasks: missionRecords.filter { $0.state != MissionState.completed.rawValue && $0.state != MissionState.archived.rawValue }.map(\.title).joined(separator: "\n"),
            suggestedNextAction: commanderAssistSuggestions.first ?? suggestedNextAction,
            missionHealth: "\(operationalHealth)% operational health",
            focusScore: intelligenceScore
        ))
        Haptics.success()
    }

    private func saveDailyReflection() {
        let title = "Founder Reflection \(Date.now.formatted(date: .abbreviated, time: .omitted))"
        modelContext.insert(DailyReflection(title: title, wins: reflectionWins, blockers: reflectionBlockers, lessons: todaysActivitySummary, nextFocus: suggestedNextAction, energyScore: operationalHealth))
        reflectionWins = ""
        reflectionBlockers = ""
        Haptics.success()
    }

    private func saveInsight() {
        let title = insightTitle.trimmingCharacters(in: .whitespacesAndNewlines).ifEmpty("Founder Intelligence Insight")
        modelContext.insert(IntelligenceInsight(title: title, summary: insightSummary, category: graphCluster, priority: CommandPriority.high.rawValue, relatedMission: activeMission, confidence: intelligenceScore))
        insightTitle = ""
        insightSummary = ""
        Haptics.success()
    }

    private func buildLocalRelationships() {
        guard let firstResearch = research.first?.title ?? collections.first?.title else { return }
        if !researchConnections.contains(where: { $0.sourceTitle == activeMission && $0.targetTitle == firstResearch }) {
            modelContext.insert(ResearchConnection(sourceTitle: activeMission, targetTitle: firstResearch, cluster: graphCluster, strength: max(5, min(10, intelligenceScore / 10)), notes: "Auto-linked by Sprint 22 Watch Hour 9."))
        }
    }

    private func saveLegacyRecord() {
        let title = legacyTitle.trimmingCharacters(in: .whitespacesAndNewlines).ifEmpty("\(legacySection) Archive")
        modelContext.insert(LegacyRecord(section: legacySection, title: title, summary: legacySummary, tagsText: "legacy,sprint20,\(legacySection.lowercased().replacingOccurrences(of: " ", with: "-"))"))
        legacyTitle = ""
        legacySummary = ""
        Haptics.success()
    }

    private func saveConsoleUpdate() {
        let note = quickNote.trimmingCharacters(in: .whitespacesAndNewlines)
        let report = sitrep.trimmingCharacters(in: .whitespacesAndNewlines)
        let record = session ?? CommanderSession()
        record.title = "Commander Console"
        record.currentMission = activeMission
        record.currentScreen = "Executive Persistence"
        record.currentOperation = "Watch Hour 9"
        record.currentSprint = "Sprint 22"
        record.currentObjective = report.ifEmpty(memory?.currentObjective ?? "Maintain executive persistence.")
        record.notes = [note, report].filter { !$0.isEmpty }.joined(separator: "\n")
        record.openDocuments = "Quick Notes, Daily SITREP, Prompt Library, Recent Decisions"
        record.updatedAt = .now
        if session == nil { modelContext.insert(record) }
        if !note.isEmpty {
            modelContext.insert(CommandTimelineEvent(title: "Commander Quick Note", detail: note, category: "Commander Console"))
        }
        quickNote = ""
        sitrep = ""
        Haptics.success()
    }

    private func generateIntegrityReport() {
        latestIntegrity = integrityReportMarkdown
        modelContext.insert(LocalIntelligenceReportRecord(title: "INTEGRITY_REPORT", kind: "Integrity", markdown: integrityReportMarkdown))
        Haptics.success()
    }

    private var integrityReportMarkdown: String {
        """
        # INTEGRITY_REPORT

        ## Verification
        \(integrityWarnings.map { "- \($0)" }.joined(separator: "\n"))

        ## Counts
        - Relationships: \(relationships.count)
        - Missions: \(missionRecords.count)
        - Inbox Items: \(inboxItems.count)
        - Timeline Events: \(timeline.count)
        - Legacy Records: \(legacyRecords.count)
        """
    }

    private func relationshipsFor(_ title: String) -> String {
        let matches = relationships.filter { relation in
            relation.sourceTitle.localizedCaseInsensitiveContains(title) ||
                relation.targetTitle.localizedCaseInsensitiveContains(title) ||
                title.localizedCaseInsensitiveContains(relation.sourceTitle) ||
                title.localizedCaseInsensitiveContains(relation.targetTitle)
        }
        return matches.first.map { "\($0.sourceTitle) -> \($0.targetTitle)" } ?? "None"
    }

    private func inboxSource(for category: String) -> String {
        if category.localizedCaseInsensitiveContains("book") { return "Books" }
        if category.localizedCaseInsensitiveContains("music") { return "Music" }
        if category.localizedCaseInsensitiveContains("architecture") { return "Architecture" }
        if category.localizedCaseInsensitiveContains("business") { return "Business" }
        if category.localizedCaseInsensitiveContains("vault") { return "Black Vault" }
        if category.localizedCaseInsensitiveContains("research") { return "Research" }
        return "Ideas"
    }

    private func priorityRank(_ priority: String) -> Int {
        switch priority {
        case CommandPriority.critical.rawValue: 4
        case CommandPriority.high.rawValue: 3
        case CommandPriority.normal.rawValue: 2
        default: 1
        }
    }

    private func status(for state: String) -> SystemStatus {
        switch state {
        case MissionState.missionActive.rawValue, MissionState.completed.rawValue:
            return .green
        case MissionState.blocked.rawValue:
            return .red
        case MissionState.waiting.rawValue, MissionState.paused.rawValue:
            return .amber
        default:
            return .standby
        }
    }
}

private extension View {
    func livingIntelligenceField(_ themeManager: ThemeManager) -> some View {
        self
            .textFieldStyle(.plain)
            .padding(10)
            .foregroundStyle(themeManager.theme.text)
            .background(themeManager.theme.elevatedPanel)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}

private extension String {
    func ifEmpty(_ fallback: String) -> String {
        isEmpty ? fallback : self
    }
}
