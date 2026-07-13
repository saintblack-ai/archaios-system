import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

private enum OperationsStatusBucket: String, CaseIterable, Identifiable {
    case planning = "Planning"
    case inProgress = "In Progress"
    case waiting = "Waiting"
    case completed = "Completed"

    var id: String { rawValue }
}

private enum VaultOpsFilter: String, CaseIterable, Identifiable {
    case folders = "Folders"
    case tags = "Tags"
    case collections = "Collections"
    case favorites = "Favorites"
    case recent = "Recent"
    case pinned = "Pinned"
    case related = "Related"
    case attachments = "Attachments"

    var id: String { rawValue }
}

private enum PromptOpsCategory: String, CaseIterable, Identifiable {
    case chatGPT = "ChatGPT"
    case codex = "Codex"
    case openClaw = "OpenClaw"
    case github = "GitHub"
    case notion = "Notion"
    case music = "Music"
    case research = "Research"
    case infrastructure = "Infrastructure"

    var id: String { rawValue }
}

struct FounderOperationsHomeView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agents: [AgentStatusRecord]
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var builds: [CommandTimelineEvent]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @State private var pulse = false

    private var currentMission: String {
        missions.first { $0.status != RemoteCommandStatus.complete.label }?.title ??
            savedMissions.first { !$0.isComplete }?.title ??
            "Set today's founder mission"
    }

    private var openMissionCount: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var dailyScore: Int {
        max(54, min(99, 90 - openMissionCount * 2 + agents.filter { $0.status == SystemStatus.green.label }.count))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .center, spacing: 16) {
                ZStack {
                    Circle().stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
                    Circle()
                        .trim(from: 0, to: Double(dailyScore) / 100)
                        .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    VStack(spacing: 2) {
                        Text("\(dailyScore)")
                            .font(.title3.weight(.black))
                        Text("Daily")
                            .font(.caption2.weight(.bold))
                    }
                    .foregroundStyle(themeManager.theme.text)
                }
                .frame(width: 96, height: 96)
                .scaleEffect(pulse ? 1.02 : 0.98)
                .animation(.easeInOut(duration: 1.45).repeatForever(autoreverses: true), value: pulse)

                VStack(alignment: .leading, spacing: 8) {
                    Text("Command Center Home")
                        .font(.title2.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text(currentMission)
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text)
                    Text(briefs.first?.body ?? "Morning brief is ready to be generated in Founder Ops.")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.68))
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Agent Status", value: "\(agents.count)", context: agents.first?.lastActivity ?? "Seed runtime")
                MetricCard(title: "Infrastructure", value: "Local", context: "No production APIs")
                MetricCard(title: "Recent Builds", value: "\(builds.filter { $0.category == "Build" }.count)", context: "Local timeline")
                MetricCard(title: "Black Vault", value: "\(vault.count)", context: vault.first?.title ?? "No activity")
                MetricCard(title: "Prompts", value: "\(prompts.count)", context: "Library")
                MetricCard(title: "Conversations", value: "\(conversations.count)", context: "Commander memory")
            }

            CommandCard(title: "Top 3 Priorities", systemImage: "list.number") {
                ForEach(topPriorities, id: \.self) { priority in
                    Label(priority, systemImage: "checkmark.seal")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text)
                }
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 155), spacing: 10)], spacing: 10) {
                NavigationLink(value: AppRoute.founderOperations) {
                    quickAction("Open Founder Ops", "chart.line.uptrend.xyaxis.circle.fill")
                }
                NavigationLink(value: AppRoute.liveCommandBridge) {
                    quickAction("Command Bridge", "antenna.radiowaves.left.and.right")
                }
                NavigationLink(value: AppRoute.blackVault) {
                    quickAction("Black Vault", "archivebox.fill")
                }
                NavigationLink(value: AppRoute.settings) {
                    quickAction("Settings", "gearshape.fill")
                }
            }
        }
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .onAppear { pulse = true }
    }

    private var topPriorities: [String] {
        let missionItems = missions.prefix(3).map { $0.title }
        let savedItems = savedMissions.prefix(3).map { $0.title }
        let merged = Array((missionItems + savedItems).prefix(3))
        return merged.isEmpty ? ["Generate morning brief", "Choose current mission", "Clear one blocker"] : merged
    }

    private func quickAction(_ title: String, _ symbol: String) -> some View {
        Label(title, systemImage: symbol)
            .font(.caption.weight(.black))
            .frame(maxWidth: .infinity)
            .padding(12)
            .foregroundStyle(.black)
            .background(themeManager.theme.heading)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

struct FounderOperationsView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @AppStorage("founderName") private var founderName = "Saint Black"
    @AppStorage("developerModeEnabled") private var developerModeEnabled = false
    @AppStorage("offlineModeEnabled") private var offlineModeEnabled = true
    @AppStorage("experimentalFeaturesEnabled") private var experimentalFeaturesEnabled = false
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \AgentStatusRecord.updatedAt, order: .reverse) private var agents: [AgentStatusRecord]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var memory: [ConversationMemory]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timeline: [CommandTimelineEvent]
    @State private var morningBrief = ""
    @State private var missionFocus = ""
    @State private var taskOne = ""
    @State private var taskTwo = ""
    @State private var taskThree = ""
    @State private var energyLevel = 78.0
    @State private var blockers = ""
    @State private var wins = ""
    @State private var eveningReview = ""
    @State private var missionTitle = ""
    @State private var missionNotes = ""
    @State private var selectedBucket = OperationsStatusBucket.planning
    @State private var selectedPriority = CommandPriority.high
    @State private var selectedAgent = "Commander"
    @State private var dueDate = Date.now
    @State private var vaultSearch = ""
    @State private var selectedVaultFilter = VaultOpsFilter.recent
    @State private var promptSearch = ""
    @State private var selectedPromptCategory = PromptOpsCategory.chatGPT
    @State private var promptTitle = ""
    @State private var promptBody = ""
    @State private var journalTitle = ""
    @State private var journalBody = ""
    @State private var journalMode = "Daily Journal"
    @State private var pulse = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Founder Operations", subtitle: "Daily command operating system for briefs, missions, vault memory, prompts, journal, system health, and settings.")
                commandCenterHome
                dailyCommander
                operationsCenter
                blackVaultThree
                commandPromptLibrary
                founderJournalWorkspace
                systemHealth
                founderSettings
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Founder Ops")
        .onAppear { pulse = true }
    }

    private var commandCenterHome: some View {
        CommandCard(title: "Command Center Home", systemImage: "rectangle.3.group.fill") {
            HStack(alignment: .center, spacing: 16) {
                dailyScoreRing
                VStack(alignment: .leading, spacing: 8) {
                    Text(currentMission)
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text)
                    Text(briefs.first?.body ?? "Generate the morning brief, select mission focus, and lock the top three tasks.")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                    Text("Infrastructure: Local-first | No production APIs")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.84))
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Current Mission", value: "\(openMissionCount)", context: currentMission)
                MetricCard(title: "Agent Status", value: "\(agents.count)", context: agents.first?.status ?? "Pending")
                MetricCard(title: "Recent Builds", value: "\(timeline.filter { $0.category == "Build" }.count)", context: "Build history")
                MetricCard(title: "Vault Activity", value: "\(vault.count)", context: vault.first?.category ?? "No entries")
                MetricCard(title: "Daily Score", value: "\(dailyScore)", context: "Founder readiness")
                MetricCard(title: "Conversations", value: "\(conversations.count + memory.count)", context: "AI memory")
            }
            quickActions
        }
    }

    private var dailyCommander: some View {
        CommandCard(title: "Daily Commander", systemImage: "sunrise.fill") {
            TextField("Morning brief", text: $morningBrief, axis: .vertical)
                .founderField(themeManager)
            TextField("Mission focus", text: $missionFocus, axis: .vertical)
                .founderField(themeManager)
            VStack(alignment: .leading, spacing: 8) {
                Text("Top 3 Tasks")
                    .font(.caption.weight(.black))
                    .foregroundStyle(themeManager.theme.heading)
                TextField("Task 1", text: $taskOne).founderField(themeManager)
                TextField("Task 2", text: $taskTwo).founderField(themeManager)
                TextField("Task 3", text: $taskThree).founderField(themeManager)
            }
            VStack(alignment: .leading, spacing: 6) {
                Text("Energy Level \(Int(energyLevel))")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Slider(value: $energyLevel, in: 0...100)
                    .tint(themeManager.theme.heading)
            }
            TextField("Blockers", text: $blockers, axis: .vertical)
                .founderField(themeManager)
            TextField("Wins", text: $wins, axis: .vertical)
                .founderField(themeManager)
            TextField("Evening review", text: $eveningReview, axis: .vertical)
                .founderField(themeManager)
            CommanderButton(title: "Save Daily Commander Locally", systemImage: "tray.and.arrow.down.fill") {
                saveDailyCommander()
            }
            ForEach(briefs.prefix(3)) { brief in
                TimelineRow(title: brief.title, detail: "\(brief.category) | \(brief.nextActionsText)", status: .green)
            }
        }
    }

    private var operationsCenter: some View {
        CommandCard(title: "Operations Center", systemImage: "checklist.checked") {
            TextField("Mission title", text: $missionTitle)
                .founderField(themeManager)
            Picker("Status", selection: $selectedBucket) {
                ForEach(OperationsStatusBucket.allCases) { bucket in
                    Text(bucket.rawValue).tag(bucket)
                }
            }
            .pickerStyle(.segmented)
            Picker("Priority", selection: $selectedPriority) {
                ForEach(CommandPriority.allCases) { priority in
                    Text(priority.rawValue).tag(priority)
                }
            }
            .pickerStyle(.segmented)
            DatePicker("Due Date", selection: $dueDate, displayedComponents: .date)
                .foregroundStyle(themeManager.theme.text)
            Picker("Assigned Agent", selection: $selectedAgent) {
                ForEach(agentNames, id: \.self) { agent in
                    Text(agent).tag(agent)
                }
            }
            .pickerStyle(.menu)
            TextField("Notes", text: $missionNotes, axis: .vertical)
                .founderField(themeManager)
            CommanderButton(title: "Create Operations Mission", systemImage: "plus.circle.fill") {
                createOperationsMission()
            }
            ForEach(OperationsStatusBucket.allCases) { bucket in
                missionBoard(bucket)
            }
        }
    }

    private var blackVaultThree: some View {
        CommandCard(title: "Black Vault 3.0", systemImage: "archivebox.circle.fill") {
            TextField("Search folders, tags, collections, favorites, related notes, mission attachments", text: $vaultSearch)
                .founderField(themeManager)
            Picker("Vault Filter", selection: $selectedVaultFilter) {
                ForEach(VaultOpsFilter.allCases) { filter in
                    Text(filter.rawValue).tag(filter)
                }
            }
            .pickerStyle(.segmented)
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Folders", value: "\(Set(vault.map(\.category)).count)", context: "Local categories")
                MetricCard(title: "Tags", value: "\(knowledge.count)", context: "Knowledge links")
                MetricCard(title: "Favorites", value: "\(research.filter(\.isFavorite).count)", context: "Research")
                MetricCard(title: "Pinned", value: "\(conversations.filter(\.isPinned).count)", context: "Conversations")
                MetricCard(title: "Related", value: "\(knowledge.count + research.count)", context: "Notes")
                MetricCard(title: "Attachments", value: "\(missions.filter { !$0.attachmentPlaceholder.isEmpty }.count)", context: "Mission placeholders")
            }
            ForEach(filteredVaultItems.prefix(8), id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.74))
                    .padding(.vertical, 2)
            }
        }
    }

    private var commandPromptLibrary: some View {
        CommandCard(title: "Command Prompt Library", systemImage: "text.book.closed.fill") {
            HStack {
                TextField("Search prompts", text: $promptSearch)
                    .founderField(themeManager)
                Button {
                    copy(promptMatches.first ?? "")
                } label: {
                    Image(systemName: "doc.on.doc.fill")
                        .foregroundStyle(themeManager.theme.heading)
                        .padding(10)
                        .background(themeManager.theme.elevatedPanel)
                        .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                }
                .buttonStyle(.plain)
            }
            Picker("Category", selection: $selectedPromptCategory) {
                ForEach(PromptOpsCategory.allCases) { category in
                    Text(category.rawValue).tag(category)
                }
            }
            .pickerStyle(.segmented)
            TextField("Prompt title", text: $promptTitle)
                .founderField(themeManager)
            TextField("Prompt body", text: $promptBody, axis: .vertical)
                .founderField(themeManager)
            HStack {
                smallButton("Save", "plus.circle.fill") { savePrompt() }
                smallButton("Duplicate", "square.on.square") { duplicatePrompt() }
                smallButton("Quick Copy", "doc.on.doc") { copy(promptMatches.first ?? promptBody) }
            }
            ForEach(promptMatches.prefix(6), id: \.self) { prompt in
                Text(prompt)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    .padding(.vertical, 2)
            }
        }
    }

    private var founderJournalWorkspace: some View {
        CommandCard(title: "Founder Journal", systemImage: "book.pages.fill") {
            Picker("Log Type", selection: $journalMode) {
                ForEach(["Daily Journal", "Mission Log", "Research Log", "Idea Capture"], id: \.self) { mode in
                    Text(mode).tag(mode)
                }
            }
            .pickerStyle(.segmented)
            TextField("Title", text: $journalTitle)
                .founderField(themeManager)
            TextField("Entry", text: $journalBody, axis: .vertical)
                .founderField(themeManager)
            HStack {
                Label("Voice note placeholder", systemImage: "mic.slash")
                Spacer()
                Label("Photo placeholder", systemImage: "photo")
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(themeManager.theme.heading.opacity(0.82))
            CommanderButton(title: "Save Founder Journal Entry", systemImage: "book.closed.fill") {
                saveJournalEntry()
            }
            ForEach(founderJournal.prefix(4)) { entry in
                TimelineRow(title: entry.title, detail: "\(entry.category) | \(entry.mood) | \(entry.tagsText)", status: entry.isFavorite ? .green : .standby)
            }
        }
    }

    private var systemHealth: some View {
        CommandCard(title: "System Health", systemImage: "heart.text.square.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
                MetricCard(title: "Project Health", value: "Green", context: "Local build path")
                MetricCard(title: "Storage", value: "Local", context: "SwiftData")
                MetricCard(title: "Mission Count", value: "\(missions.count + savedMissions.count)", context: "Operations")
                MetricCard(title: "Prompt Count", value: "\(prompts.count)", context: "Library")
                MetricCard(title: "Research Count", value: "\(research.count)", context: "Vault")
                MetricCard(title: "Conversation Count", value: "\(conversations.count + memory.count)", context: "AI memory")
                MetricCard(title: "Agent Activity", value: "\(agents.count)", context: agents.first?.lastActivity ?? "Standby")
                MetricCard(title: "Build History", value: "\(timeline.filter { $0.category == "Build" }.count)", context: "Timeline")
            }
        }
    }

    private var founderSettings: some View {
        CommandCard(title: "Founder Settings", systemImage: "gearshape.2.fill") {
            TextField("Founder Profile", text: $founderName)
                .founderField(themeManager)
            Toggle("Notifications", isOn: .constant(true))
                .disabled(true)
            Toggle("Developer Mode", isOn: $developerModeEnabled)
            Toggle("Offline Mode", isOn: $offlineModeEnabled)
            Toggle("Experimental Features", isOn: $experimentalFeaturesEnabled)
            Label("Theme follows ARCHAIOS black-and-gold system.", systemImage: "paintpalette.fill")
            Label("Backup placeholder: export local SwiftData package in a future sprint.", systemImage: "externaldrive.badge.timemachine")
            Label("No production keys or network services are configured.", systemImage: "lock.shield.fill")
        }
        .foregroundStyle(themeManager.theme.text)
    }

    private var dailyScoreRing: some View {
        ZStack {
            Circle().stroke(themeManager.theme.text.opacity(0.12), lineWidth: 10)
            Circle()
                .trim(from: 0, to: Double(dailyScore) / 100)
                .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 10, lineCap: .round))
                .rotationEffect(.degrees(-90))
            VStack(spacing: 2) {
                Text("\(dailyScore)")
                    .font(.title3.weight(.black))
                Text("Score")
                    .font(.caption2.weight(.bold))
            }
            .foregroundStyle(themeManager.theme.text)
        }
        .frame(width: 100, height: 100)
        .scaleEffect(pulse ? 1.02 : 0.98)
        .animation(.easeInOut(duration: 1.35).repeatForever(autoreverses: true), value: pulse)
    }

    private var quickActions: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 145), spacing: 10)], spacing: 10) {
            smallButton("Morning Brief", "sunrise.fill") { autofillDailyCommander() }
            smallButton("New Mission", "target") { missionTitle = "Founder Operations Mission" }
            smallButton("Vault Capture", "archivebox.fill") { saveVaultCapture() }
            smallButton("Seed Agents", "person.3.fill") { seedAgents() }
        }
    }

    private func smallButton(_ title: String, _ symbol: String, action: @escaping () -> Void) -> some View {
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

    private func missionBoard(_ bucket: OperationsStatusBucket) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(bucket.rawValue)
                .font(.subheadline.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            let items = missionsFor(bucket)
            if items.isEmpty {
                Text("No missions in \(bucket.rawValue.lowercased()).")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.58))
            } else {
                ForEach(items.prefix(4)) { mission in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(mission.title)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Text("\(mission.priority) | Due \(mission.deadline.formatted(date: .abbreviated, time: .omitted)) | \(mission.tagsText)")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.62))
                        Text(mission.notes)
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.78))
                    }
                    .padding(.vertical, 3)
                }
            }
        }
        .padding(.vertical, 5)
    }

    private var currentMission: String {
        missions.first { $0.status != RemoteCommandStatus.complete.label }?.title ??
            savedMissions.first { !$0.isComplete }?.title ??
            "No active mission selected"
    }

    private var openMissionCount: Int {
        missions.filter { $0.status != RemoteCommandStatus.complete.label }.count + savedMissions.filter { !$0.isComplete }.count
    }

    private var dailyScore: Int {
        max(55, min(99, 88 - openMissionCount * 2 + briefs.prefix(1).count * 5 + agents.filter { $0.status == SystemStatus.green.label }.count))
    }

    private var agentNames: [String] {
        let stored = agents.map(\.name)
        return stored.isEmpty ? ["Commander", "Architect", "Engineer", "Research", "Music", "Security", "Operations"] : stored
    }

    private var filteredVaultItems: [String] {
        let values = vault.map { "\($0.category): \($0.title) - \($0.tagLine)" } +
            research.map { "Research: \($0.title) - \($0.tagsText)" } +
            conversations.map { "Conversation: \($0.title) - \($0.folder)" } +
            missions.map { "Attachment: \($0.title) - \($0.attachmentPlaceholder)" }
        return filter(values, by: vaultSearch)
    }

    private var promptMatches: [String] {
        let values = prompts
            .filter { selectedPromptCategory.rawValue == $0.category || promptSearch.isEmpty || $0.title.localizedCaseInsensitiveContains(promptSearch) }
            .map { "\($0.category): \($0.title) - \($0.prompt)" }
        return filter(values.isEmpty ? defaultPrompts : values, by: promptSearch)
    }

    private var defaultPrompts: [String] {
        PromptOpsCategory.allCases.map { "\($0.rawValue): Draft a high-leverage founder command for \($0.rawValue)." }
    }

    private func filter(_ values: [String], by query: String) -> [String] {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !needle.isEmpty else { return Array(values.prefix(10)) }
        return values.filter { $0.localizedCaseInsensitiveContains(needle) }
    }

    private func missionsFor(_ bucket: OperationsStatusBucket) -> [Mission] {
        missions.filter { mission in
            switch bucket {
            case .planning:
                mission.status == RemoteCommandStatus.draft.label || mission.status == "Planning"
            case .inProgress:
                mission.status == RemoteCommandStatus.running.label || mission.status == "In Progress"
            case .waiting:
                mission.status == RemoteCommandStatus.queued.label || mission.status == RemoteCommandStatus.blocked.label || mission.status == "Waiting"
            case .completed:
                mission.status == RemoteCommandStatus.complete.label || mission.completedAt != nil
            }
        }
    }

    private func saveDailyCommander() {
        let tasks = [taskOne, taskTwo, taskThree].filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }.joined(separator: " | ")
        let body = morningBrief.isEmpty ? "Daily Commander brief saved locally." : morningBrief
        modelContext.insert(DailyBriefCard(
            title: "Founder Operations Brief",
            category: "Daily Commander",
            body: body,
            readinessScore: dailyScore,
            winsText: wins,
            blockersText: blockers,
            nextActionsText: tasks
        ))
        modelContext.insert(FounderJournalEntry(
            title: missionFocus.isEmpty ? "Daily Commander Review" : missionFocus,
            body: eveningReview.isEmpty ? body : eveningReview,
            category: "Daily Commander",
            mood: "Focused",
            energy: "\(Int(energyLevel))",
            tagsText: "daily,operations,brief",
            isFavorite: true
        ))
        modelContext.insert(CommandTimelineEvent(title: "Daily Commander saved", detail: tasks, category: "Daily Brief"))
        Haptics.success()
    }

    private func createOperationsMission() {
        let title = missionTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Founder Operations Mission" : missionTitle
        modelContext.insert(Mission(
            title: title,
            priority: selectedPriority.rawValue,
            status: selectedBucket.rawValue,
            deadline: dueDate,
            tagsText: selectedAgent,
            checklistText: "Plan | Execute | Review",
            notes: missionNotes,
            attachmentPlaceholder: "Mission attachment placeholder",
            completionTimelineText: "Created in Founder Operations"
        ))
        modelContext.insert(CommandTimelineEvent(title: title, detail: "\(selectedBucket.rawValue) | \(selectedAgent)", category: "Mission"))
        missionTitle = ""
        missionNotes = ""
        Haptics.success()
    }

    private func savePrompt() {
        let title = promptTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "\(selectedPromptCategory.rawValue) Founder Prompt" : promptTitle
        let prompt = promptBody.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Create a founder-grade \(selectedPromptCategory.rawValue) command." : promptBody
        modelContext.insert(PromptTemplate(title: title, category: selectedPromptCategory.rawValue, prompt: prompt, isFavorite: true))
        promptTitle = ""
        promptBody = ""
        Haptics.success()
    }

    private func duplicatePrompt() {
        if let first = prompts.first {
            modelContext.insert(PromptTemplate(title: "\(first.title) Copy", category: first.category, prompt: first.prompt, isFavorite: first.isFavorite))
        } else {
            savePrompt()
        }
    }

    private func saveJournalEntry() {
        let title = journalTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? journalMode : journalTitle
        let body = journalBody.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Captured from Founder Journal workspace." : journalBody
        modelContext.insert(FounderJournalEntry(
            title: title,
            body: body,
            category: journalMode,
            mood: "Focused",
            energy: "\(Int(energyLevel))",
            tagsText: "journal,mission,research,idea",
            isFavorite: journalMode == "Idea Capture"
        ))
        modelContext.insert(CommandTimelineEvent(title: title, detail: journalMode, category: "Journal"))
        journalTitle = ""
        journalBody = ""
        Haptics.success()
    }

    private func autofillDailyCommander() {
        morningBrief = "Good morning \(founderName). Maintain local-first posture, choose one decisive mission, and clear the highest-leverage blocker."
        missionFocus = currentMission
        taskOne = "Review mission board"
        taskTwo = "Route one command"
        taskThree = "Archive one decision"
    }

    private func saveVaultCapture() {
        modelContext.insert(VaultEntry(title: "Founder Ops Capture", category: selectedVaultFilter.rawValue, tagLine: "Local capture from Sprint 13 Founder Operations.", importance: 8))
    }

    private func seedAgents() {
        guard agents.isEmpty else { return }
        for name in agentNames {
            modelContext.insert(AgentStatusRecord(
                name: name,
                status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label,
                priority: CommandPriority.high.rawValue,
                assignedMission: currentMission,
                lastActivity: "Founder Operations daily runtime seeded.",
                nextAction: "Review mission board and update command history."
            ))
        }
    }

    private func copy(_ text: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
    }
}

private extension View {
    func founderField(_ themeManager: ThemeManager) -> some View {
        self
            .textFieldStyle(.plain)
            .padding(10)
            .foregroundStyle(themeManager.theme.text)
            .background(themeManager.theme.elevatedPanel)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
    }
}
