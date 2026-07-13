import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct CommanderStatusBar: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var commands: [RemoteCommand]
    @Query(sort: \LocalNotificationRecord.createdAt, order: .reverse) private var notifications: [LocalNotificationRecord]
    @State private var glow = false

    private var queuedCommands: Int {
        commands.filter { $0.status == RemoteCommandStatus.queued.rawValue }.count
    }

    private var readiness: Int {
        max(51, min(98, 82 - queuedCommands * 3 + commands.filter { $0.status == RemoteCommandStatus.complete.rawValue }.count))
    }

    var body: some View {
        HStack(spacing: 10) {
            compactMetric("Readiness", "\(readiness)%", "scope")
            compactMetric("Battery", batteryLabel, "battery.100")
            compactMetric("Offline", "On", "wifi.slash")
            compactMetric("Memory", memoryLabel, "memorychip")
            compactMetric("Queue", "\(queuedCommands)", "tray.full")
            compactMetric("Alerts", "\(notifications.filter { !$0.isRead }.count)", "bell.badge")
        }
        .padding(10)
        .background(themeManager.theme.panel)
        .overlay {
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(themeManager.theme.heading.opacity(glow ? 0.65 : 0.18), lineWidth: 1)
        }
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true), value: glow)
        .onAppear {
            glow = true
            #if canImport(UIKit)
            UIDevice.current.isBatteryMonitoringEnabled = true
            #endif
        }
    }

    private func compactMetric(_ title: String, _ value: String, _ icon: String) -> some View {
        VStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
            Text(value)
                .font(.caption.weight(.black))
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(title)
                .font(.caption2)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity)
        .foregroundStyle(themeManager.theme.text.opacity(0.82))
    }

    private var batteryLabel: String {
        #if canImport(UIKit)
        let level = UIDevice.current.batteryLevel
        return level < 0 ? "N/A" : "\(Int(level * 100))%"
        #else
        return "N/A"
        #endif
    }

    private var memoryLabel: String {
        let gigabytes = Double(ProcessInfo.processInfo.physicalMemory) / 1_073_741_824
        return "\(Int(gigabytes))GB"
    }
}

struct FounderDashboardView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var commands: [RemoteCommand]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var legacyConversations: [ConversationMemory]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \FounderJournalEntry.createdAt, order: .reverse) private var founderJournal: [FounderJournalEntry]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var musicNotes: [MusicProjectNote]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vaultEntries: [VaultEntry]
    @Query(sort: \Reminder.dueAt) private var reminders: [Reminder]
    @State private var pulse = false

    private var openMissionCount: Int {
        savedMissions.filter { !$0.isComplete }.count + missions.filter { $0.status != RemoteCommandStatus.complete.label }.count
    }

    private var completedTodayCount: Int {
        let completedSaved = savedMissions.filter { $0.isComplete && Calendar.current.isDateInToday($0.createdAt) }.count
        let completedNew = missions.filter { item in
            guard item.status == RemoteCommandStatus.complete.label else { return false }
            return Calendar.current.isDateInToday(item.completedAt ?? item.createdAt)
        }.count
        return completedSaved + completedNew
    }

    private var readiness: Int {
        max(52, min(99, 88 - openMissionCount * 2 + completedTodayCount * 4))
    }

    private var energyScore: Int {
        journal.first?.energyScore ?? 77
    }

    private var latestConversationTitle: String {
        conversations.first?.title ?? legacyConversations.first?.title ?? "No AI conversations yet"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Founder Dashboard 2.0")
                        .font(.largeTitle.weight(.black))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("ARCHAIOS OS local command center for Colonel Blackburn.")
                        .font(.subheadline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    TimelineView(.periodic(from: .now, by: 30)) { context in
                        Text(context.date.formatted(date: .complete, time: .shortened))
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                    }
                }
                Spacer()
                ZStack {
                    Circle()
                        .stroke(themeManager.theme.heading.opacity(0.22), lineWidth: 8)
                    Circle()
                        .trim(from: 0, to: Double(readiness) / 100)
                        .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                        .rotationEffect(.degrees(-90))
                    Text("\(readiness)%")
                        .font(.headline.weight(.black))
                        .foregroundStyle(themeManager.theme.text)
                }
                .frame(width: 82, height: 82)
                .scaleEffect(pulse ? 1.03 : 0.98)
            }

            Text("Mission Quote: Discipline makes the vision portable.")
                .font(.callout.weight(.semibold))
                .foregroundStyle(themeManager.theme.text.opacity(0.80))
                .padding(10)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Mission Readiness", value: "\(readiness)%", context: "Military-style score")
                MetricCard(title: "Today's Focus", value: "Execute", context: "Top mission lane")
                MetricCard(title: "Energy Score", value: "\(energyScore)", context: "Local journal signal")
                MetricCard(title: "Open Missions", value: "\(openMissionCount)", context: "Saved + planned")
                MetricCard(title: "Completed Today", value: "\(completedTodayCount)", context: "Local completions")
                MetricCard(title: "Journal Streak", value: "\(journal.count + founderJournal.count)", context: "Entries captured")
                MetricCard(title: "Recent AI Conversations", value: "\(legacyConversations.count + conversations.count)", context: latestConversationTitle)
                MetricCard(title: "Latest Music Idea", value: musicNotes.first?.title ?? "Waiting", context: musicNotes.first?.project ?? "Music Command")
                MetricCard(title: "Latest Vault Entry", value: vaultEntries.first?.title ?? "Waiting", context: vaultEntries.first?.category ?? "Black Vault")
                MetricCard(title: "Infrastructure", value: "Mock", context: "Local status only")
                MetricCard(title: "Upcoming Reminder", value: reminders.first(where: { !$0.isComplete })?.title ?? "None", context: "Local only")
                MetricCard(title: "Command Queue", value: "\(commands.filter { $0.status == RemoteCommandStatus.queued.rawValue }.count)", context: "No network calls")
            }
        }
        .padding()
        .background(themeManager.theme.elevatedPanel)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .onAppear { pulse = true }
        .animation(.easeInOut(duration: 1.4).repeatForever(autoreverses: true), value: pulse)
    }
}

struct FounderBriefingEngineView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var savedMissions: [SavedMission]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]

    private var pendingMissions: Int {
        savedMissions.filter { !$0.isComplete }.count + missions.filter { $0.status != RemoteCommandStatus.complete.label }.count
    }

    private var readiness: Int {
        max(50, min(99, 86 - pendingMissions * 3))
    }

    var body: some View {
        CommandCard(title: "Founder Briefing Engine", systemImage: "sunrise.fill") {
            Text("Good Morning Colonel Blackburn")
                .font(.title3.weight(.black))
                .foregroundStyle(themeManager.theme.heading)
            Text("Today's Mission")
                .font(.headline)
                .foregroundStyle(themeManager.theme.text)
            Text("Move the operating system forward while preserving local-first discipline.")
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                MetricCard(title: "Readiness", value: "\(readiness)%", context: "Military score")
                MetricCard(title: "Pending Missions", value: "\(pendingMissions)", context: "Requires command")
                MetricCard(title: "Yesterday Summary", value: "Logged", context: "Sprint 7 verified")
                MetricCard(title: "Today's Notes", value: "\(journal.prefix(3).count)", context: "Local journal")
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("Top 3 Priorities")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
                Label("Verify the Founder Intelligence migration path.", systemImage: "1.circle.fill")
                Label("Keep routing cards mock-only behind flags.", systemImage: "2.circle.fill")
                Label("Capture mission outcomes into local memory.", systemImage: "3.circle.fill")
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(themeManager.theme.text.opacity(0.76))

            Text("Motivational Quote: Command the day before the day commands you.")
                .font(.caption.weight(.bold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
        }
    }
}

struct AIConversationCenterView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var memories: [ConversationMemory]
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @State private var search = ""
    @State private var draftPrompt = ""
    @State private var isTyping = false

    private var filteredConversations: [Conversation] {
        conversations.filter { conversation in
            search.isEmpty ||
                conversation.title.localizedCaseInsensitiveContains(search) ||
                conversation.folder.localizedCaseInsensitiveContains(search) ||
                conversation.messagesText.localizedCaseInsensitiveContains(search)
        }
    }

    var body: some View {
        CommandCard(title: "AI Commander Conversation Center", systemImage: "bubble.left.and.bubble.right.fill") {
            TextField("Search conversations", text: $search)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            HStack {
                StatusPill(title: "Pinned \(conversations.filter(\.isPinned).count)", status: .green)
                StatusPill(title: "Favorites \(conversations.filter(\.isFavorite).count + memories.filter(\.isFavorite).count)", status: .amber)
                StatusPill(title: "Folders \(Set(conversations.map(\.folder)).count)", status: .standby)
            }

            if filteredConversations.isEmpty && memories.isEmpty {
                EmptyStateView(title: "No conversation history yet", detail: "Create a mock commander exchange or save AI Commander commands locally.", systemImage: "text.bubble")
            } else {
                ForEach(filteredConversations.prefix(4)) { conversation in
                    conversationRow(title: conversation.title, detail: conversation.messagesText, folder: conversation.folder, date: conversation.updatedAt, pinned: conversation.isPinned, favorite: conversation.isFavorite) {
                        conversation.isPinned.toggle()
                    } favoriteAction: {
                        conversation.isFavorite.toggle()
                    }
                }
                ForEach(memories.prefix(3)) { memory in
                    conversationRow(title: memory.title, detail: memory.response, folder: memory.tagsText.isEmpty ? "Legacy Memory" : memory.tagsText, date: memory.createdAt, pinned: false, favorite: memory.isFavorite) {
                        Haptics.selection()
                    } favoriteAction: {
                        memory.isFavorite.toggle()
                    }
                }
            }

            if isTyping {
                Label("Commander is drafting an offline mock response...", systemImage: "ellipsis.message.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(themeManager.theme.heading)
                    .transition(.opacity)
            }

            TextField("Ask Commander in mock mode", text: $draftPrompt)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            CommanderButton(title: "Save Mock Conversation", systemImage: "tray.and.arrow.down.fill") {
                saveConversation()
            }

            VStack(alignment: .leading, spacing: 6) {
                Text("Saved Prompts")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
                ForEach((prompts.isEmpty ? defaultPrompts : prompts.map { $0.title }).prefix(4), id: \.self) { prompt in
                    Label(prompt, systemImage: "bookmark.fill")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                }
            }
        }
    }

    private var defaultPrompts: [String] {
        ["Daily Commander Brief", "Mission Risk Audit", "Founder Sprint Plan", "Black Vault Memory Capture"]
    }

    private func conversationRow(
        title: String,
        detail: String,
        folder: String,
        date: Date,
        pinned: Bool,
        favorite: Bool,
        pinAction: @escaping () -> Void,
        favoriteAction: @escaping () -> Void
    ) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Spacer()
                Button(action: pinAction) {
                    Image(systemName: pinned ? "pin.fill" : "pin")
                }
                Button(action: favoriteAction) {
                    Image(systemName: favorite ? "star.fill" : "star")
                }
            }
            .foregroundStyle(themeManager.theme.heading)
            Text(detail.isEmpty ? "Offline response history ready." : detail)
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.68))
                .lineLimit(2)
            Text("\(folder) | \(date.formatted(date: .abbreviated, time: .shortened))")
                .font(.caption2.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.76))
        }
        .padding(.vertical, 6)
    }

    private func saveConversation() {
        let prompt = draftPrompt.trimmingCharacters(in: .whitespacesAndNewlines)
        let title = prompt.isEmpty ? "Founder Intelligence Mock Chat" : prompt
        withAnimation(.snappy) {
            isTyping = true
        }
        modelContext.insert(Conversation(
            title: title,
            folder: "Commander",
            messagesText: "You: \(title)\nCommander: Offline mock response saved locally with timestamp.",
            isPinned: conversations.isEmpty,
            isFavorite: false
        ))
        modelContext.insert(CommandTimelineEvent(title: title, detail: "AI conversation saved locally.", category: "AI Conversation"))
        draftPrompt = ""
        Haptics.success()
        Task {
            try? await Task.sleep(nanoseconds: 900_000_000)
            await MainActor.run {
                withAnimation(.snappy) {
                    isTyping = false
                }
            }
        }
    }
}

struct MissionPlannerView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @State private var title = ""
    @State private var priority = CommandPriority.high

    var body: some View {
        CommandCard(title: "Mission Planner", systemImage: "map.fill") {
            TextField("Mission title", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            Picker("Priority", selection: $priority) {
                ForEach(CommandPriority.allCases) { item in
                    Text(item.rawValue).tag(item)
                }
            }
            .pickerStyle(.segmented)
            CommanderButton(title: "Create Planner Mission", systemImage: "plus.circle.fill") {
                createMission()
            }

            if missions.isEmpty {
                EmptyStateView(title: "Mission planner ready", detail: "Create cards with priority, status, deadline, tags, checklist, notes, attachment placeholder, and completion timeline.", systemImage: "rectangle.stack.badge.plus")
            } else {
                ForEach(missions.prefix(6)) { mission in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(mission.title)
                                    .font(.headline)
                                    .foregroundStyle(themeManager.theme.text)
                                Text("\(mission.priority) | \(mission.status) | Due \(mission.deadline.formatted(date: .abbreviated, time: .omitted))")
                                    .font(.caption)
                                    .foregroundStyle(themeManager.theme.text.opacity(0.64))
                            }
                            Spacer()
                            Button {
                                complete(mission)
                            } label: {
                                Image(systemName: mission.status == RemoteCommandStatus.complete.label ? "checkmark.seal.fill" : "circle")
                                    .foregroundStyle(themeManager.theme.heading)
                            }
                            .buttonStyle(.plain)
                        }
                        Text("Tags: \(mission.tagsText)")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.76))
                        Text("Checklist: \(mission.checklistText)")
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.68))
                        Text("Notes: \(mission.notes)")
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.68))
                        Label(mission.attachmentPlaceholder, systemImage: "paperclip")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        Text("Timeline: \(mission.completionTimelineText)")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.70))
                    }
                    .padding()
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }

    private func createMission() {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let missionTitle = clean.isEmpty ? "Founder Intelligence Mission" : clean
        modelContext.insert(Mission(
            title: missionTitle,
            priority: priority.rawValue,
            status: RemoteCommandStatus.queued.label,
            deadline: Calendar.current.date(byAdding: .day, value: 1, to: .now) ?? .now,
            tagsText: "founder, sprint, local-first",
            checklistText: "Define objective | Execute locally | Verify on iPhone",
            notes: "Mission created from Sprint 8 Mission Planner.",
            attachmentPlaceholder: "Attachments placeholder ready",
            completionTimelineText: "Created \(Date.now.formatted(date: .abbreviated, time: .shortened))"
        ))
        modelContext.insert(CommandTimelineEvent(title: missionTitle, detail: "Mission Created", category: "Mission Created"))
        title = ""
        Haptics.success()
    }

    private func complete(_ mission: Mission) {
        mission.status = RemoteCommandStatus.complete.label
        mission.completedAt = .now
        mission.completionTimelineText += " | Completed \(Date.now.formatted(date: .abbreviated, time: .shortened))"
        modelContext.insert(CommandTimelineEvent(title: mission.title, detail: "Mission Completed", category: "Mission Completed"))
        Haptics.success()
    }
}

struct IntelligenceTimelineView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var events: [CommandTimelineEvent]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \Reminder.createdAt, order: .reverse) private var reminders: [Reminder]

    private struct Event: Identifiable {
        let id = UUID()
        let title: String
        let detail: String
        let date: Date
        let status: SystemStatus
    }

    private var feed: [Event] {
        let missionEvents = missions.map { Event(title: $0.title, detail: $0.status == RemoteCommandStatus.complete.label ? "Mission Completed" : "Mission Created", date: $0.createdAt, status: $0.status == RemoteCommandStatus.complete.label ? .green : .amber) }
        let journalEvents = journal.map { Event(title: $0.title, detail: "Journal Added", date: $0.createdAt, status: .green) }
        let musicEvents = music.map { Event(title: $0.title, detail: "Music Note", date: $0.createdAt, status: .standby) }
        let conversationEvents = conversations.map { Event(title: $0.title, detail: "AI Conversation", date: $0.updatedAt, status: .green) }
        let reminderEvents = reminders.map { Event(title: $0.title, detail: "Reminder", date: $0.createdAt, status: .amber) }
        let commandEvents = events.map { Event(title: $0.title, detail: $0.category, date: $0.createdAt, status: .standby) }
        let systemEvents = [
            Event(title: "Infrastructure Event", detail: "Mock local status refreshed", date: .now, status: .amber),
            Event(title: "Build Event", detail: "Last verified from local Xcode build", date: .now, status: .green)
        ]
        return (missionEvents + journalEvents + musicEvents + conversationEvents + reminderEvents + commandEvents + systemEvents).sorted { $0.date > $1.date }
    }

    var body: some View {
        CommandCard(title: "Intelligence Timeline", systemImage: "list.bullet.rectangle.portrait.fill") {
            ForEach(feed.prefix(10)) { item in
                TimelineRow(title: item.title, detail: "\(item.detail) | \(item.date.formatted(date: .abbreviated, time: .shortened))", status: item.status)
            }
        }
    }
}

struct PersonalKnowledgeMemoryView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var nodes: [KnowledgeNode]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @State private var search = ""
    @State private var title = ""
    @State private var category = "Ideas"

    private let categories = ["Ideas", "Research", "Dreams", "Scripture Notes", "Album Notes", "Business Notes", "Military Notes", "Technology Notes"]

    private var filteredNodes: [KnowledgeNode] {
        nodes.filter { item in
            search.isEmpty ||
                item.title.localizedCaseInsensitiveContains(search) ||
                item.category.localizedCaseInsensitiveContains(search) ||
                item.body.localizedCaseInsensitiveContains(search) ||
                item.tagsText.localizedCaseInsensitiveContains(search)
        }
    }

    var body: some View {
        CommandCard(title: "Personal Knowledge Memory", systemImage: "brain.filled.head.profile") {
            TextField("Search everything instantly", text: $search)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            Picker("Category", selection: $category) {
                ForEach(categories, id: \.self) { item in
                    Text(item).tag(item)
                }
            }
            .pickerStyle(.menu)

            TextField("Capture memory", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            CommanderButton(title: "Save Knowledge Node", systemImage: "square.and.arrow.down.fill") {
                saveNode()
            }

            LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 8)], spacing: 8) {
                ForEach(categories, id: \.self) { item in
                    StatusCard(title: item, status: .standby, detail: "\(nodes.filter { $0.category == item }.count) local nodes", systemImage: "folder")
                }
            }

            ForEach(filteredNodes.prefix(6)) { node in
                TimelineRow(title: node.title, detail: "\(node.category): \(node.body)", status: .green)
            }
            ForEach(research.prefix(3)) { item in
                TimelineRow(title: item.title, detail: "\(item.category): \(item.body)", status: .standby)
            }
        }
    }

    private func saveNode() {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let nodeTitle = clean.isEmpty ? "\(category) Memory" : clean
        modelContext.insert(KnowledgeNode(
            title: nodeTitle,
            category: category,
            body: "Captured locally from Founder Intelligence.",
            tagsText: "founder, memory, \(category.lowercased())"
        ))
        modelContext.insert(CommandTimelineEvent(title: nodeTitle, detail: "Knowledge node saved.", category: "Saved Note"))
        title = ""
        Haptics.success()
    }
}

struct AIRoutingSimulatorView: View {
    @EnvironmentObject private var themeManager: ThemeManager

    private let routes: [(String, String, Int, String, Int)] = [
        ("ChatGPT", "Offline", 42, "Never", 0),
        ("Codex", "Offline", 38, "Local build only", 1),
        ("OpenClaw", "Offline", 57, "Mock audit", 0),
        ("GitHub", "Offline", 64, "No API", 0),
        ("Notion", "Offline", 71, "Black Vault local", 0),
        ("Claude", "Offline", 49, "Future flag off", 0),
        ("Gemini", "Offline", 53, "Future flag off", 0)
    ]

    var body: some View {
        CommandCard(title: "AI Routing Simulator", systemImage: "point.3.connected.trianglepath.dotted") {
            Text("Routing cards only. All services are mock/offline and make no production calls.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                ForEach(routes, id: \.0) { route in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(route.0)
                                .font(.headline)
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            Circle()
                                .fill(themeManager.theme.warning)
                                .frame(width: 8, height: 8)
                        }
                        Text(route.1)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(themeManager.theme.heading)
                        Text("Mock Latency: \(route.2)ms")
                        Text("Last Sync: \(route.3)")
                        Text("Queue Length: \(route.4)")
                    }
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.68))
                    .padding()
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }
}

struct NeuralDashboardPolishView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query private var conversations: [Conversation]
    @Query private var legacyConversations: [ConversationMemory]
    @Query private var knowledge: [KnowledgeNode]
    @Query private var agents: [Agent]
    @Query private var missions: [Mission]
    @Query private var savedMissions: [SavedMission]
    @Query private var relationships: [KnowledgeRelationship]
    @State private var animate = false

    private var missionCount: Int { missions.count + savedMissions.count }
    private var completion: Double {
        let completed = missions.filter { $0.status == RemoteCommandStatus.complete.label }.count + savedMissions.filter(\.isComplete).count
        return missionCount == 0 ? 0.64 : Double(completed) / Double(max(1, missionCount))
    }
    private var readiness: Int { max(55, min(98, 82 + Int(completion * 12) - relationships.count / 6)) }

    var body: some View {
        CommandCard(title: "Neural Dashboard Polish", systemImage: "gauge.with.dots.needle.67percent") {
            HStack(alignment: .center, spacing: 16) {
                progressRing(title: "Readiness", value: Double(readiness) / 100, label: "\(readiness)%")
                progressRing(title: "Missions", value: completion, label: "\(Int(completion * 100))%")
                VStack(alignment: .leading, spacing: 8) {
                    MetricCard(title: "Today's Score", value: "\(readiness + Int(completion * 10))", context: "Animated local score")
                    MetricCard(title: "Memory Count", value: "\(knowledge.count)", context: "Founder memory")
                }
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 130), spacing: 8)], spacing: 8) {
                MetricCard(title: "Conversations", value: "\(conversations.count + legacyConversations.count)", context: "Local")
                MetricCard(title: "Knowledge", value: "\(knowledge.count)", context: "Nodes")
                MetricCard(title: "Agents", value: "\(max(agents.count, 7))", context: "Console")
                MetricCard(title: "Missions", value: "\(missionCount)", context: "Active graph")
            }
        }
        .onAppear { animate = true }
        .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: animate)
    }

    private func progressRing(title: String, value: Double, label: String) -> some View {
        VStack(spacing: 8) {
            ZStack {
                Circle()
                    .stroke(themeManager.theme.text.opacity(0.12), lineWidth: 8)
                Circle()
                    .trim(from: 0, to: min(1, max(0, animate ? value : value * 0.72)))
                    .stroke(themeManager.theme.heading, style: StrokeStyle(lineWidth: 8, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                Text(label)
                    .font(.caption.weight(.black))
                    .foregroundStyle(themeManager.theme.text)
            }
            .frame(width: 78, height: 78)
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
        }
    }
}

struct CommandCenterSearchView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query private var conversations: [Conversation]
    @Query private var legacyConversations: [ConversationMemory]
    @Query private var missions: [Mission]
    @Query private var savedMissions: [SavedMission]
    @Query private var journal: [JournalEntry]
    @Query private var founderJournal: [FounderJournalEntry]
    @Query private var research: [ResearchNote]
    @Query private var reminders: [Reminder]
    @Query private var prompts: [PromptTemplate]
    @Query private var knowledge: [KnowledgeNode]
    @Query private var music: [MusicProjectNote]
    @State private var search = ""

    var body: some View {
        CommandCard(title: "Command Center Search", systemImage: "magnifyingglass.circle.fill") {
            TextField("Universal search across every local model", text: $search)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            searchGroup("Conversation", items: conversationResults)
            searchGroup("Mission", items: missionResults)
            searchGroup("Journal", items: journalResults)
            searchGroup("Research", items: researchResults)
            searchGroup("Reminder", items: reminderResults)
            searchGroup("Prompt", items: promptResults)
            searchGroup("Knowledge", items: knowledgeResults)
            searchGroup("Music", items: musicResults)
        }
    }

    private func matches(_ text: String) -> Bool {
        search.isEmpty || text.localizedCaseInsensitiveContains(search)
    }

    private var conversationResults: [String] {
        conversations.filter { matches($0.title + $0.messagesText + $0.folder) }.map(\.title) +
        legacyConversations.filter { matches($0.title + $0.prompt + $0.response) }.map(\.title)
    }

    private var missionResults: [String] {
        missions.filter { matches($0.title + $0.notes + $0.tagsText) }.map(\.title) +
        savedMissions.filter { matches($0.title + $0.checklistText) }.map(\.title)
    }

    private var journalResults: [String] {
        journal.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title) +
        founderJournal.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title)
    }

    private var researchResults: [String] { research.filter { matches($0.title + $0.body + $0.tagsText) }.map(\.title) }
    private var reminderResults: [String] { reminders.filter { matches($0.title + $0.note) }.map(\.title) }
    private var promptResults: [String] { prompts.filter { matches($0.title + $0.prompt + $0.category) }.map(\.title) }
    private var knowledgeResults: [String] { knowledge.filter { matches($0.title + $0.body + $0.category + $0.tagsText) }.map(\.title) }
    private var musicResults: [String] { music.filter { matches($0.title + $0.note + $0.category + $0.tagsText) }.map(\.title) }

    private func searchGroup(_ title: String, items: [String]) -> some View {
        VStack(alignment: .leading, spacing: 5) {
            Text("\(title) (\(items.count))")
                .font(.caption.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            if items.isEmpty {
                Text(search.isEmpty ? "Type to search local \(title.lowercased()) data." : "No matches.")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.52))
            } else {
                ForEach(items.prefix(3), id: \.self) { item in
                    Label(item, systemImage: "doc.text.magnifyingglass")
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                }
            }
        }
        .padding(.vertical, 4)
    }
}

struct KnowledgeGraphView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \JournalEntry.createdAt, order: .reverse) private var journal: [JournalEntry]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var music: [MusicProjectNote]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vault: [VaultEntry]
    @Query(sort: \KnowledgeRelationship.createdAt, order: .reverse) private var relationships: [KnowledgeRelationship]

    var body: some View {
        CommandCard(title: "Knowledge Graph", systemImage: "point.3.connected.trianglepath.dotted") {
            Text("Everything connects to everything through local IDs, tags, and relationship edges.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 135), spacing: 8)], spacing: 8) {
                graphMetric("Conversation", conversations.count)
                graphMetric("Mission", missions.count)
                graphMetric("Journal", journal.count)
                graphMetric("Research", research.count)
                graphMetric("Knowledge", knowledge.count)
                graphMetric("Music", music.count)
                graphMetric("Infrastructure", vault.filter { $0.category.localizedCaseInsensitiveContains("engineering") || $0.category.localizedCaseInsensitiveContains("operations") }.count)
                graphMetric("Edges", relationships.count)
            }
            CommanderButton(title: "Auto-Relate Latest Local Items", systemImage: "link.circle.fill") {
                relateLatest()
            }
            relatedContent
        }
    }

    private func graphMetric(_ title: String, _ count: Int) -> some View {
        MetricCard(title: title, value: "\(count)", context: "Graph node")
    }

    private var relatedContent: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Open Mission Relationship Preview")
                .font(.subheadline.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            TimelineRow(title: missions.first?.title ?? "No mission selected", detail: "Related conversations: \(conversations.prefix(2).map(\.title).joined(separator: ", "))", status: .green)
            TimelineRow(title: "Related journal entries", detail: journal.prefix(2).map(\.title).joined(separator: ", ").nilIfEmpty ?? "Waiting for local entries", status: .standby)
            TimelineRow(title: "Related music ideas", detail: music.prefix(2).map(\.title).joined(separator: ", ").nilIfEmpty ?? "Waiting for music notes", status: .standby)
            TimelineRow(title: "Related Black Vault notes", detail: vault.prefix(2).map(\.title).joined(separator: ", ").nilIfEmpty ?? "Waiting for vault docs", status: .amber)
        }
    }

    private func relateLatest() {
        guard let mission = missions.first else { return }
        if let conversation = conversations.first {
            modelContext.insert(KnowledgeRelationship(sourceID: mission.id, sourceType: "Mission", targetID: conversation.id, targetType: "Conversation", relation: "Mission to Conversation", strength: 8))
        }
        if let note = knowledge.first {
            modelContext.insert(KnowledgeRelationship(sourceID: mission.id, sourceType: "Mission", targetID: note.id, targetType: "Knowledge", relation: "Mission to Knowledge", strength: 7))
        }
        modelContext.insert(CommandTimelineEvent(title: mission.title, detail: "Knowledge graph relationships generated locally.", category: "Knowledge Graph"))
        Haptics.success()
    }
}

struct NeuralDailyBriefEngineView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \DailyBriefCard.createdAt, order: .reverse) private var briefs: [DailyBriefCard]
    @Query private var missions: [Mission]
    @State private var selected = "Morning"

    private let types = ["Morning", "Afternoon", "Evening", "Weekly Review", "Mission Review", "Readiness Review"]

    var body: some View {
        CommandCard(title: "Daily Brief Engine", systemImage: "doc.text.image.fill") {
            Picker("Brief Type", selection: $selected) {
                ForEach(types, id: \.self) { Text($0).tag($0) }
            }
            .pickerStyle(.menu)
            CommanderButton(title: "Generate Local Brief Card", systemImage: "plus.square.on.square") {
                generateBrief()
            }
            if briefs.isEmpty {
                EmptyStateView(title: "No generated briefs yet", detail: "Generate morning, afternoon, evening, weekly, mission, and readiness cards locally.", systemImage: "sun.max")
            } else {
                ForEach(briefs.prefix(5)) { brief in
                    VStack(alignment: .leading, spacing: 7) {
                        HStack {
                            Text(brief.title)
                                .font(.headline)
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            Text("\(brief.readinessScore)%")
                                .font(.caption.weight(.black))
                                .foregroundStyle(themeManager.theme.heading)
                        }
                        Text(brief.body)
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.70))
                        Text("Wins: \(brief.winsText)")
                        Text("Blockers: \(brief.blockersText)")
                        Text("Next: \(brief.nextActionsText)")
                    }
                    .font(.caption)
                    .padding()
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }

    private func generateBrief() {
        let openMissions = missions.filter { $0.status != RemoteCommandStatus.complete.label }.count
        modelContext.insert(DailyBriefCard(
            title: "\(selected) Brief",
            category: selected,
            body: "Local \(selected.lowercased()) command card generated without network calls.",
            readinessScore: max(58, min(96, 88 - openMissions * 4)),
            winsText: "Founder OS remains local-first.",
            blockersText: openMissions == 0 ? "None logged." : "\(openMissions) open missions require attention.",
            nextActionsText: "Pick one mission, clear one blocker, capture the result."
        ))
        modelContext.insert(CommandTimelineEvent(title: "\(selected) Brief", detail: "Daily brief card generated locally.", category: "Daily Brief"))
        Haptics.success()
    }
}

struct NeuralAgentConsoleView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Agent.createdAt, order: .reverse) private var agents: [Agent]
    @Query(sort: \Mission.createdAt, order: .reverse) private var missions: [Mission]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]

    private let defaults = ["Commander", "Engineer", "Architect", "Research", "Music", "Operations", "Security"]

    var body: some View {
        CommandCard(title: "Agent Console", systemImage: "person.3.sequence.fill") {
            CommanderButton(title: "Seed Local Agents", systemImage: "person.crop.circle.badge.plus") {
                seedAgents()
            }
            ForEach(agentRows, id: \.name) { row in
                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text(row.name)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        Spacer()
                        StatusPill(title: row.status, status: row.status == "Online" ? .green : .standby)
                    }
                    Text("Mission Queue: \(row.queue) | Knowledge: \(knowledge.count) | Assigned Conversations: \(conversations.prefix(3).count)")
                    Text("Recent Activity: \(row.activity)")
                }
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.70))
                .padding(.vertical, 6)
            }
        }
    }

    private var agentRows: [(name: String, status: String, queue: Int, activity: String)] {
        let stored = agents.map { ($0.name, $0.status, $0.queueLength, $0.lastActivity) }
        guard stored.isEmpty else { return stored }
        return defaults.map { ($0, "Offline", missions.count, "Local agent card ready for assignment.") }
    }

    private func seedAgents() {
        guard agents.isEmpty else { return }
        for name in defaults {
            modelContext.insert(Agent(name: name, role: name, status: name == "Commander" ? SystemStatus.green.label : SystemStatus.standby.label, queueLength: missions.count, lastActivity: "Sprint 9 neural console seeded locally."))
        }
        Haptics.success()
    }
}

struct PromptLibraryView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \PromptTemplate.createdAt, order: .reverse) private var prompts: [PromptTemplate]
    @Query(sort: \Agent.createdAt, order: .reverse) private var agents: [Agent]
    @State private var search = ""
    @State private var title = ""
    @State private var category = "Engineering"

    private let categories = ["Engineering", "Research", "Music", "Business", "Military Planning", "Daily Brief", "Codex", "OpenClaw", "ChatGPT"]

    var body: some View {
        CommandCard(title: "Prompt Library", systemImage: "text.book.closed.fill") {
            TextField("Search prompts", text: $search)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            Picker("Category", selection: $category) {
                ForEach(categories, id: \.self) { Text($0).tag($0) }
            }
            .pickerStyle(.menu)
            TextField("Prompt title", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            CommanderButton(title: "Save Prompt Template", systemImage: "bookmark.circle.fill") {
                savePrompt()
            }
            ForEach(filteredPrompts.prefix(8)) { prompt in
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(prompt.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Text("\(prompt.category) | Tags: \(prompt.category.lowercased()), founder, reusable")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    }
                    Spacer()
                    Button { prompt.isFavorite.toggle() } label: {
                        Image(systemName: prompt.isFavorite ? "star.fill" : "star")
                    }
                    Button { duplicate(prompt) } label: {
                        Image(systemName: "plus.square.on.square")
                    }
                }
                .foregroundStyle(themeManager.theme.heading)
            }
            Text("Prompt to Agent links ready: \(agents.count) stored agents.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.80))
        }
    }

    private var filteredPrompts: [PromptTemplate] {
        prompts.filter { search.isEmpty || $0.title.localizedCaseInsensitiveContains(search) || $0.category.localizedCaseInsensitiveContains(search) || $0.prompt.localizedCaseInsensitiveContains(search) }
    }

    private func savePrompt() {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let promptTitle = clean.isEmpty ? "\(category) Founder Prompt" : clean
        modelContext.insert(PromptTemplate(title: promptTitle, category: category, prompt: "Use this \(category.lowercased()) prompt in local mock mode. Include objective, constraints, risks, and verification.", isFavorite: false))
        Haptics.success()
    }

    private func duplicate(_ prompt: PromptTemplate) {
        modelContext.insert(PromptTemplate(title: "\(prompt.title) Copy", category: prompt.category, prompt: prompt.prompt, isFavorite: prompt.isFavorite))
        Haptics.selection()
    }
}

struct FounderMemoryView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \KnowledgeNode.createdAt, order: .reverse) private var knowledge: [KnowledgeNode]
    @Query(sort: \ResearchNote.createdAt, order: .reverse) private var research: [ResearchNote]
    @State private var category = "Ideas"
    @State private var title = ""

    private let categories = ["Ideas", "Lessons Learned", "Dreams", "Scripture", "Quotes", "Business", "Military", "Technology", "Albums"]

    var body: some View {
        CommandCard(title: "Founder Memory", systemImage: "externaldrive.badge.person.crop") {
            Picker("Memory Category", selection: $category) {
                ForEach(categories, id: \.self) { Text($0).tag($0) }
            }
            .pickerStyle(.menu)
            TextField("Memory title", text: $title)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            CommanderButton(title: "Capture Founder Memory", systemImage: "brain.head.profile") {
                saveMemory()
            }
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 130), spacing: 8)], spacing: 8) {
                ForEach(categories, id: \.self) { item in
                    MetricCard(title: item, value: "\(knowledge.filter { $0.category == item }.count)", context: "Related memories")
                }
            }
            ForEach(knowledge.prefix(5)) { node in
                TimelineRow(title: node.title, detail: "\(node.category): automatically related by category and tags.", status: .green)
            }
        }
    }

    private func saveMemory() {
        let clean = title.trimmingCharacters(in: .whitespacesAndNewlines)
        let node = KnowledgeNode(title: clean.isEmpty ? "\(category) Memory" : clean, category: category, body: "Founder memory captured locally.", tagsText: "founder, \(category.lowercased())")
        modelContext.insert(node)
        if let firstResearch = research.first {
            modelContext.insert(KnowledgeRelationship(sourceID: node.id, sourceType: "Knowledge", targetID: firstResearch.id, targetType: "Research", relation: "Knowledge to Research", strength: 6))
        }
        title = ""
        Haptics.success()
    }
}

struct SmartTimelineView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var events: [CommandTimelineEvent]
    @Query(sort: \Agent.createdAt, order: .reverse) private var agents: [Agent]
    @State private var range = "Today"
    @State private var type = "All"
    @State private var search = ""

    private let ranges = ["Today", "Yesterday", "Week", "Month"]
    private let types = ["All", "Agent", "Mission", "Search", "Command", "Daily Brief", "Knowledge Graph"]

    var body: some View {
        CommandCard(title: "Smart Timeline", systemImage: "timeline.selection") {
            HStack {
                Picker("Range", selection: $range) {
                    ForEach(ranges, id: \.self) { Text($0).tag($0) }
                }
                Picker("Type", selection: $type) {
                    ForEach(types, id: \.self) { Text($0).tag($0) }
                }
            }
            .pickerStyle(.menu)
            TextField("Search timeline", text: $search)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            ForEach(filteredEvents.prefix(10)) { event in
                TimelineRow(title: event.title, detail: "\(event.category) | \(event.createdAt.formatted(date: .abbreviated, time: .shortened)) | Agent filter: \(agents.first?.name ?? "Any")", status: .standby)
            }
        }
    }

    private var filteredEvents: [CommandTimelineEvent] {
        events.filter { event in
            let matchesType = type == "All" || event.category.localizedCaseInsensitiveContains(type)
            let matchesSearch = search.isEmpty || event.title.localizedCaseInsensitiveContains(search) || event.detail.localizedCaseInsensitiveContains(search)
            let matchesRange: Bool
            switch range {
            case "Today": matchesRange = Calendar.current.isDateInToday(event.createdAt)
            case "Yesterday": matchesRange = Calendar.current.isDateInYesterday(event.createdAt)
            case "Week": matchesRange = Calendar.current.dateInterval(of: .weekOfYear, for: .now)?.contains(event.createdAt) ?? true
            default: matchesRange = Calendar.current.dateInterval(of: .month, for: .now)?.contains(event.createdAt) ?? true
            }
            return matchesType && matchesSearch && matchesRange
        }
    }
}

struct FutureIntegrationNetworkView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @EnvironmentObject private var container: AppContainer

    private var rows: [(String, Bool)] {
        [
            ("ChatGPT", container.backend.isOpenAIEnabled),
            ("Codex", container.backend.isCodexBridgeEnabled),
            ("OpenClaw", container.backend.isOpenClawBridgeEnabled),
            ("GitHub", container.backend.isGitHubBridgeEnabled),
            ("Notion", container.backend.isNotionBridgeEnabled),
            ("Supabase", container.backend.isSupabaseBridgeEnabled),
            ("Cloudflare", container.backend.isCloudflareBridgeEnabled),
            ("Apple Shortcuts", container.backend.isAppleShortcutsBridgeEnabled),
            ("Local LLM", container.backend.isLocalLLMEnabled)
        ]
    }

    var body: some View {
        CommandCard(title: "Future Integration Layer", systemImage: "switch.2") {
            Text("Protocols only. All bridges are disabled and future ready.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                ForEach(rows, id: \.0) { row in
                    VStack(alignment: .leading, spacing: 7) {
                        Text(row.0)
                            .font(.headline)
                            .foregroundStyle(themeManager.theme.text)
                        StatusPill(title: row.1 ? "Connected" : "Disabled", status: row.1 ? .green : .standby)
                        Text("Future Ready")
                            .font(.caption.weight(.bold))
                            .foregroundStyle(themeManager.theme.heading)
                    }
                    .padding()
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                }
            }
        }
    }
}

private extension String {
    var nilIfEmpty: String? {
        isEmpty ? nil : self
    }
}
