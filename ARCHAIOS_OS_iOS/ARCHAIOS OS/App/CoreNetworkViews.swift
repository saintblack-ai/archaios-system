import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct CoreNetworkView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @EnvironmentObject private var container: AppContainer
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var legacyConversations: [ConversationMemory]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \KnowledgeRelationship.createdAt, order: .reverse) private var relationships: [KnowledgeRelationship]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agentRecords: [AgentStatusRecord]
    @Query(sort: \Agent.createdAt, order: .reverse) private var agents: [Agent]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timelineEvents: [CommandTimelineEvent]
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \MissionControlCommand.createdAt, order: .reverse) private var missionCommands: [MissionControlCommand]
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var remoteCommands: [RemoteCommand]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @State private var consoleInput = ""
    @State private var streamText = "Core Network ready. Local-first runtime online."
    @State private var isStreaming = false
    @State private var selectedBrief = "Morning Brief"
    @State private var pulse = false

    private var openMissions: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var readiness: Int {
        max(50, min(99, 88 - openMissions * 3 + completedMissionCount * 2))
    }

    private var completedMissionCount: Int {
        missions.filter { $0.status == RemoteCommandStatus.complete.label }.count + savedMissions.filter(\.isComplete).count
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                founderDashboard
                commanderConsole
                missionGraph
                founderTimeline
                localAgentRuntime
                intelligenceBriefingEngine
                offlineAIGateway
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Core Network")
        .onAppear { pulse = true }
    }

    private var founderDashboard: some View {
        CommandCard(title: "Founder Dashboard 3.0", systemImage: "scope") {
            HStack(alignment: .center, spacing: 16) {
                readinessRing
                VStack(alignment: .leading, spacing: 8) {
                    Text("Daily Focus")
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Orchestrate local intelligence, preserve Founder memory, and stage future cloud agents behind feature flags.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Quick Launch: Commander Console, Mission Graph, Agent Runtime, Offline Gateway")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.84))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Readiness", value: "\(readiness)%", context: "Founder command")
                MetricCard(title: "Active Missions", value: "\(openMissions)", context: "Mission queue")
                MetricCard(title: "Agent Status", value: "\(agentRows.count)", context: "Persistent agents")
                MetricCard(title: "Infrastructure", value: "Mock", context: "No live calls")
                MetricCard(title: "Intel Feed", value: "\(timelineFeed.count)", context: "Local events")
                MetricCard(title: "Relationships", value: "\(relationships.count)", context: "Graph edges")
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
                Text("CORE").font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 96, height: 96)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.5).repeatForever(autoreverses: true), value: pulse)
    }

    private var commanderConsole: some View {
        CommandCard(title: "Commander Console", systemImage: "message.badge.waveform") {
            HStack {
                StatusPill(title: "History \(conversations.count + legacyConversations.count)", status: .green)
                StatusPill(title: "Pinned \(conversations.filter(\.isPinned).count)", status: .standby)
                StatusPill(title: "Favorites \(conversations.filter(\.isFavorite).count + legacyConversations.filter(\.isFavorite).count)", status: .amber)
            }
            Text(streamText)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(themeManager.theme.text)
                .padding()
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.black.opacity(0.34))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            if isStreaming {
                ProgressView("Streaming local response...")
                    .tint(themeManager.theme.heading)
                    .foregroundStyle(themeManager.theme.heading)
            }
            TextField("Ask Commander", text: $consoleInput, axis: .vertical)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            HStack {
                Button("Send") { sendCommanderMessage() }
                Button("Copy") { copy(streamText) }
                Button("Export") { exportConsole() }
            }
            .font(.caption.weight(.bold))
            .foregroundStyle(themeManager.theme.heading)
            ForEach(conversations.prefix(3)) { conversation in
                markdownConversationRow(conversation)
            }
            ForEach(legacyConversations.prefix(2)) { memory in
                TimelineRow(title: memory.title, detail: memory.response, status: memory.isFavorite ? .green : .standby)
            }
        }
    }

    private func markdownConversationRow(_ conversation: Conversation) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            HStack {
                Text(conversation.title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Spacer()
                Image(systemName: conversation.isPinned ? "pin.fill" : "pin")
                Image(systemName: conversation.isFavorite ? "star.fill" : "star")
            }
            .foregroundStyle(themeManager.theme.heading)
            markdownBlock(conversation.messagesText)
            Text("Mission conversation: \(conversation.folder)")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.80))
        }
        .padding(.vertical, 5)
    }

    @ViewBuilder
    private func markdownBlock(_ text: String) -> some View {
        if text.contains("```") {
            let parts = text.components(separatedBy: "```")
            VStack(alignment: .leading, spacing: 8) {
                ForEach(Array(parts.enumerated()), id: \.offset) { index, part in
                    if index.isMultiple(of: 2) {
                        markdownText(part)
                    } else {
                        Text(part.trimmingCharacters(in: .whitespacesAndNewlines))
                            .font(.system(.caption, design: .monospaced))
                            .foregroundStyle(themeManager.theme.text)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .background(Color.black.opacity(0.34))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                }
            }
        } else {
            markdownText(text)
        }
    }

    @ViewBuilder
    private func markdownText(_ text: String) -> some View {
        if let attributed = try? AttributedString(markdown: text) {
            Text(attributed)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.74))
        } else {
            Text(text)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.74))
        }
    }

    private var missionGraph: some View {
        CommandCard(title: "Mission Graph", systemImage: "point.3.connected.trianglepath.dotted") {
            Text("Visual local graph of missions, research, conversations, journal, Black Vault, agents, and relationships.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            ZStack {
                ForEach(0..<3) { ring in
                    Circle()
                        .stroke(themeManager.theme.heading.opacity(0.12), lineWidth: 1)
                        .frame(width: CGFloat(120 + ring * 76), height: CGFloat(120 + ring * 76))
                }
                graphNode("Missions", count: missions.count + savedMissions.count, x: 0, y: -92)
                graphNode("Research", count: research.count, x: 96, y: -30)
                graphNode("Convos", count: conversations.count + legacyConversations.count, x: 82, y: 72)
                graphNode("Journal", count: journal.count + founderJournal.count, x: -82, y: 72)
                graphNode("Vault", count: vault.count, x: -96, y: -30)
                graphNode("Agents", count: agentRows.count, x: 0, y: 0)
            }
            .frame(maxWidth: .infinity, minHeight: 250)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 8)], spacing: 8) {
                MetricCard(title: "Relationships", value: "\(relationships.count)", context: "Local edges")
                MetricCard(title: "Knowledge", value: "\(knowledge.count)", context: "Nodes")
                MetricCard(title: "Music", value: "\(music.count)", context: "Creative intel")
            }
        }
    }

    private func graphNode(_ title: String, count: Int, x: CGFloat, y: CGFloat) -> some View {
        VStack(spacing: 3) {
            Text("\(count)")
                .font(.caption.weight(.black))
            Text(title)
                .font(.caption2.weight(.semibold))
        }
        .foregroundStyle(.black)
        .frame(width: title == "Agents" ? 88 : 76, height: title == "Agents" ? 88 : 76)
        .background(title == "Agents" ? themeManager.theme.heading : themeManager.theme.heading.opacity(0.82))
        .clipShape(Circle())
        .offset(x: x, y: y)
    }

    private var founderTimeline: some View {
        CommandCard(title: "Founder Timeline", systemImage: "timeline.selection") {
            ForEach(timelineFeed.prefix(12), id: \.id) { event in
                TimelineRow(title: event.title, detail: "\(event.type) | \(event.date.formatted(date: .abbreviated, time: .shortened))", status: event.status)
            }
        }
    }

    private var localAgentRuntime: some View {
        CommandCard(title: "Local Agent Runtime", systemImage: "cpu.fill") {
            CommanderButton(title: "Seed Core Agents", systemImage: "person.crop.circle.badge.plus") {
                seedAgents()
            }
            ForEach(agentRows, id: \.name) { agent in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(agent.name)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        StatusPill(title: agent.status, status: agent.status == SystemStatus.green.label ? .green : .standby)
                    }
                    Text("Queue: \(agent.queue) | Mission: \(agent.currentMission)")
                    Text("Memory: \(agent.memory) | Priority: \(agent.priority)")
                    Text("Last: \(agent.lastActivity)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .padding(.vertical, 6)
            }
        }
    }

    private var intelligenceBriefingEngine: some View {
        CommandCard(title: "Intelligence Briefing Engine", systemImage: "doc.text.image.fill") {
            Picker("Brief", selection: $selectedBrief) {
                ForEach(["Morning Brief", "Evening Review", "Weekly Review", "Mission Summary", "Risk Assessment"], id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)
            CommanderButton(title: "Generate Core Brief", systemImage: "plus.square.on.square") {
                generateBrief()
            }
            ForEach(briefs.prefix(5)) { brief in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(brief.title)
                            .font(.headline)
                        Spacer()
                        Text("\(brief.readinessScore)%")
                            .font(.caption.weight(.black))
                    }
                    .foregroundStyle(themeManager.theme.heading)
                    Text(brief.body)
                    Text("Risk: \(brief.blockersText)")
                    Text("Recommended Next Action: \(brief.nextActionsText)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .padding()
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
    }

    private var offlineAIGateway: some View {
        CommandCard(title: "Offline AI Gateway", systemImage: "network.slash") {
            Text("Architecture is future-ready. All integrations are disabled and make no live API calls.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                gatewayCard("ChatGPT", connected: container.backend.isOpenAIEnabled)
                gatewayCard("Codex", connected: container.backend.isCodexBridgeEnabled)
                gatewayCard("OpenClaw", connected: container.backend.isOpenClawBridgeEnabled)
                gatewayCard("GitHub", connected: container.backend.isGitHubBridgeEnabled)
                gatewayCard("Notion", connected: container.backend.isNotionBridgeEnabled)
                gatewayCard("Supabase", connected: container.backend.isSupabaseBridgeEnabled)
                gatewayCard("Cloudflare", connected: container.backend.isCloudflareBridgeEnabled)
                gatewayCard("Local LLM", connected: container.backend.isLocalLLMEnabled)
            }
        }
    }

    private func gatewayCard(_ title: String, connected: Bool) -> some View {
        VStack(alignment: .leading, spacing: 7) {
            Text(title)
                .font(.headline)
                .foregroundStyle(themeManager.theme.text)
            StatusPill(title: connected ? "Connected" : "Disabled", status: connected ? .green : .standby)
            Text("Future connector protocol staged")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.62))
        }
        .padding()
        .background(themeManager.theme.elevatedPanel)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }

    private struct TimelineItem: Identifiable {
        let id = UUID()
        let title: String
        let type: String
        let date: Date
        let status: SystemStatus
    }

    private var timelineFeed: [TimelineItem] {
        let commands = (missionCommands.map { TimelineItem(title: $0.title, type: "Command", date: $0.createdAt, status: .standby) } +
            remoteCommands.map { TimelineItem(title: $0.title, type: "Command", date: $0.createdAt, status: .standby) })
        let builds = [TimelineItem(title: "Local iOS Build", type: "Build", date: .now, status: .green)]
        let researchItems = research.map { TimelineItem(title: $0.title, type: "Research", date: $0.createdAt, status: .green) }
        let missionItems = missions.map { TimelineItem(title: $0.title, type: "Mission", date: $0.createdAt, status: $0.status == RemoteCommandStatus.complete.label ? .green : .amber) }
        let briefItems = briefs.map { TimelineItem(title: $0.title, type: "Daily Brief", date: $0.createdAt, status: .green) }
        let journalItems = journal.map { TimelineItem(title: $0.title, type: "Journal", date: $0.createdAt, status: .standby) } +
            founderJournal.map { TimelineItem(title: $0.title, type: "Journal", date: $0.createdAt, status: .standby) }
        let eventItems = timelineEvents.map { TimelineItem(title: $0.title, type: $0.category, date: $0.createdAt, status: .standby) }
        return (commands + builds + researchItems + missionItems + briefItems + journalItems + eventItems).sorted { $0.date > $1.date }
    }

    private var agentRows: [(name: String, status: String, queue: Int, currentMission: String, memory: String, priority: String, lastActivity: String)] {
        if !agentRecords.isEmpty {
            return agentRecords.map { ($0.name, $0.status, openMissions, $0.assignedMission, "\(knowledge.count) nodes", $0.priority, $0.lastActivity) }
        }
        if !agents.isEmpty {
            return agents.map { ($0.name, $0.status, $0.queueLength, missions.first?.title ?? "Core Network", "\(knowledge.count) nodes", CommandPriority.normal.rawValue, $0.lastActivity) }
        }
        return ["Commander", "Architect", "Engineer", "Security", "Research", "Music", "Operations"].map {
            ($0, $0 == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label, openMissions, missions.first?.title ?? "Core Network", "\(knowledge.count) nodes", CommandPriority.high.rawValue, "Runtime staged locally.")
        }
    }

    private func sendCommanderMessage() {
        let prompt = consoleInput.trimmingCharacters(in: .whitespacesAndNewlines)
        let clean = prompt.isEmpty ? "Core Network status check" : prompt
        let response = """
        **Local Commander Response**
        Mission: \(clean)
        ```swift
        route = "Core Network"
        mode = "offline"
        ```
        Recommended Next Action: generate a mission summary and assign the Engineer agent.
        """
        modelContext.insert(Conversation(
            title: clean.count > 44 ? String(clean.prefix(41)) + "..." : clean,
            folder: "Mission",
            messagesText: "Founder: \(clean)\n\nCommander: \(response)",
            isPinned: conversations.isEmpty,
            isFavorite: false
        ))
        stream(response)
        consoleInput = ""
        Haptics.success()
    }

    private func stream(_ response: String) {
        isStreaming = true
        streamText = ""
        Task {
            for word in response.split(separator: " ").prefix(34) {
                try? await Task.sleep(nanoseconds: 45_000_000)
                await MainActor.run {
                    streamText += streamText.isEmpty ? String(word) : " \(word)"
                }
            }
            try? await Task.sleep(nanoseconds: 300_000_000)
            await MainActor.run {
                withAnimation(.easeInOut(duration: 0.2)) {
                    isStreaming = false
                }
            }
        }
    }

    private func exportConsole() {
        modelContext.insert(VaultEntry(title: "Commander Console Export", category: "Core Network", tagLine: streamText, importance: 9))
        Haptics.success()
    }

    private func copy(_ text: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
        Haptics.selection()
    }

    private func seedAgents() {
        guard agentRecords.isEmpty else { return }
        for name in ["Commander", "Architect", "Engineer", "Security", "Research", "Music", "Operations"] {
            modelContext.insert(AgentStatusRecord(
                name: name,
                status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label,
                priority: name == "Security" ? CommandPriority.critical.rawValue : CommandPriority.high.rawValue,
                assignedMission: missions.first?.title ?? "ARCHAIOS Core Network",
                lastActivity: "Core runtime initialized locally.",
                nextAction: "Maintain queue and report mission blockers."
            ))
        }
        Haptics.success()
    }

    private func generateBrief() {
        modelContext.insert(DailyBriefCard(
            title: selectedBrief,
            category: selectedBrief,
            body: "\(selectedBrief) generated by the local Intelligence Briefing Engine. Readiness is \(readiness)%. Active missions: \(openMissions).",
            readinessScore: readiness,
            winsText: "Core Network layer is local-first and feature-flag safe.",
            blockersText: openMissions == 0 ? "No open mission blockers." : "\(openMissions) active mission lanes require review.",
            nextActionsText: "Assign Engineer, review Security risk, export summary to Black Vault."
        ))
        modelContext.insert(CommandTimelineEvent(title: selectedBrief, detail: "Core Network brief generated locally.", category: "Daily Brief"))
        Haptics.success()
    }
}
