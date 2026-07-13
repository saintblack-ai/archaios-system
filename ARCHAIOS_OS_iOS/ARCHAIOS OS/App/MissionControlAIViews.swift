import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

private enum MissionControlRoute: String, CaseIterable, Identifiable {
    case codex = "Codex"
    case openClaw = "OpenClaw"
    case github = "GitHub"
    case notion = "Notion"
    case blackVault = "Black Vault"
    case music = "Music"
    case dailyOS = "Daily OS"
    case infrastructure = "Infrastructure"

    var id: String { rawValue }
}

struct MissionControlAIView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \VoiceCommandDraft.createdAt, order: .reverse) private var voiceDrafts: [VoiceCommandDraft]
    @Query(sort: \MissionControlCommand.createdAt, order: .reverse) private var routedCommands: [MissionControlCommand]
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var remoteCommands: [RemoteCommand]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var memories: [ConversationMemory]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agents: [AgentStatusRecord]
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @State private var commandText = ""
    @State private var voiceText = ""
    @State private var vaultSearch = ""
    @State private var terminalInput = ""
    @State private var terminalStream = "ARCHAIOS terminal ready. Local-only execution confirmed."
    @State private var selectedPriority = CommandPriority.high
    @State private var briefType = "Morning brief"
    @State private var pulse = false

    private var openMissions: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var readiness: Int {
        max(48, min(99, 86 - openMissions * 3 + routedCommands.filter { $0.status == RemoteCommandStatus.complete.label }.count * 2))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Mission Control AI", subtitle: "One mobile command center for voice drafts, routing, agents, briefs, search, and field terminal operations.")
                executiveDashboard
                voiceCommander
                commandRouter
                blackVaultAISearch
                agentStatusBoard
                dailyBriefGenerator
                fieldTerminalMode
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Mission Control")
        .onAppear {
            pulse = true
        }
    }

    private var executiveDashboard: some View {
        CommandCard(title: "Mission Control Dashboard", systemImage: "command") {
            HStack(alignment: .center, spacing: 14) {
                readinessGauge
                VStack(alignment: .leading, spacing: 8) {
                    Text("Today's Brief")
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.heading)
                    Text(briefs.first?.body ?? "Hold local-first posture. Clear blockers, route one command, capture the result.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Next recommended action: \(nextRecommendedAction)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.90))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Active Missions", value: "\(openMissions)", context: "Mission + Daily OS")
                MetricCard(title: "AI Queue", value: "\(routedCommands.count + remoteCommands.count)", context: "Local commands")
                MetricCard(title: "Recent Intelligence", value: "\(knowledge.count + research.count + vault.count)", context: "Vault + memory")
                MetricCard(title: "Build Status", value: "Green", context: "Last local build")
                MetricCard(title: "Open Blockers", value: "\(max(0, openMissions - routedCommands.count))", context: "Needs action")
                MetricCard(title: "Voice Drafts", value: "\(voiceDrafts.count)", context: "Local captures")
            }
        }
    }

    private var readinessGauge: some View {
        ZStack {
            Circle()
                .stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(readiness) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(readiness)%")
                    .font(.title3.weight(.black))
                Text("Ready")
                    .font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 96, height: 96)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true), value: pulse)
    }

    private var voiceCommander: some View {
        CommandCard(title: "Voice Commander", systemImage: "mic.circle.fill") {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: "mic.fill")
                    .font(.title)
                    .foregroundStyle(.black)
                    .frame(width: 58, height: 58)
                    .background(themeManager.theme.heading)
                    .clipShape(Circle())
                VStack(alignment: .leading, spacing: 8) {
                    Text("Mock voice interpretation only. Type what you would say; ARCHAIOS stores it as a spoken/manual draft.")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.68))
                    TextField("Speak or type command draft", text: $voiceText, axis: .vertical)
                        .textFieldStyle(.plain)
                        .padding(10)
                        .foregroundStyle(themeManager.theme.text)
                        .background(themeManager.theme.elevatedPanel)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
            }
            CommanderButton(title: "Store Voice Draft Locally", systemImage: "tray.and.arrow.down.fill") {
                saveVoiceDraft()
            }
            ForEach(voiceDrafts.prefix(3)) { draft in
                TimelineRow(title: draft.transcript, detail: "\(draft.target) | \(draft.interpretedIntent)", status: .standby)
            }
        }
    }

    private var commandRouter: some View {
        CommandCard(title: "Command Router", systemImage: "arrow.triangle.branch") {
            TextField("Route local command", text: $commandText, axis: .vertical)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            Picker("Priority", selection: $selectedPriority) {
                ForEach(CommandPriority.allCases) { priority in
                    Text(priority.rawValue).tag(priority)
                }
            }
            .pickerStyle(.segmented)
            CommanderButton(title: "Classify + Store Routed Command", systemImage: "paperplane.circle.fill") {
                routeCommand(commandText)
            }
            ForEach(routedCommands.prefix(5)) { command in
                VStack(alignment: .leading, spacing: 5) {
                    HStack {
                        Text(command.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        Text(command.route)
                            .font(.caption.weight(.black))
                            .foregroundStyle(themeManager.theme.heading)
                    }
                    Text("\(command.priority) | \(command.status) | \(command.resultSummary)")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.66))
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var blackVaultAISearch: some View {
        CommandCard(title: "Black Vault AI Search", systemImage: "archivebox.fill") {
            TextField("Search missions, conversations, journal, research, music, prompts, knowledge", text: $vaultSearch)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            searchGroup("Missions", missionMatches)
            searchGroup("Conversations", conversationMatches)
            searchGroup("Journal", journalMatches)
            searchGroup("Research Notes", researchMatches)
            searchGroup("Music Ideas", musicMatches)
            searchGroup("Prompt Library", promptMatches)
            searchGroup("Knowledge Nodes", knowledgeMatches)
        }
    }

    private var agentStatusBoard: some View {
        CommandCard(title: "Agent Status Board", systemImage: "person.3.fill") {
            CommanderButton(title: "Seed Persistent Agents", systemImage: "person.crop.circle.badge.plus") {
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
                    Text("Priority: \(agent.priority) | Mission: \(agent.assignedMission)")
                    Text("Last: \(agent.lastActivity)")
                    Text("Next: \(agent.nextAction)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
                .padding(.vertical, 6)
            }
        }
    }

    private var dailyBriefGenerator: some View {
        CommandCard(title: "Daily Brief Generator", systemImage: "sunrise.fill") {
            Picker("Brief", selection: $briefType) {
                ForEach(["Morning brief", "Evening review", "Weekly review", "Mission review"], id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.segmented)
            CommanderButton(title: "Generate Useful Mock Brief", systemImage: "doc.badge.plus") {
                generateBrief()
            }
            ForEach(briefs.prefix(4)) { brief in
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
                    Text("Wins: \(brief.winsText)")
                    Text("Blockers: \(brief.blockersText)")
                    Text("Next three: \(brief.nextActionsText)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .padding()
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            }
        }
    }

    private var fieldTerminalMode: some View {
        CommandCard(title: "Field Terminal Mode", systemImage: "terminal.fill") {
            Text("MOBILE TACTICAL TERMINAL")
                .font(.system(.caption, design: .monospaced).weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            Text(terminalStream)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(themeManager.theme.text)
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.black.opacity(0.38))
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            TextField("terminal command", text: $terminalInput, axis: .vertical)
                .font(.system(.body, design: .monospaced))
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            HStack {
                Button("Run") { runTerminal() }
                Button("Vault") { exportTerminalToVault() }
                Button("Copy Codex") { copyTerminal("Codex") }
                Button("Copy OpenClaw") { copyTerminal("OpenClaw") }
                Button("Copy ChatGPT") { copyTerminal("ChatGPT") }
            }
            .font(.caption.weight(.bold))
            .foregroundStyle(themeManager.theme.heading)
            ForEach(routedCommands.prefix(3)) { item in
                TimelineRow(title: item.title, detail: "Mission queue: \(item.route) | \(item.status)", status: .amber)
            }
            ForEach(prompts.prefix(3)) { prompt in
                TimelineRow(title: prompt.title, detail: "Saved prompt: \(prompt.category)", status: .standby)
            }
        }
    }

    private var nextRecommendedAction: String {
        if openMissions > 0 { return "Select the highest-priority mission and clear one blocker." }
        if routedCommands.isEmpty { return "Route one command through Mission Control." }
        return "Generate an evening review and export the result to Black Vault."
    }

    private var agentRows: [AgentStatusRecord] {
        if agents.isEmpty {
            return defaultAgentNames.map { AgentStatusRecord(name: $0, assignedMission: missions.first?.title ?? "Founder OS", lastActivity: "Prepared for local command routing.", nextAction: "Await assignment.") }
        }
        return agents
    }

    private var defaultAgentNames: [String] {
        ["Commander", "Engineer", "Architect", "Researcher", "Music", "Security", "Operations"]
    }

    private func classify(_ text: String) -> MissionControlRoute {
        let lower = text.lowercased()
        if lower.contains("openclaw") || lower.contains("audit") { return .openClaw }
        if lower.contains("github") || lower.contains("checkpoint") { return .github }
        if lower.contains("notion") { return .notion }
        if lower.contains("vault") || lower.contains("document") { return .blackVault }
        if lower.contains("music") || lower.contains("song") || lower.contains("lyric") || lower.contains("album") { return .music }
        if lower.contains("daily") || lower.contains("brief") || lower.contains("journal") { return .dailyOS }
        if lower.contains("infra") || lower.contains("cloudflare") || lower.contains("supabase") || lower.contains("stripe") { return .infrastructure }
        return .codex
    }

    private func saveVoiceDraft() {
        let text = voiceText.trimmingCharacters(in: .whitespacesAndNewlines)
        let body = text.isEmpty ? "Mock voice command draft" : text
        let route = classify(body)
        modelContext.insert(VoiceCommandDraft(
            transcript: body,
            interpretedIntent: "Mock interpreted as \(route.rawValue) command.",
            target: route.rawValue
        ))
        voiceText = ""
        Haptics.success()
    }

    private func routeCommand(_ text: String) {
        let body = text.trimmingCharacters(in: .whitespacesAndNewlines)
        let clean = body.isEmpty ? "Untitled Mission Control command" : body
        let route = classify(clean)
        let title = clean.count > 44 ? String(clean.prefix(41)) + "..." : clean
        modelContext.insert(MissionControlCommand(
            title: title,
            body: clean,
            route: route.rawValue,
            priority: selectedPriority.rawValue,
            resultSummary: "Local-only route to \(route.rawValue). No network call performed."
        ))
        modelContext.insert(CommandTimelineEvent(title: title, detail: "Mission Control routed to \(route.rawValue).", category: "Mission Control"))
        commandText = ""
        Haptics.success()
    }

    private func seedAgents() {
        guard agents.isEmpty else { return }
        for name in defaultAgentNames {
            modelContext.insert(AgentStatusRecord(
                name: name,
                status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label,
                priority: name == "Security" ? CommandPriority.critical.rawValue : CommandPriority.high.rawValue,
                assignedMission: missions.first?.title ?? "Mission Control AI",
                lastActivity: "Persistent agent seeded locally.",
                nextAction: "Review assigned mission and report blockers."
            ))
        }
        Haptics.success()
    }

    private func generateBrief() {
        let score = max(52, min(96, readiness))
        modelContext.insert(DailyBriefCard(
            title: briefType.capitalized,
            category: briefType,
            body: "Mission Control brief generated locally. Readiness \(score)%. Keep execution tight and preserve evidence.",
            readinessScore: score,
            winsText: "Build path is local-first. Command center is installed-ready.",
            blockersText: openMissions == 0 ? "No active mission blockers logged." : "\(openMissions) active missions need review.",
            nextActionsText: "1. Route one command. 2. Clear one blocker. 3. Export a note to Black Vault."
        ))
        Haptics.success()
    }

    private func runTerminal() {
        let body = terminalInput.trimmingCharacters(in: .whitespacesAndNewlines)
        let command = body.isEmpty ? "status" : body
        let route = classify(command)
        terminalStream = """
        > \(command)
        ROUTE: \(route.rawValue)
        MODE: LOCAL MOCK
        RESPONSE: Command staged for Mission Control review. No production API call.
        """
        routeCommand(command)
        terminalInput = ""
    }

    private func exportTerminalToVault() {
        modelContext.insert(VaultEntry(title: "Field Terminal Export", category: "Mission Control", tagLine: terminalStream, importance: 8))
        Haptics.success()
    }

    private func copyTerminal(_ target: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = "[\(target)]\n\(terminalInput.isEmpty ? terminalStream : terminalInput)"
        #endif
        Haptics.selection()
    }

    private func searchGroup(_ title: String, _ items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("\(title) (\(items.count))")
                .font(.caption.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            if items.isEmpty {
                Text(vaultSearch.isEmpty ? "Search local \(title.lowercased())." : "No matches.")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.55))
            } else {
                ForEach(items.prefix(3), id: \.self) { item in
                    Label(item, systemImage: "doc.text.magnifyingglass")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                }
            }
        }
        .padding(.vertical, 3)
    }

    private func matches(_ text: String) -> Bool {
        vaultSearch.isEmpty || text.localizedCaseInsensitiveContains(vaultSearch)
    }

    private var missionMatches: [String] {
        missions.filter { matches($0.title + $0.notes + $0.tagsText) }.map(\.title) +
        savedMissions.filter { matches($0.title + $0.checklistText) }.map(\.title)
    }

    private var conversationMatches: [String] {
        conversations.filter { matches($0.title + $0.messagesText + $0.folder) }.map(\.title) +
        memories.filter { matches($0.title + $0.prompt + $0.response) }.map(\.title)
    }

    private var journalMatches: [String] {
        journal.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title) +
        founderJournal.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title)
    }

    private var researchMatches: [String] {
        research.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title)
    }

    private var musicMatches: [String] {
        music.filter { matches($0.title + $0.note + $0.tagsText) }.map(\.title)
    }

    private var promptMatches: [String] {
        prompts.filter { matches($0.title + $0.prompt + $0.category) }.map(\.title)
    }

    private var knowledgeMatches: [String] {
        knowledge.filter { matches($0.title + $0.body + $0.tagsText + $0.category) }.map(\.title)
    }
}
