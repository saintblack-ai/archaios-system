import SwiftData
import SwiftUI

private enum WorkSessionStatus: String {
    case active = "Active"
    case paused = "Paused"
    case ended = "Ended"
}

struct LivingCommanderHomeView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \MissionControlCommand.updatedAt, order: .reverse) private var reviews: [MissionControlCommand]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var intelligence: [CommandTimelineEvent]
    @Query(sort: \WorkSessionRecord.startedAt, order: .reverse) private var sessions: [WorkSessionRecord]
    @State private var pulse = false

    private var readiness: Int {
        max(55, min(99, 92 - priorityMissions.count * 3 + briefs.prefix(1).count * 4))
    }

    private var priorityMissions: [String] {
        let active = missions.filter { $0.status != RemoteCommandStatus.complete.label }.map(\.title)
        let saved = savedMissions.filter { !$0.isComplete }.map(\.title)
        return Array((active + saved).prefix(3))
    }

    var body: some View {
        CommandCard(title: "Commander Mode", systemImage: "building.columns.circle.fill") {
            HStack(alignment: .center, spacing: 16) {
                readinessRing
                VStack(alignment: .leading, spacing: 8) {
                    Text("Welcome back, Colonel Quandrix.")
                        .font(.title3.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text(briefs.first?.body ?? "Headquarters is online. Review mission readiness, resume the active session, and clear pending reviews.")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    Text("Daily Focus: \(priorityMissions.first ?? "Select the next decisive objective")")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Readiness", value: "\(readiness)%", context: "Mission posture")
                MetricCard(title: "Priority Missions", value: "\(priorityMissions.count)", context: priorityMissions.first ?? "No active mission")
                MetricCard(title: "Pending Reviews", value: "\(reviews.filter { $0.status != RemoteCommandStatus.complete.label }.count)", context: "Local queue")
                MetricCard(title: "Intelligence", value: "\(intelligence.count)", context: intelligence.first?.category ?? "Timeline")
            }
            NavigationLink(value: AppRoute.livingCommander) {
                Label("Quick Resume: \(sessions.first { $0.status != WorkSessionStatus.ended.rawValue }?.title ?? "Enter Headquarters")", systemImage: "arrowshape.turn.up.right.fill")
                    .font(.caption.weight(.black))
                    .frame(maxWidth: .infinity)
                    .padding(12)
                    .foregroundStyle(.black)
                    .background(themeManager.theme.heading)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
            .buttonStyle(.plain)
        }
        .onAppear { pulse = true }
    }

    private var readinessRing: some View {
        ZStack {
            Circle().stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(readiness) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(readiness)%").font(.title3.weight(.black))
                Text("HQ").font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 96, height: 96)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.35).repeatForever(autoreverses: true), value: pulse)
    }
}

struct LivingCommanderView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var conversationMemory: [ConversationMemory]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timeline: [CommandTimelineEvent]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agents: [AgentStatusRecord]
    @Query(sort: \WorkSessionRecord.startedAt, order: .reverse) private var sessions: [WorkSessionRecord]
    @Query(sort: \MissionContinuationRecord.updatedAt, order: .reverse) private var continuations: [MissionContinuationRecord]
    @Query(sort: \RecentlyViewedRecord.viewedAt, order: .reverse) private var recentlyViewed: [RecentlyViewedRecord]
    @State private var sessionTitle = "Founder HQ Session"
    @State private var sessionNotes = ""
    @State private var completedWork = ""
    @State private var currentObjective = ""
    @State private var previousObjective = ""
    @State private var nextAction = ""
    @State private var requiredResources = ""
    @State private var recentFiles = ""
    @State private var pulse = false

    private var activeSession: WorkSessionRecord? {
        sessions.first { $0.status != WorkSessionStatus.ended.rawValue }
    }

    private var activeMissionTitle: String {
        missions.first { $0.status != RemoteCommandStatus.complete.label }?.title ??
            savedMissions.first { !$0.isComplete }?.title ??
            "Headquarters Daily Mission"
    }

    private var readiness: Int {
        max(55, min(99, 94 - openMissionCount * 2 + agents.filter { $0.status == SystemStatus.green.label }.count))
    }

    private var openMissionCount: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                commanderMode
                missionMemory
                founderDesk
                workSessionEngine
                missionContinuation
                commanderGuidance
                knowledgeRelationships
                agentPreparation
                futureCommandBridge
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Commander Mode")
        .onAppear {
            pulse = true
            remember("Commander Mode", type: "Screen", context: "Founder entered Headquarters.")
        }
    }

    private var commanderMode: some View {
        CommandCard(title: "Headquarters", systemImage: "building.columns.fill") {
            HStack(alignment: .center, spacing: 16) {
                readinessRing
                VStack(alignment: .leading, spacing: 8) {
                    Text("Welcome back, Colonel Quandrix.")
                        .font(.title2.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text(briefs.first?.body ?? "Today's brief is waiting. Review mission queue, resume your session, and capture the next decision.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Daily Focus: \(activeMissionTitle)")
                        .font(.caption.weight(.black))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.88))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Mission Readiness", value: "\(readiness)%", context: "HQ posture")
                MetricCard(title: "Priority Missions", value: "\(openMissionCount)", context: activeMissionTitle)
                MetricCard(title: "Pending Reviews", value: "\(pendingReviews)", context: "Local review queue")
                MetricCard(title: "Recent Intel", value: "\(timeline.count + vault.count)", context: "Local intelligence")
            }
        }
    }

    private var missionMemory: some View {
        CommandCard(title: "Mission Memory", systemImage: "memories") {
            memoryLine("Recent Missions", missions.map(\.title) + savedMissions.map(\.title))
            memoryLine("Recent Conversations", conversations.map(\.title) + conversationMemory.map(\.title))
            memoryLine("Recent Research", research.map(\.title))
            memoryLine("Recent Journal", founderJournal.map(\.title) + journal.map(\.title))
            memoryLine("Recent Music", music.map(\.title))
            memoryLine("Recent Prompts", prompts.map(\.title))
            memoryLine("Recently Viewed", recentlyViewed.map { "\($0.itemType): \($0.title)" })
        }
    }

    private var founderDesk: some View {
        CommandCard(title: "Founder Desk", systemImage: "macwindow.on.rectangle") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Morning Brief", value: briefs.first?.category ?? "Ready", context: briefs.first?.title ?? "Create brief")
                MetricCard(title: "Mission Queue", value: "\(openMissionCount)", context: activeMissionTitle)
                MetricCard(title: "Session Timer", value: sessionDurationLabel, context: activeSession?.status ?? "No session")
                MetricCard(title: "Commander Notes", value: "\(founderJournal.count + journal.count)", context: "Journal")
                MetricCard(title: "Today's Goals", value: "\(todayGoals)", context: "Local objectives")
                MetricCard(title: "Recent Builds", value: "\(timeline.filter { $0.category == "Build" }.count)", context: "Timeline")
                MetricCard(title: "Research", value: "\(research.count)", context: "Progress")
                MetricCard(title: "Music", value: "\(music.count)", context: "Progress")
            }
        }
    }

    private var workSessionEngine: some View {
        CommandCard(title: "Work Session Engine", systemImage: "timer.circle.fill") {
            TextField("Session title", text: $sessionTitle)
                .livingField(themeManager)
            TextField("Completed work", text: $completedWork, axis: .vertical)
                .livingField(themeManager)
            TextField("Notes", text: $sessionNotes, axis: .vertical)
                .livingField(themeManager)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 130), spacing: 10)], spacing: 10) {
                sessionButton("Start Session", "play.fill") { startSession() }
                sessionButton("Pause Session", "pause.fill") { pauseSession() }
                sessionButton("Resume Session", "arrow.clockwise") { resumeSession() }
                sessionButton("End Session", "stop.fill") { endSession() }
            }
            ForEach(sessions.prefix(4)) { session in
                TimelineRow(title: session.title, detail: "\(session.status) | \(formatDuration(session.durationSeconds)) | \(session.notes)", status: session.status == WorkSessionStatus.ended.rawValue ? .green : .standby)
            }
        }
    }

    private var missionContinuation: some View {
        CommandCard(title: "Mission Continuation", systemImage: "arrow.triangle.branch") {
            TextField("Current Objective", text: $currentObjective, axis: .vertical).livingField(themeManager)
            TextField("Previous Objective", text: $previousObjective, axis: .vertical).livingField(themeManager)
            TextField("Next Suggested Action", text: $nextAction, axis: .vertical).livingField(themeManager)
            TextField("Required Resources", text: $requiredResources, axis: .vertical).livingField(themeManager)
            TextField("Recent Files", text: $recentFiles, axis: .vertical).livingField(themeManager)
            CommanderButton(title: "Save Mission Continuation", systemImage: "tray.and.arrow.down.fill") {
                saveContinuation()
            }
            ForEach(continuations.prefix(3)) { item in
                VStack(alignment: .leading, spacing: 5) {
                    Text(item.missionTitle)
                        .font(.subheadline.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Current: \(item.currentObjective)")
                    Text("Previous: \(item.previousObjective)")
                    Text("Next: \(item.nextSuggestedAction)")
                    Text("Resources: \(item.requiredResources)")
                    Text("Files: \(item.recentFiles)")
                    Text("Related: \(item.relatedKnowledge)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .padding(.vertical, 5)
            }
        }
    }

    private var commanderGuidance: some View {
        CommandCard(title: "Commander Guidance", systemImage: "lightbulb.max.fill") {
            ForEach(guidance, id: \.self) { item in
                Label(item, systemImage: "chevron.right.circle.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(themeManager.theme.text)
            }
        }
    }

    private var knowledgeRelationships: some View {
        CommandCard(title: "Related Knowledge", systemImage: "point.3.connected.trianglepath.dotted") {
            relationshipLine("Mission", activeMissionTitle)
            relationshipLine("Conversation", conversations.first?.title ?? conversationMemory.first?.title ?? "No conversation yet")
            relationshipLine("Journal", founderJournal.first?.title ?? journal.first?.title ?? "No journal yet")
            relationshipLine("Research", research.first?.title ?? "No research yet")
            relationshipLine("Prompt", prompts.first?.title ?? "No prompt yet")
            relationshipLine("Music", music.first?.title ?? "No music idea yet")
            relationshipLine("Black Vault", vault.first?.title ?? "No vault entry yet")
        }
    }

    private var agentPreparation: some View {
        CommandCard(title: "Agent Preparation", systemImage: "person.3.sequence.fill") {
            CommanderButton(title: "Seed Local Agent Runtime", systemImage: "person.crop.circle.badge.plus") {
                seedAgentRuntime()
            }
            ForEach(agentRows, id: \.name) { agent in
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(agent.name)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        StatusPill(title: agent.status, status: status(from: agent.status))
                    }
                    Text("Memory: \(agent.nextAction)")
                    Text("Queue: \(agent.queue) | Mission: \(agent.assignedMission) | Priority: \(agent.priority)")
                    Text("Future Capabilities: \(agent.capabilities)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
                .padding(.vertical, 4)
            }
        }
    }

    private var futureCommandBridge: some View {
        CommandCard(title: "Future Command Bridge", systemImage: "switch.2") {
            Text("Protocol interfaces only. No networking, API keys, servers, commits, pushes, or deployments.")
                .font(.caption.weight(.bold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            ForEach(FutureCommandBridge.providers.map { provider in
                let response = provider.mockResponse(for: "Founder readiness check")
                return "\(response.provider): \(response.summary) | \(response.suggestedAction)"
            }, id: \.self) { line in
                Text(line)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    .padding(.vertical, 2)
            }
        }
    }

    private var readinessRing: some View {
        ZStack {
            Circle().stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(readiness) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(readiness)%").font(.title3.weight(.black))
                Text("Ready").font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 102, height: 102)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.35).repeatForever(autoreverses: true), value: pulse)
    }

    private var pendingReviews: Int {
        timeline.filter { $0.category.localizedCaseInsensitiveContains("Review") }.count +
            continuations.filter { !$0.nextSuggestedAction.isEmpty }.count
    }

    private var todayGoals: Int {
        let today = Calendar.current.startOfDay(for: .now)
        return briefs.filter { $0.createdAt >= today }.count + sessions.filter { $0.startedAt >= today }.count
    }

    private var sessionDurationLabel: String {
        guard let session = activeSession else { return "0m" }
        let base = session.durationSeconds
        let active = session.status == WorkSessionStatus.active.rawValue ? Date.now.timeIntervalSince(session.startedAt) : 0
        return formatDuration(base + active)
    }

    private var guidance: [String] {
        var items: [String] = []
        let today = Calendar.current.startOfDay(for: .now)
        if !vault.contains(where: { $0.createdAt >= today }) {
            items.append("You haven't reviewed Black Vault today.")
        }
        if let mission = missions.first(where: { $0.title.localizedCaseInsensitiveContains("Iron Gate") }) {
            let unfinished = mission.checklistText.split(separator: "|").filter { !$0.localizedCaseInsensitiveContains("done") }.count
            items.append("Operation Iron Gate still has \(max(unfinished, 1)) unfinished tasks.")
        } else if openMissionCount > 0 {
            items.append("\(activeMissionTitle) is still open. Review the next suggested action.")
        }
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: today) ?? today
        let yesterdayMusic = music.filter { $0.createdAt >= yesterday && $0.createdAt < today }.count
        if yesterdayMusic > 0 {
            items.append("You added \(yesterdayMusic) music ideas yesterday.")
        }
        if let session = sessions.first(where: { $0.status == WorkSessionStatus.paused.rawValue }) {
            items.append("Resume yesterday's engineering session: \(session.title)?")
        }
        if items.isEmpty {
            items.append("Headquarters is stable. Start a focused work session and log one completed result.")
        }
        return items
    }

    private var agentRows: [(name: String, status: String, assignedMission: String, priority: String, nextAction: String, queue: Int, capabilities: String)] {
        let defaultNames = ["Commander", "Engineer", "Architect", "Research", "Music", "Operations", "Security", "Archivist"]
        let records = agents.isEmpty ? defaultNames.map {
            AgentStatusRecord(name: $0, assignedMission: activeMissionTitle, nextAction: "Maintain memory, queue, priority, current status, and future capabilities.")
        } : agents
        return records.map { record in
            (
                record.name,
                record.status,
                record.assignedMission,
                record.priority,
                record.nextAction,
                missions.filter { $0.tagsText.localizedCaseInsensitiveContains(record.name) }.count,
                capabilities(for: record.name)
            )
        }
    }

    private func memoryLine(_ title: String, _ values: [String]) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text(title)
                .font(.subheadline.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            Text(values.prefix(4).joined(separator: " | ").isEmpty ? "No local memory yet." : values.prefix(4).joined(separator: " | "))
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
        }
        .padding(.vertical, 3)
    }

    private func relationshipLine(_ type: String, _ title: String) -> some View {
        HStack {
            Text(type)
                .font(.caption.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
                .frame(width: 92, alignment: .leading)
            Image(systemName: "arrow.right")
                .font(.caption)
                .foregroundStyle(themeManager.theme.heading.opacity(0.70))
            Text(title)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
            Spacer()
        }
    }

    private func sessionButton(_ title: String, _ symbol: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: symbol)
                .font(.caption.weight(.black))
                .frame(maxWidth: .infinity)
                .padding(10)
                .foregroundStyle(.black)
                .background(themeManager.theme.heading)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private func startSession() {
        let title = sessionTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Founder HQ Session" : sessionTitle
        modelContext.insert(WorkSessionRecord(title: title, notes: sessionNotes))
        modelContext.insert(CommandTimelineEvent(title: "Session started", detail: title, category: "Work Session"))
        remember(title, type: "Session", context: "Started from Living Commander.")
    }

    private func pauseSession() {
        guard let session = activeSession else { return }
        session.durationSeconds += Date.now.timeIntervalSince(session.startedAt)
        session.pausedAt = .now
        session.status = WorkSessionStatus.paused.rawValue
        session.completedWork = completedWork
        session.notes = sessionNotes
        modelContext.insert(CommandTimelineEvent(title: "Session paused", detail: session.title, category: "Work Session"))
    }

    private func resumeSession() {
        guard let session = activeSession else { return }
        session.startedAt = .now
        session.status = WorkSessionStatus.active.rawValue
        session.pausedAt = nil
        modelContext.insert(CommandTimelineEvent(title: "Session resumed", detail: session.title, category: "Work Session"))
    }

    private func endSession() {
        guard let session = activeSession else { return }
        if session.status == WorkSessionStatus.active.rawValue {
            session.durationSeconds += Date.now.timeIntervalSince(session.startedAt)
        }
        session.endedAt = .now
        session.status = WorkSessionStatus.ended.rawValue
        session.completedWork = completedWork
        session.notes = sessionNotes
        modelContext.insert(CommandTimelineEvent(title: "Session ended", detail: "\(session.title) | \(formatDuration(session.durationSeconds)) | \(completedWork)", category: "Work Session"))
    }

    private func saveContinuation() {
        let current = currentObjective.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Continue \(activeMissionTitle)" : currentObjective
        modelContext.insert(MissionContinuationRecord(
            missionTitle: activeMissionTitle,
            currentObjective: current,
            previousObjective: previousObjective,
            nextSuggestedAction: nextAction,
            requiredResources: requiredResources,
            recentFiles: recentFiles,
            relatedKnowledge: relatedKnowledgeSummary
        ))
        modelContext.insert(CommandTimelineEvent(title: "Mission continuation saved", detail: activeMissionTitle, category: "Mission Memory"))
        remember(activeMissionTitle, type: "Mission", context: current)
    }

    private func seedAgentRuntime() {
        let names = ["Commander", "Engineer", "Architect", "Research", "Music", "Operations", "Security", "Archivist"]
        let existing = Set(agents.map(\.name))
        for name in names where !existing.contains(name) {
            modelContext.insert(AgentStatusRecord(
                name: name,
                status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label,
                priority: name == "Security" ? CommandPriority.critical.rawValue : CommandPriority.high.rawValue,
                assignedMission: activeMissionTitle,
                lastActivity: "Prepared in Living Commander.",
                nextAction: "Maintain local memory, queue, status, and future capabilities."
            ))
        }
    }

    private func remember(_ title: String, type: String, context: String) {
        modelContext.insert(RecentlyViewedRecord(title: title, itemType: type, context: context))
    }

    private var relatedKnowledgeSummary: String {
        [
            conversations.first?.title,
            founderJournal.first?.title ?? journal.first?.title,
            research.first?.title,
            prompts.first?.title,
            music.first?.title,
            vault.first?.title
        ]
        .compactMap { $0 }
        .joined(separator: " | ")
    }

    private func status(from label: String) -> SystemStatus {
        switch label {
        case SystemStatus.green.label: .green
        case SystemStatus.amber.label: .amber
        case SystemStatus.red.label: .red
        default: .standby
        }
    }

    private func capabilities(for agent: String) -> String {
        switch agent {
        case "Commander": "briefing, guidance, review"
        case "Engineer": "build prep, code review, task queue"
        case "Architect": "systems map, continuation, constraints"
        case "Research": "notes, sources, synthesis"
        case "Music": "ideas, lyrics, release planning"
        case "Operations": "mission board, blockers, timeline"
        case "Security": "secrets review, local safety, readiness"
        case "Archivist": "vault memory, relationships, recently viewed"
        default: "local memory and queue"
        }
    }

    private func formatDuration(_ seconds: Double) -> String {
        let minutes = Int(seconds / 60)
        let hours = minutes / 60
        let remaining = minutes % 60
        return hours > 0 ? "\(hours)h \(remaining)m" : "\(max(minutes, 0))m"
    }
}

private extension View {
    func livingField(_ themeManager: ThemeManager) -> some View {
        self
            .textFieldStyle(.plain)
            .padding(10)
            .foregroundStyle(themeManager.theme.text)
            .background(themeManager.theme.elevatedPanel)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
