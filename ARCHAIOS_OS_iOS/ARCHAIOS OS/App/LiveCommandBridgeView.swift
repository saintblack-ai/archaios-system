import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

private struct LiveProviderCard: Identifiable {
    let id = UUID()
    let name: String
    let status: SystemStatus
    let connection: String
    let capabilities: [String]
    let queue: Int
    let lastSync: String
    let actions: [String]
}

private struct BridgeAgentRow: Identifiable {
    let id = UUID()
    let name: String
    let currentMission: String
    let reasoningLog: String
    let memorySummary: String
    let lastAction: String
    let confidence: Int
    let queueLength: Int
    let status: SystemStatus
}

private enum CommandHistoryFilter: String, CaseIterable, Identifiable {
    case today = "Today"
    case week = "Week"
    case month = "Month"
    case mission = "Mission"
    case agent = "Agent"
    case provider = "Provider"

    var id: String { rawValue }
}

struct LiveCommandBridgeView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var memories: [ConversationMemory]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \MissionControlCommand.updatedAt, order: .reverse) private var routedCommands: [MissionControlCommand]
    @Query(sort: \RemoteCommand.updatedAt, order: .reverse) private var remoteCommands: [RemoteCommand]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agentRecords: [AgentStatusRecord]
    @Query(sort: \Agent.createdAt, order: .reverse) private var agents: [Agent]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timeline: [CommandTimelineEvent]
    @State private var commandText = ""
    @State private var bridgeStream = "ARCHAIOS Live Command Bridge online. Mock adapters armed. Local-first posture confirmed."
    @State private var isStreaming = false
    @State private var editingCommand = false
    @State private var selectedMissionTitle = "No mission attached"
    @State private var vaultSearch = ""
    @State private var selectedHistoryFilter = CommandHistoryFilter.today
    @State private var pulse = false

    private var activeMissionCount: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var readiness: Int {
        max(52, min(99, 91 - activeMissionCount * 2 + completedTodayCount))
    }

    private var completedTodayCount: Int {
        let today = Calendar.current.startOfDay(for: .now)
        return routedCommands.filter { $0.status == RemoteCommandStatus.complete.label && $0.updatedAt >= today }.count
    }

    private var missionTitles: [String] {
        ["No mission attached"] + missions.map(\.title) + savedMissions.map(\.title)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Live Command Bridge", subtitle: "Unified local command layer for ARCHAIOS conversations, providers, missions, agents, vault memory, and command history.")
                founderCockpit
                unifiedCommander
                providerRouter
                missionInbox
                agentConsole
                blackVaultTwo
                commandHistory
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Live Bridge")
        .onAppear { pulse = true }
    }

    private var founderCockpit: some View {
        CommandCard(title: "Founder Cockpit", systemImage: "rectangle.3.group.bubble.left.fill") {
            HStack(alignment: .center, spacing: 16) {
                readinessDial
                VStack(alignment: .leading, spacing: 8) {
                    Text("Daily Brief")
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.heading)
                    Text(briefs.first?.body ?? "Hold command discipline. Route one high-value command, attach it to a mission, and archive the result locally.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Quick Launch: Commander, Providers, Mission Inbox, Black Vault 2.0")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.84))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Readiness", value: "\(readiness)%", context: "Mission posture")
                MetricCard(title: "Active Agents", value: "\(agentConsoleRows.count)", context: "Local runtime")
                MetricCard(title: "Recent Builds", value: "\(timeline.filter { $0.category == "Build" }.count)", context: "Timeline")
                MetricCard(title: "Knowledge Growth", value: "\(knowledge.count + research.count + vault.count)", context: "Local memory")
                MetricCard(title: "Open Blockers", value: "\(routedCommands.filter { $0.status == RemoteCommandStatus.blocked.label }.count)", context: "Inbox")
                MetricCard(title: "Infrastructure", value: "Mock", context: "No production calls")
            }
        }
    }

    private var readinessDial: some View {
        ZStack {
            Circle().stroke(themeManager.theme.text.opacity(0.13), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(readiness) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(readiness)%").font(.title3.weight(.black))
                Text("BRIDGE").font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 100, height: 100)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.35).repeatForever(autoreverses: true), value: pulse)
    }

    private var unifiedCommander: some View {
        CommandCard(title: "Unified Commander", systemImage: "message.badge.waveform") {
            HStack {
                StatusPill(title: "Local Mock", status: .green)
                StatusPill(title: "No Network", status: .standby)
                StatusPill(title: "History \(conversations.count + memories.count)", status: .amber)
            }
            VStack(alignment: .leading, spacing: 10) {
                Text("Commander")
                    .font(.caption.weight(.black))
                    .foregroundStyle(themeManager.theme.heading)
                markdownBlock(bridgeStream)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.black.opacity(0.34))
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                if isStreaming {
                    ProgressView("Streaming mock response...")
                        .tint(themeManager.theme.heading)
                        .foregroundStyle(themeManager.theme.heading)
                }
            }
            Picker("Attach Mission", selection: $selectedMissionTitle) {
                ForEach(missionTitles, id: \.self) { title in
                    Text(title).tag(title)
                }
            }
            .pickerStyle(.menu)
            TextField(editingCommand ? "Edit command draft" : "Issue command", text: $commandText, axis: .vertical)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            HStack {
                bridgeButton("Send", "paperplane.fill") { sendCommand() }
                bridgeButton(editingCommand ? "Done" : "Edit", "pencil") { editingCommand.toggle() }
                bridgeButton("Regenerate", "arrow.clockwise") { regenerateResponse() }
            }
            HStack {
                bridgeButton("Copy", "doc.on.doc") { copy(bridgeStream) }
                bridgeButton("Save Vault", "archivebox.fill") { saveBridgeToVault() }
                bridgeButton("Attach", "link") { attachMission() }
            }
            ForEach(conversations.prefix(3)) { conversation in
                conversationRow(conversation)
            }
        }
    }

    private var providerRouter: some View {
        CommandCard(title: "AI Provider Router", systemImage: "switch.2") {
            Text("Mock local adapters only. Provider actions queue local records and do not perform network requests.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 210), spacing: 10)], spacing: 10) {
                ForEach(providerCards) { provider in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(provider.name)
                                .font(.headline)
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            StatusPill(title: provider.status.label, status: provider.status)
                        }
                        Text("Connection: \(provider.connection)")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(themeManager.theme.heading)
                        Text("Capabilities: \(provider.capabilities.joined(separator: ", "))")
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.66))
                        Text("Queue \(provider.queue) | Last sync \(provider.lastSync)")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        Text("Actions: \(provider.actions.joined(separator: " | "))")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.76))
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }

    private var missionInbox: some View {
        CommandCard(title: "Mission Inbox", systemImage: "tray.full.fill") {
            Text("Every bridge command is stored as a local task with status, priority, and owner agent.")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.68))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                inboxMetric("Pending", RemoteCommandStatus.queued.label)
                inboxMetric("Working", RemoteCommandStatus.running.label)
                inboxMetric("Completed", RemoteCommandStatus.complete.label)
                inboxMetric("Archived", "Archived")
            }
            ForEach(routedCommands.prefix(6)) { command in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(command.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        Text(command.status)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.heading)
                    }
                    Text("Priority: \(command.priority) | Owner Agent: \(ownerAgent(for: command.route)) | Provider: \(command.route)")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.66))
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var agentConsole: some View {
        CommandCard(title: "Agent Console", systemImage: "person.3.sequence.fill") {
            bridgeButton("Seed Agent Runtime", "person.crop.circle.badge.plus") { seedAgents() }
            ForEach(agentConsoleRows) { agent in
                VStack(alignment: .leading, spacing: 7) {
                    HStack {
                        Text(agent.name)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        StatusPill(title: "\(agent.confidence)%", status: agent.status)
                    }
                    Text("Current mission: \(agent.currentMission)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Reasoning log: \(agent.reasoningLog)")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    Text("Memory: \(agent.memorySummary)")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.64))
                    Text("Last action: \(agent.lastAction) | Queue \(agent.queueLength)")
                        .font(.caption2.weight(.bold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.58))
                }
                .padding(.vertical, 5)
            }
        }
    }

    private var blackVaultTwo: some View {
        CommandCard(title: "Black Vault 2.0", systemImage: "archivebox.circle.fill") {
            TextField("Search research, conversations, mission reports, daily briefs, journal, ideas, prompt library", text: $vaultSearch)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            vaultGroup("Research", researchMatches)
            vaultGroup("Conversations", conversationMatches)
            vaultGroup("Mission Reports", missionReportMatches)
            vaultGroup("Daily Briefs", briefMatches)
            vaultGroup("Journal", journalMatches)
            vaultGroup("Ideas", ideaMatches)
            vaultGroup("Prompt Library", promptMatches)
        }
    }

    private var commandHistory: some View {
        CommandCard(title: "Command History", systemImage: "clock.arrow.circlepath") {
            Picker("Filter", selection: $selectedHistoryFilter) {
                ForEach(CommandHistoryFilter.allCases) { filter in
                    Text(filter.rawValue).tag(filter)
                }
            }
            .pickerStyle(.segmented)
            ForEach(filteredHistory.prefix(8), id: \.self) { item in
                HStack(alignment: .top, spacing: 10) {
                    Circle()
                        .fill(themeManager.theme.heading)
                        .frame(width: 9, height: 9)
                        .padding(.top, 5)
                    Text(item)
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.76))
                    Spacer()
                }
            }
        }
    }

    private func conversationRow(_ conversation: Conversation) -> some View {
        VStack(alignment: .leading, spacing: 6) {
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
                            .background(Color.black.opacity(0.36))
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
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
        } else {
            Text(text)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))
        }
    }

    private func bridgeButton(_ title: String, _ systemImage: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.caption.weight(.bold))
                .padding(.horizontal, 10)
                .padding(.vertical, 7)
                .background(themeManager.theme.heading.opacity(0.14))
                .clipShape(Capsule())
        }
        .buttonStyle(.plain)
        .foregroundStyle(themeManager.theme.heading)
    }

    private func inboxMetric(_ title: String, _ status: String) -> some View {
        MetricCard(title: title, value: "\(routedCommands.filter { $0.status == status }.count)", context: "Local tasks")
    }

    private func vaultGroup(_ title: String, _ values: [String]) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("\(title) (\(values.count))")
                .font(.caption.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            ForEach(values.prefix(3), id: \.self) { value in
                Text(value)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    .lineLimit(2)
            }
        }
        .padding(.vertical, 3)
    }

    private var providerCards: [LiveProviderCard] {
        [
            provider("ChatGPT", ["conversation", "analysis", "briefing"], "Copy prompt", "Archive response"),
            provider("Codex", ["build", "review", "patch"], "Copy task", "Queue sprint"),
            provider("OpenClaw", ["audit", "scan", "reasoning"], "Copy audit", "Store finding"),
            provider("GitHub", ["issues", "checkpoint", "release notes"], "Draft checkpoint", "Save report"),
            provider("Notion", ["vault", "docs", "knowledge"], "Save note", "Queue sync"),
            provider("Supabase", ["schema", "local status", "readiness"], "Inspect mock", "Flag later"),
            provider("Cloudflare", ["worker", "routing", "edge readiness"], "Draft plan", "Hold disabled"),
            provider("Local LLM", ["offline response", "private memory", "field mode"], "Mock run", "Save memory")
        ]
    }

    private func provider(_ name: String, _ capabilities: [String], _ primaryAction: String, _ secondaryAction: String) -> LiveProviderCard {
        LiveProviderCard(
            name: name,
            status: name == "Local LLM" ? .standby : .amber,
            connection: "Disabled local adapter",
            capabilities: capabilities,
            queue: routedCommands.filter { $0.route.localizedCaseInsensitiveContains(name) }.count,
            lastSync: "Never - local mock",
            actions: [primaryAction, secondaryAction]
        )
    }

    private var agentConsoleRows: [BridgeAgentRow] {
        if !agentRecords.isEmpty {
            return agentRecords.map { agent in
                BridgeAgentRow(
                    name: agent.name,
                    currentMission: agent.assignedMission,
                    reasoningLog: "Evaluated queue priority \(String(agent.priority)). Awaiting local command execution.",
                    memorySummary: agent.nextAction,
                    lastAction: agent.lastActivity,
                    confidence: confidence(for: agent.status),
                    queueLength: routedCommands.filter { command in ownerAgent(for: command.route) == agent.name }.count,
                    status: status(from: agent.status)
                )
            }
        }
        if !agents.isEmpty {
            return agents.map {
                BridgeAgentRow(
                    name: $0.name,
                    currentMission: $0.role,
                    reasoningLog: "Local agent role loaded from SwiftData.",
                    memorySummary: $0.lastActivity,
                    lastAction: $0.lastActivity,
                    confidence: 82,
                    queueLength: $0.queueLength,
                    status: status(from: $0.status)
                )
            }
        }
        return ["Commander", "Architect", "Engineer", "Research", "Music", "Security", "Operations"].map {
            BridgeAgentRow(
                name: $0,
                currentMission: "Awaiting bridge assignment",
                reasoningLog: "No persistent record yet. Seed local runtime to persist.",
                memorySummary: "Starter memory placeholder.",
                lastAction: "Standing by.",
                confidence: 76,
                queueLength: 0,
                status: .standby
            )
        }
    }

    private func sendCommand() {
        let body = commandText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !body.isEmpty else { return }
        let route = classify(body)
        let response = """
        **Live Bridge Response**
        Command routed to **\(route)** with mission attachment: **\(selectedMissionTitle)**.

        ```swift
        adapter = "mock-local"
        network = false
        persistence = "SwiftData"
        ```

        Recommended action: review the mission inbox, then save the result to Black Vault 2.0.
        """
        let conversation = Conversation(
            title: "Bridge: \(body.prefix(36))",
            folder: selectedMissionTitle == "No mission attached" ? "Live Bridge" : selectedMissionTitle,
            messagesText: "Founder: \(body)\n\n\(response)",
            isPinned: selectedMissionTitle != "No mission attached",
            isFavorite: route == "Codex" || route == "ChatGPT"
        )
        let command = MissionControlCommand(
            title: String(body.prefix(48)),
            body: body,
            route: route,
            priority: CommandPriority.high.rawValue,
            status: RemoteCommandStatus.queued.label,
            resultSummary: "Queued through Sprint 12 Live Command Bridge."
        )
        let event = CommandTimelineEvent(
            title: "Bridge command queued",
            detail: "\(route) | \(selectedMissionTitle)",
            category: "Provider"
        )
        modelContext.insert(conversation)
        modelContext.insert(command)
        modelContext.insert(event)
        commandText = ""
        stream(response)
    }

    private func regenerateResponse() {
        stream("""
        **Regenerated Local Response**
        The bridge is operating in mock mode. Re-check command priority, verify mission attachment, and archive the final decision locally.

        ```text
        production_api_calls=disabled
        provider_router=mock
        ```
        """)
    }

    private func attachMission() {
        guard selectedMissionTitle != "No mission attached" else { return }
        modelContext.insert(CommandTimelineEvent(title: "Mission attached", detail: selectedMissionTitle, category: "Mission"))
    }

    private func saveBridgeToVault() {
        modelContext.insert(VaultEntry(title: "Live Bridge Export", category: "Conversations", tagLine: bridgeStream, importance: 9))
    }

    private func seedAgents() {
        guard agentRecords.isEmpty else { return }
        for name in ["Commander", "Architect", "Engineer", "Research", "Music", "Security", "Operations"] {
            modelContext.insert(AgentStatusRecord(
                name: name,
                status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label,
                priority: name == "Security" ? CommandPriority.critical.rawValue : CommandPriority.high.rawValue,
                assignedMission: "Live Command Bridge",
                lastActivity: "Sprint 12 runtime initialized.",
                nextAction: "Monitor queue, summarize memory, and hold local-only posture."
            ))
        }
    }

    private func stream(_ response: String) {
        isStreaming = true
        bridgeStream = ""
        Task {
            for word in response.split(separator: " ") {
                try? await Task.sleep(nanoseconds: 28_000_000)
                await MainActor.run {
                    bridgeStream += (bridgeStream.isEmpty ? "" : " ") + word
                }
            }
            await MainActor.run { isStreaming = false }
        }
    }

    private func copy(_ text: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
    }

    private func classify(_ body: String) -> String {
        let text = body.lowercased()
        if text.contains("codex") || text.contains("build") || text.contains("patch") { return "Codex" }
        if text.contains("openclaw") || text.contains("audit") { return "OpenClaw" }
        if text.contains("github") || text.contains("checkpoint") { return "GitHub" }
        if text.contains("notion") || text.contains("vault") { return "Notion" }
        if text.contains("supabase") { return "Supabase" }
        if text.contains("cloudflare") { return "Cloudflare" }
        if text.contains("local llm") { return "Local LLM" }
        return "ChatGPT"
    }

    private func ownerAgent(for route: String) -> String {
        switch route {
        case "Codex": "Engineer"
        case "OpenClaw": "Security"
        case "GitHub", "Cloudflare", "Supabase": "Operations"
        case "Notion": "Research"
        case "Local LLM": "Architect"
        default: "Commander"
        }
    }

    private func status(from label: String) -> SystemStatus {
        switch label {
        case SystemStatus.green.label: .green
        case SystemStatus.amber.label: .amber
        case SystemStatus.red.label: .red
        default: .standby
        }
    }

    private func confidence(for label: String) -> Int {
        switch status(from: label) {
        case .green: 92
        case .amber: 74
        case .red: 38
        case .standby: 68
        }
    }

    private var filteredHistory: [String] {
        let now = Date.now
        let calendar = Calendar.current
        let commandItems = routedCommands.map { "\($0.updatedAt.formatted(date: .abbreviated, time: .shortened)) | \($0.route) | \($0.title) | \($0.status)" }
        let timelineItems = timeline.map { "\($0.createdAt.formatted(date: .abbreviated, time: .shortened)) | \($0.category) | \($0.title)" }
        switch selectedHistoryFilter {
        case .today:
            let start = calendar.startOfDay(for: now)
            return routedCommands.filter { $0.updatedAt >= start }.map { "\($0.route) today: \($0.title)" } + timeline.filter { $0.createdAt >= start }.map { "\($0.category): \($0.title)" }
        case .week:
            let start = calendar.date(byAdding: .day, value: -7, to: now) ?? now
            return routedCommands.filter { $0.updatedAt >= start }.map { "\($0.route) week: \($0.title)" } + timeline.filter { $0.createdAt >= start }.map { "\($0.category): \($0.title)" }
        case .month:
            let start = calendar.date(byAdding: .month, value: -1, to: now) ?? now
            return routedCommands.filter { $0.updatedAt >= start }.map { "\($0.route) month: \($0.title)" } + timeline.filter { $0.createdAt >= start }.map { "\($0.category): \($0.title)" }
        case .mission:
            return missions.map { "Mission: \($0.title) | \($0.status)" } + savedMissions.map { "Mission: \($0.title) | \($0.status)" }
        case .agent:
            return agentConsoleRows.map { "Agent: \($0.name) | \($0.currentMission) | Queue \($0.queueLength)" }
        case .provider:
            return commandItems + timelineItems
        }
    }

    private func matches(_ values: [String]) -> [String] {
        let needle = vaultSearch.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !needle.isEmpty else { return Array(values.prefix(4)) }
        return values.filter { $0.lowercased().contains(needle) }
    }

    private var researchMatches: [String] { matches(research.map { "\($0.title): \($0.body)" }) }
    private var conversationMatches: [String] { matches(conversations.map { "\($0.title): \($0.messagesText)" } + memories.map { "\($0.title): \($0.response)" }) }
    private var missionReportMatches: [String] { matches(missions.map { "\($0.title): \($0.notes)" } + vault.filter { $0.category.localizedCaseInsensitiveContains("Mission") }.map { "\($0.title): \($0.tagLine)" }) }
    private var briefMatches: [String] { matches(briefs.map { "\($0.title): \($0.body)" }) }
    private var journalMatches: [String] { matches(journal.map { "\($0.title): \($0.body)" } + founderJournal.map { "\($0.title): \($0.body)" }) }
    private var ideaMatches: [String] { matches(knowledge.map { "\($0.title): \($0.body)" } + music.map { "\($0.title): \($0.note)" }) }
    private var promptMatches: [String] { matches(prompts.map { "\($0.title): \($0.prompt)" }) }
}
