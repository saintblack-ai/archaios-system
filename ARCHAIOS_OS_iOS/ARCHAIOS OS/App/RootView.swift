import SwiftData
import SwiftUI

struct RootView: View {
    @EnvironmentObject private var container: AppContainer
    @EnvironmentObject private var themeManager: ThemeManager
    @State private var showSplash = true
    @State private var bootProgress = 0.0

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    CommanderStatusBar()
                    NavigationLink(value: AppRoute.executivePersistence) {
                        ExecutivePersistenceLaunchCard()
                    }
                    .buttonStyle(.plain)
                    NavigationLink(value: AppRoute.operationalPersistence) {
                        OperationalPersistenceLaunchCard()
                    }
                    .buttonStyle(.plain)
                    NavigationLink(value: AppRoute.livingIntelligence) {
                        LivingIntelligenceLaunchCard()
                    }
                    .buttonStyle(.plain)
                    LivingCommanderHomeView()
                    FounderOperationsHomeView()
                    moduleGrid
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 18)
            }
            .background(themeManager.theme.background)
            .navigationTitle("ARCHAIOS OS")
            .navigationDestination(for: AppRoute.self) { route in
                destination(for: route)
            }
        }
        .tint(themeManager.theme.accent)
        .overlay {
            if showSplash {
                PremiumSplashView(progress: bootProgress) {
                    withAnimation(.easeInOut(duration: 0.45)) {
                        showSplash = false
                    }
                }
                .task { await runSplashBoot() }
            }
        }
    }

    private func runSplashBoot() async {
        guard bootProgress == 0 else { return }
        for step in 1...4 {
            try? await Task.sleep(nanoseconds: 420_000_000)
            await MainActor.run {
                withAnimation(.easeInOut(duration: 0.35)) {
                    bootProgress = Double(step) / 4
                }
            }
        }
        try? await Task.sleep(nanoseconds: 520_000_000)
        await MainActor.run {
            withAnimation(.easeInOut(duration: 0.55)) {
                showSplash = false
            }
        }
    }

    private var moduleGrid: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 160), spacing: 14)], spacing: 14) {
            ForEach(AppRoute.allCases) { route in
                NavigationLink(value: route) {
                    ModuleTile(route: route)
                }
                .buttonStyle(.plain)
            }
        }
    }

    @ViewBuilder
    private func destination(for route: AppRoute) -> some View {
        switch route {
        case .executivePersistence:
            ExecutivePersistenceView()
        case .operationalPersistence:
            OperationalPersistenceView()
        case .livingIntelligence:
            LivingIntelligenceView()
        case .livingCommander:
            LivingCommanderView()
        case .founderOperations:
            FounderOperationsView()
        case .liveCommandBridge:
            LiveCommandBridgeView()
        case .coreNetwork:
            CoreNetworkView()
        case .missionControlAI:
            MissionControlAIView()
        case .intelligenceCore:
            IntelligenceCoreView()
        case .commander:
            CommanderView(viewModel: CommanderViewModel(service: container.backend))
        case .dailyCommandCenter:
            DailyCommandCenterView(viewModel: DailyCommandCenterViewModel())
        case .aiAssassins:
            AIAssassinsView(viewModel: AIAssassinsViewModel(service: container.backend))
        case .blackVault:
            BlackVaultView(viewModel: BlackVaultViewModel(service: container.backend))
        case .operations:
            OperationsView(viewModel: OperationsViewModel(service: container.backend))
        case .musicCommand:
            MusicCommandView(viewModel: MusicCommandViewModel())
        case .infrastructure:
            InfrastructureView(viewModel: InfrastructureViewModel(service: container.backend))
        case .founderMode:
            FounderModeView(viewModel: FounderModeViewModel(service: container.backend))
        case .aiCommander:
            AICommanderChatView(viewModel: AICommanderChatViewModel(router: container.backend))
        case .macCoreBridge:
            MacCoreBridgeView()
        case .splash:
            FounderBrandingView()
        case .settings:
            SettingsView(viewModel: SettingsViewModel(service: container.backend))
        }
    }
}

private struct PremiumSplashView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @State private var pulse = false
    let progress: Double
    let dismiss: () -> Void

    var body: some View {
        ZStack {
            themeManager.theme.background.ignoresSafeArea()
            ForEach(0..<3) { index in
                Circle()
                    .stroke(themeManager.theme.heading.opacity(0.08), lineWidth: 1)
                    .frame(width: CGFloat(220 + index * 74), height: CGFloat(220 + index * 74))
                    .scaleEffect(pulse ? 1.04 : 0.96)
            }
            VStack(spacing: 24) {
                ArchaiosLogoMark(size: 128)
                    .scaleEffect(pulse ? 1.06 : 0.94)
                    .shadow(color: themeManager.theme.heading.opacity(0.45), radius: pulse ? 28 : 12)
                    .animation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true), value: pulse)

                VStack(spacing: 8) {
                    Text("ARCHAIOS OS")
                        .font(.system(size: 34, weight: .black, design: .serif))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Founder Edition")
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    Text("Saint Black")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                }

                VStack(spacing: 8) {
                    ProgressView(value: progress)
                        .tint(themeManager.theme.heading)
                    Text("Loading mission systems")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.62))
                }
                .padding(.horizontal, 32)

                Button("Skip Boot", action: dismiss)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    .padding(.top, 6)
            }
            .padding()
        }
        .onAppear { pulse = true }
    }
}

private struct IntelligenceCoreView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @EnvironmentObject private var container: AppContainer
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var commands: [RemoteCommand]
    @Query(sort: \ConversationMemory.createdAt, order: .reverse) private var conversations: [ConversationMemory]
    @Query(sort: \SavedMission.createdAt, order: .reverse) private var missions: [SavedMission]
    @Query(sort: \CommandTimelineEvent.createdAt, order: .reverse) private var timelineEvents: [CommandTimelineEvent]
    @Query(sort: \LocalNotificationRecord.createdAt, order: .reverse) private var notifications: [LocalNotificationRecord]
    @Query(sort: \MusicProjectNote.createdAt, order: .reverse) private var musicNotes: [MusicProjectNote]
    @Query(sort: \VaultEntry.createdAt, order: .reverse) private var vaultEntries: [VaultEntry]
    @State private var conversationSearch = ""
    @State private var newMissionTitle = ""
    @State private var selectedPriority = CommandPriority.normal

    private var filteredConversations: [ConversationMemory] {
        conversations.filter { item in
            conversationSearch.isEmpty ||
                item.title.localizedCaseInsensitiveContains(conversationSearch) ||
                item.prompt.localizedCaseInsensitiveContains(conversationSearch) ||
                item.response.localizedCaseInsensitiveContains(conversationSearch) ||
                item.tagsText.localizedCaseInsensitiveContains(conversationSearch)
        }
    }

    private var runningMissions: [SavedMission] {
        missions.filter { !$0.isComplete }
    }

    private var completedMissions: [SavedMission] {
        missions.filter(\.isComplete)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Intelligence Core", subtitle: "Local AI operating system layer for memory, agents, missions, timeline, and notifications.")
                NeuralDashboardPolishView()
                CommandCenterSearchView()
                KnowledgeGraphView()
                NeuralDailyBriefEngineView()
                NeuralAgentConsoleView()
                PromptLibraryView()
                FounderMemoryView()
                SmartTimelineView()
                FutureIntegrationNetworkView()
                FounderBriefingEngineView()
                intelligenceDashboard
                AIConversationCenterView()
                MissionPlannerView()
                IntelligenceTimelineView()
                PersonalKnowledgeMemoryView()
                AIRoutingSimulatorView()
                dashboardWidgets
                agentConsole
                missionCenter
                conversationMemory
                commandTimeline
                notificationCenter
                futureIntegrationLayer
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Intelligence")
    }

    private var intelligenceDashboard: some View {
        CommandCard(title: "Intelligence Dashboard", systemImage: "brain.head.profile") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 140), spacing: 10)], spacing: 10) {
                MetricCard(title: "Mission Status", value: runningMissions.isEmpty ? "Standby" : "Active", context: "\(runningMissions.count) running")
                MetricCard(title: "Active Queues", value: "\(commands.filter { $0.status == RemoteCommandStatus.queued.rawValue }.count)", context: "Remote commands")
                MetricCard(title: "Recent Commands", value: "\(commands.prefix(5).count)", context: "Local history")
                MetricCard(title: "Objectives", value: "Top 3", context: "Daily OS ready")
                MetricCard(title: "Readiness", value: "61", context: "Mock score")
                MetricCard(title: "Offline", value: "On", context: "No production APIs")
            }
        }
    }

    private var dashboardWidgets: some View {
        CommandCard(title: "Dashboard Widgets", systemImage: "rectangle.grid.2x2.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                ForEach(widgets) { widget in
                    StatusCard(title: widget.title, status: widget.status, detail: "\(widget.value) - \(widget.detail)", systemImage: widget.systemImage)
                }
            }
        }
    }

    private var agentConsole: some View {
        CommandCard(title: "Agent Console", systemImage: "person.3.sequence.fill") {
            ForEach(agentCards) { agent in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: icon(for: agent.role))
                        .foregroundStyle(themeManager.theme.heading)
                        .frame(width: 24)
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(agent.role.rawValue)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            StatusPill(title: agent.status.label, status: agent.status)
                        }
                        Text(agent.recentActivity)
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.66))
                        Text("Queue \(agent.missionQueue) | Pending \(agent.pendingCommands)")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(themeManager.theme.heading.opacity(0.86))
                    }
                }
                .padding(.vertical, 6)
            }
        }
    }

    private var missionCenter: some View {
        CommandCard(title: "Mission Center", systemImage: "target") {
            TextField("Create mission", text: $newMissionTitle)
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

            CommanderButton(title: "Create Local Mission", systemImage: "plus.circle.fill") {
                createMission()
            }

            missionBucket(title: "Running Missions", missions: runningMissions)
            missionBucket(title: "Completed Missions", missions: completedMissions)
            missionBucket(title: "Mission History", missions: Array(missions.prefix(5)))
        }
    }

    private var conversationMemory: some View {
        CommandCard(title: "AI Conversation Memory", systemImage: "text.bubble.fill") {
            TextField("Search conversations", text: $conversationSearch)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            if filteredConversations.isEmpty {
                EmptyStateView(title: "No conversations found", detail: "AI Commander commands will appear here with tags, favorites, and timeline context.", systemImage: "bubble.left.and.bubble.right")
            } else {
                ForEach(filteredConversations.prefix(8)) { conversation in
                    VStack(alignment: .leading, spacing: 6) {
                        HStack {
                            Text(conversation.title)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            Button {
                                conversation.isFavorite.toggle()
                                Haptics.selection()
                            } label: {
                                Image(systemName: conversation.isFavorite ? "star.fill" : "star")
                                    .foregroundStyle(themeManager.theme.heading)
                            }
                            .buttonStyle(.plain)
                        }
                        Text(conversation.response)
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.68))
                        Text([conversation.tagsText, conversation.createdAt.formatted(date: .abbreviated, time: .shortened)].filter { !$0.isEmpty }.joined(separator: " | "))
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.heading.opacity(0.76))
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }

    private var commandTimeline: some View {
        CommandCard(title: "Command Timeline", systemImage: "timeline.selection") {
            let events = combinedTimeline
            if events.isEmpty {
                EmptyStateView(title: "Timeline waiting", detail: "Commands, responses, mission executions, and saved notes will be listed here chronologically.", systemImage: "clock")
            } else {
                ForEach(events.prefix(12), id: \.id) { event in
                    TimelineRow(title: event.title, detail: event.detail, status: event.status)
                }
            }
        }
    }

    private var notificationCenter: some View {
        CommandCard(title: "Notification Center", systemImage: "bell.badge.fill") {
            LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 10)], spacing: 10) {
                ForEach(LocalNotificationKind.allCases) { kind in
                    Button {
                        createNotification(kind)
                    } label: {
                        Label(kind.rawValue, systemImage: notificationIcon(for: kind))
                            .font(.caption.weight(.bold))
                            .frame(maxWidth: .infinity)
                            .padding(10)
                            .foregroundStyle(.black)
                            .background(themeManager.theme.heading)
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                    }
                    .buttonStyle(.plain)
                }
            }

            ForEach(notifications.prefix(5)) { item in
                HStack {
                    Image(systemName: notificationIcon(for: LocalNotificationKind(rawValue: item.kind) ?? .reminder))
                        .foregroundStyle(themeManager.theme.heading)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.title)
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Text(item.body)
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.64))
                    }
                    Spacer()
                }
                .padding(.vertical, 4)
            }
        }
    }

    private var futureIntegrationLayer: some View {
        CommandCard(title: "Future Integration Layer", systemImage: "switch.2") {
            integrationFlag("OpenAI", enabled: container.backend.isOpenAIEnabled)
            integrationFlag("Codex", enabled: container.backend.isCodexBridgeEnabled)
            integrationFlag("OpenClaw", enabled: container.backend.isOpenClawBridgeEnabled)
            integrationFlag("GitHub", enabled: container.backend.isGitHubBridgeEnabled)
            integrationFlag("Notion", enabled: container.backend.isNotionBridgeEnabled)
            integrationFlag("Supabase", enabled: container.backend.isSupabaseBridgeEnabled)
            integrationFlag("Cloudflare", enabled: container.backend.isCloudflareBridgeEnabled)
            Text("Protocol interfaces only. No production calls, keys, or secret storage.")
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading.opacity(0.84))
        }
    }

    private var widgets: [IntelligenceWidget] {
        [
            IntelligenceWidget(title: "AI Status", value: "Mock", status: .standby, detail: "offline commander", systemImage: "brain"),
            IntelligenceWidget(title: "Mac Core", value: "Off", status: .standby, detail: "bridge disabled", systemImage: "desktopcomputer"),
            IntelligenceWidget(title: "Black Vault", value: "\(vaultEntries.count)", status: .green, detail: "local docs", systemImage: "archivebox"),
            IntelligenceWidget(title: "Music", value: "\(musicNotes.count)", status: .green, detail: "notes", systemImage: "music.mic"),
            IntelligenceWidget(title: "Infrastructure", value: "Mock", status: .amber, detail: "local cards", systemImage: "network"),
            IntelligenceWidget(title: "GitHub Status", value: "Mock", status: .amber, detail: "no API", systemImage: "chevron.left.forwardslash.chevron.right"),
            IntelligenceWidget(title: "OpenClaw", value: "Mock", status: .standby, detail: "audit placeholder", systemImage: "shield.lefthalf.filled"),
            IntelligenceWidget(title: "Codex", value: "Mock", status: .standby, detail: "queue only", systemImage: "terminal")
        ]
    }

    private var agentCards: [AgentConsoleCard] {
        [
            AgentConsoleCard(role: .commander, status: .green, missionQueue: commands.count, recentActivity: "Routing local commands and readiness checks.", pendingCommands: commands.filter { $0.status == RemoteCommandStatus.queued.rawValue }.count),
            AgentConsoleCard(role: .architect, status: .standby, missionQueue: 2, recentActivity: "System diagrams and future bridge plans staged.", pendingCommands: 1),
            AgentConsoleCard(role: .engineer, status: .green, missionQueue: runningMissions.count, recentActivity: "Local build verification path ready.", pendingCommands: 0),
            AgentConsoleCard(role: .research, status: .standby, missionQueue: vaultEntries.count, recentActivity: "Black Vault memory available locally.", pendingCommands: 1),
            AgentConsoleCard(role: .music, status: .green, missionQueue: musicNotes.count, recentActivity: "Music notes and release plans ready.", pendingCommands: 1),
            AgentConsoleCard(role: .operations, status: .amber, missionQueue: missions.count, recentActivity: "Mission Center tracking local work.", pendingCommands: runningMissions.count),
            AgentConsoleCard(role: .security, status: .green, missionQueue: 1, recentActivity: "No secrets, no production calls detected.", pendingCommands: 0)
        ]
    }

    private struct TimelineDisplayEvent: Identifiable {
        let id = UUID()
        let title: String
        let detail: String
        let date: Date
        let status: SystemStatus
    }

    private var combinedTimeline: [TimelineDisplayEvent] {
        let commandItems = commands.map {
            TimelineDisplayEvent(title: $0.title, detail: $0.resultSummary.isEmpty ? $0.body : $0.resultSummary, date: $0.createdAt, status: .standby)
        }
        let eventItems = timelineEvents.map {
            TimelineDisplayEvent(title: $0.title, detail: "\($0.category): \($0.detail)", date: $0.createdAt, status: .green)
        }
        let missionItems = missions.map {
            TimelineDisplayEvent(title: $0.title, detail: "\($0.priority) | \($0.status)", date: $0.createdAt, status: $0.isComplete ? .green : .amber)
        }
        let noteItems = musicNotes.map {
            TimelineDisplayEvent(title: $0.title, detail: "Music: \($0.category)", date: $0.createdAt, status: .standby)
        }
        return (commandItems + eventItems + missionItems + noteItems).sorted { $0.date > $1.date }
    }

    @ViewBuilder
    private func missionBucket(title: String, missions: [SavedMission]) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.subheadline.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            if missions.isEmpty {
                Text("No \(title.lowercased()) yet.")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.58))
            } else {
                ForEach(missions.prefix(4)) { mission in
                    HStack {
                        Image(systemName: mission.isComplete ? "checkmark.circle.fill" : "circle.dashed")
                            .foregroundStyle(mission.isComplete ? themeManager.theme.success : themeManager.theme.heading)
                        VStack(alignment: .leading, spacing: 2) {
                            Text(mission.title)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(themeManager.theme.text)
                            Text("\(mission.priority) | \(mission.status)")
                                .font(.caption2)
                                .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        }
                        Spacer()
                    }
                }
            }
        }
        .padding(.vertical, 6)
    }

    private func integrationFlag(_ title: String, enabled: Bool) -> some View {
        HStack {
            Label(title, systemImage: enabled ? "checkmark.circle.fill" : "lock.slash")
            Spacer()
            Text(enabled ? "Enabled" : "Disabled")
        }
        .font(.subheadline.weight(.semibold))
        .foregroundStyle(enabled ? themeManager.theme.success : themeManager.theme.text.opacity(0.70))
    }

    private func createMission() {
        let cleanTitle = newMissionTitle.trimmingCharacters(in: .whitespacesAndNewlines)
        let title = cleanTitle.isEmpty ? "Untitled Intelligence Mission" : cleanTitle
        modelContext.insert(SavedMission(
            title: title,
            status: RemoteCommandStatus.queued.label,
            priority: selectedPriority.rawValue,
            scheduledFor: .now,
            checklistText: "Created from Intelligence Core."
        ))
        modelContext.insert(CommandTimelineEvent(title: title, detail: "Mission created locally.", category: "Mission Execution"))
        newMissionTitle = ""
        Haptics.success()
    }

    private func createNotification(_ kind: LocalNotificationKind) {
        modelContext.insert(LocalNotificationRecord(
            title: kind.rawValue,
            body: "Local notification staged in Intelligence Core.",
            kind: kind.rawValue
        ))
        modelContext.insert(CommandTimelineEvent(title: kind.rawValue, detail: "Local notification created.", category: "Notification"))
        Haptics.success()
    }

    private func icon(for role: AgentRole) -> String {
        switch role {
        case .commander: "scope"
        case .architect: "ruler"
        case .engineer: "hammer"
        case .research: "magnifyingglass"
        case .music: "music.mic"
        case .operations: "checklist"
        case .security: "lock.shield"
        }
    }

    private func notificationIcon(for kind: LocalNotificationKind) -> String {
        switch kind {
        case .missionComplete: "checkmark.seal.fill"
        case .reminder: "bell.fill"
        case .buildFinished: "hammer.circle.fill"
        case .dailyBrief: "sunrise.fill"
        case .securityAlert: "exclamationmark.shield.fill"
        }
    }
}

private struct MacCoreBridgeView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @AppStorage("macCoreBridgeEnabled") private var bridgeEnabled = false
    @AppStorage("productionIntegrationsEnabled") private var productionIntegrationsEnabled = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Mac Core Bridge", subtitle: "Disabled local placeholder for laptop-side execution when you are away from the desk.")

                CommandCard(title: "Bridge Safety", systemImage: "lock.shield.fill") {
                    StatusPill(title: bridgeEnabled ? "Enabled" : "Disabled", status: bridgeEnabled ? .amber : .standby)
                    Label("No public tunnel is configured.", systemImage: "network.slash")
                    Label("No LAN bridge is active.", systemImage: "wifi.slash")
                    Label("No secrets or production credentials are stored on device.", systemImage: "key.slash")
                    Label("Future Face ID confirmation required before remote execution.", systemImage: "faceid")
                }
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.76))

                LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                    MetricCard(title: "Mac Core", value: "Offline", context: "Bridge disabled")
                    MetricCard(title: "Last Sync", value: "Never", context: "Local placeholder")
                    MetricCard(title: "Queued Missions", value: "Local", context: "Stored on iPhone")
                    MetricCard(title: "Public Tunnel", value: "Off", context: "No endpoint")
                    MetricCard(title: "Local LAN", value: "Off", context: "No listener")
                    MetricCard(title: "Feature Flag", value: productionIntegrationsEnabled ? "On" : "Off", context: "Production blocked")
                }

                CommandCard(title: "Future Connection Plan", systemImage: "point.3.connected.trianglepath.dotted") {
                    TimelineRow(title: "Local Queue", detail: "Commands are stored on device first.", status: .green)
                    TimelineRow(title: "Manual Review", detail: "Founder approves before bridge execution.", status: .standby)
                    TimelineRow(title: "Mac Core", detail: "Laptop agent receives queued missions later.", status: .standby)
                    TimelineRow(title: "Production", detail: "Requires explicit feature flag and secret review.", status: .red)
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Mac Bridge")
    }
}

private struct ModuleTile: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let route: AppRoute

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Image(systemName: route.symbol)
                .font(.title2)
                .foregroundStyle(themeManager.theme.accent)
            Text(route.title)
                .font(.headline)
                .foregroundStyle(themeManager.theme.text)
            Text("Open \(route.title) command surface")
                .font(.caption)
                .foregroundStyle(themeManager.theme.text.opacity(0.62))
        }
        .frame(maxWidth: .infinity, minHeight: 130, alignment: .topLeading)
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}
