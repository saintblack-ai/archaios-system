import SwiftData
import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct AICommanderChatView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \RemoteCommand.createdAt, order: .reverse) private var commandQueue: [RemoteCommand]
    @Query(sort: \Conversation.updatedAt, order: .reverse) private var conversations: [Conversation]
    @StateObject var viewModel: AICommanderChatViewModel
    @State private var conversationSearch = ""
    @State private var conversationTitle = "Commander Chat"
    @State private var conversationFolder = "Founder"
    @State private var conversationPinned = false
    @State private var conversationFavorite = false
    @State private var isStreaming = false
    @State private var streamingText = ""

    var body: some View {
        VStack(spacing: 0) {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    SectionHeader(title: "AI Commander 2.0", subtitle: "Premium local command console with mock streaming, markdown, folders, pins, favorites, and offline routing.")
                    securityBanner
                    conversationControls
                    quickActions
                    savedPrompts
                    missionTemplates
                    missionTools
                    memoryPlaceholder
                    commandQueueView
                    ForEach(viewModel.messages) { message in
                        chatBubble(message)
                    }
                    if isStreaming {
                        streamingBubble
                    }
                }
                .padding()
            }

            Divider()
                .overlay(themeManager.theme.heading.opacity(0.35))

            composer
                .padding()
                .background(themeManager.theme.panel)
        }
        .background(themeManager.theme.background)
        .navigationTitle("AI Commander")
    }

    private var conversationControls: some View {
        CommandCard(title: "Conversation Console", systemImage: "rectangle.stack.badge.person.crop") {
            TextField("Search conversations", text: $conversationSearch)
                .textFieldStyle(.plain)
                .padding(10)
                .foregroundStyle(themeManager.theme.text)
                .background(themeManager.theme.elevatedPanel)
                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            HStack {
                TextField("Rename conversation", text: $conversationTitle)
                    .textFieldStyle(.plain)
                    .padding(10)
                    .foregroundStyle(themeManager.theme.text)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                TextField("Folder", text: $conversationFolder)
                    .textFieldStyle(.plain)
                    .padding(10)
                    .foregroundStyle(themeManager.theme.text)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
            }
            HStack {
                Toggle("Pin", isOn: $conversationPinned)
                Toggle("Favorite", isOn: $conversationFavorite)
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(themeManager.theme.text.opacity(0.76))

            let filtered = conversations.filter {
                conversationSearch.isEmpty ||
                    $0.title.localizedCaseInsensitiveContains(conversationSearch) ||
                    $0.folder.localizedCaseInsensitiveContains(conversationSearch) ||
                    $0.messagesText.localizedCaseInsensitiveContains(conversationSearch)
            }
            ForEach(filtered.prefix(4)) { conversation in
                HStack {
                    Image(systemName: conversation.isPinned ? "pin.fill" : "bubble.left.and.bubble.right")
                        .foregroundStyle(themeManager.theme.heading)
                    VStack(alignment: .leading, spacing: 2) {
                        Text(conversation.title)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(themeManager.theme.text)
                        Text("\(conversation.folder) | \(conversation.updatedAt.formatted(date: .abbreviated, time: .shortened))")
                            .font(.caption2)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                    }
                    Spacer()
                    Image(systemName: conversation.isFavorite ? "star.fill" : "star")
                        .foregroundStyle(themeManager.theme.heading)
                }
            }
        }
    }

    private var quickActions: some View {
        VStack(spacing: 10) {
            CommanderButton(title: "Daily SITREP", systemImage: "sunrise") {
                save(viewModel.quickAction("Daily SITREP"))
            }
            CommanderButton(title: "Plan Mission", systemImage: "map") {
                save(viewModel.quickAction("Plan Mission"))
            }
            CommanderButton(title: "Review Readiness", systemImage: "gauge.with.dots.needle.67percent") {
                save(viewModel.quickAction("Review Readiness"))
            }
        }
    }

    private var securityBanner: some View {
        CommandCard(title: "Local-Only Security", systemImage: "lock.shield.fill") {
            HStack {
                StatusPill(title: "Mock Mode", status: .standby)
                StatusPill(title: "No Secrets", status: .green)
                StatusPill(title: "Bridge Disabled", status: .amber)
            }
            Label("Production integrations are feature-flagged off by default.", systemImage: "switch.2")
            Label("No API keys or credentials are stored in this mobile shell.", systemImage: "key.slash")
            Label("Future Face ID gate placeholder: local unlock before remote execution.", systemImage: "faceid")
        }
        .font(.subheadline)
        .foregroundStyle(themeManager.theme.text.opacity(0.76))
    }

    private var missionTools: some View {
        CommandCard(title: "Mission Planner", systemImage: "map.fill") {
            VStack(alignment: .leading, spacing: 8) {
                Label("Checklist generator ready", systemImage: "checklist.checked")
                Label("Mission archive: Iron Gate, Skybridge, Black Vault", systemImage: "archivebox")
                Label("Current mission: External Keys", systemImage: "key.horizontal.fill")
                Label("Command router: \(viewModel.routedTarget.rawValue)", systemImage: "arrow.triangle.branch")
            }
            .font(.subheadline)
            .foregroundStyle(themeManager.theme.text.opacity(0.78))
        }
    }

    private var savedPrompts: some View {
        CommandCard(title: "Saved Prompts", systemImage: "text.book.closed.fill") {
            ForEach(viewModel.savedPrompts, id: \.self) { prompt in
                Button {
                    save(viewModel.quickAction(prompt))
                } label: {
                    Label(prompt, systemImage: "sparkle.magnifyingglass")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(themeManager.theme.heading)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var missionTemplates: some View {
        CommandCard(title: "Mission Templates", systemImage: "square.stack.3d.up.fill") {
            ForEach(viewModel.missionTemplates) { template in
                Button {
                    viewModel.applyTemplate(template)
                    Haptics.selection()
                } label: {
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: icon(for: template.target))
                            .foregroundStyle(themeManager.theme.heading)
                            .frame(width: 22)
                        VStack(alignment: .leading, spacing: 3) {
                            Text(template.title)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(themeManager.theme.text)
                            Text("\(template.target.rawValue) | \(template.priority.rawValue)")
                                .font(.caption)
                                .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        }
                        Spacer()
                    }
                    .padding(.vertical, 4)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var memoryPlaceholder: some View {
        CommandCard(title: "Memory + Offline Mode", systemImage: "memorychip") {
            Label("Conversation history is retained in this local session.", systemImage: "clock.arrow.circlepath")
            Label("Long-term memory placeholder is offline only.", systemImage: "externaldrive.badge.person.crop")
            Label("Responses are mock Commander guidance with no production API calls.", systemImage: "wifi.slash")
        }
        .font(.subheadline)
            .foregroundStyle(themeManager.theme.text.opacity(0.76))
    }

    private var commandQueueView: some View {
        CommandCard(title: "Remote Command Queue", systemImage: "tray.full.fill") {
            if commandQueue.isEmpty {
                EmptyStateView(title: "No queued commands", detail: "Send a command to stage it locally for the future Mac Core Bridge.", systemImage: "paperplane")
            } else {
                ForEach(commandQueue.prefix(6)) { command in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(command.title)
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(themeManager.theme.text)
                            Spacer()
                            Text(command.status.capitalized)
                                .font(.caption.weight(.bold))
                                .foregroundStyle(themeManager.theme.heading)
                        }
                        Text("\(command.targetSystem) | \(command.priority)")
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        Text(command.resultSummary)
                            .font(.caption)
                            .foregroundStyle(themeManager.theme.text.opacity(0.70))
                        integrationActions(for: command)
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }

    private func chatBubble(_ message: ChatMessage) -> some View {
        HStack {
            if !message.isCommander { Spacer(minLength: 40) }

            VStack(alignment: .leading, spacing: 6) {
                Text(message.author)
                    .font(.caption.weight(.bold))
                    .foregroundStyle(message.isCommander ? themeManager.theme.heading : themeManager.theme.success)
                markdownMessage(message.text)
                HStack(spacing: 12) {
                    Button {
                        copy(message.text)
                    } label: {
                        Label("Copy", systemImage: "doc.on.doc")
                    }
                    Button {
                        viewModel.inputText = message.text
                        Haptics.selection()
                    } label: {
                        Label("Edit", systemImage: "pencil")
                    }
                    ShareLink(item: message.text) {
                        Label("Share", systemImage: "square.and.arrow.up")
                    }
                }
                .font(.caption.weight(.semibold))
                .foregroundStyle(themeManager.theme.heading)
            }
            .padding()
            .background(message.isCommander ? themeManager.theme.elevatedPanel : themeManager.theme.success.opacity(0.18))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))

            if message.isCommander { Spacer(minLength: 40) }
        }
    }

    private var streamingBubble: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Label("Commander streaming mock response", systemImage: "waveform")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
                Text(streamingText.isEmpty ? "Preparing local response..." : streamingText)
                    .font(.subheadline)
                    .foregroundStyle(themeManager.theme.text)
                ProgressView()
                    .tint(themeManager.theme.heading)
            }
            .padding()
            .background(themeManager.theme.elevatedPanel)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            Spacer(minLength: 40)
        }
    }

    @ViewBuilder
    private func markdownMessage(_ text: String) -> some View {
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
                            .background(Color.black.opacity(0.35))
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
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text)
        } else {
            Text(text)
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text)
        }
    }

    private var composer: some View {
        VStack(spacing: 10) {
            Picker("Priority", selection: $viewModel.selectedPriority) {
                ForEach(CommandPriority.allCases) { priority in
                    Text(priority.rawValue).tag(priority)
                }
            }
            .pickerStyle(.segmented)

            HStack(spacing: 10) {
                TextField("Route a command", text: $viewModel.inputText, axis: .vertical)
                    .textFieldStyle(.plain)
                    .padding(12)
                    .foregroundStyle(themeManager.theme.text)
                    .background(themeManager.theme.elevatedPanel)
                    .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))

                Button {
                    save(viewModel.send())
                } label: {
                    Image(systemName: "paperplane.fill")
                        .font(.headline)
                        .foregroundStyle(.black)
                        .frame(width: 44, height: 44)
                        .background(themeManager.theme.heading)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }
        }
    }

    @ViewBuilder
    private func integrationActions(for command: RemoteCommand) -> some View {
        HStack {
            Button("Vault") { saveToVault(command) }
            Button("Music") { saveToMusic(command) }
            Button("Daily") { saveToDaily(command) }
        }
        .font(.caption.weight(.bold))
        .foregroundStyle(themeManager.theme.heading)
    }

    private func save(_ command: RemoteCommand?) {
        guard let command else { return }
        modelContext.insert(command)
        modelContext.insert(ConversationMemory(
            title: command.title,
            prompt: command.body,
            response: command.resultSummary,
            tagsText: "\(command.targetSystem), \(command.priority)"
        ))
        modelContext.insert(Conversation(
            title: conversationTitle.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? command.title : conversationTitle,
            folder: conversationFolder.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? "Founder" : conversationFolder,
            messagesText: "Prompt:\n\(command.body)\n\nResponse:\n\(command.resultSummary)\n\n```swift\n// Mock command route: \(command.targetSystem)\n```",
            isPinned: conversationPinned,
            isFavorite: conversationFavorite
        ))
        modelContext.insert(CommandTimelineEvent(
            title: command.title,
            detail: command.resultSummary,
            category: "Command"
        ))
        startStreaming(command.resultSummary)
        Haptics.success()
    }

    private func startStreaming(_ response: String) {
        isStreaming = true
        streamingText = ""
        Task {
            let words = response.split(separator: " ")
            for word in words.prefix(18) {
                try? await Task.sleep(nanoseconds: 65_000_000)
                await MainActor.run {
                    streamingText += streamingText.isEmpty ? String(word) : " \(word)"
                }
            }
            try? await Task.sleep(nanoseconds: 350_000_000)
            await MainActor.run {
                withAnimation(.easeInOut(duration: 0.25)) {
                    isStreaming = false
                }
            }
        }
    }

    private func saveToVault(_ command: RemoteCommand) {
        modelContext.insert(VaultEntry(
            title: command.title,
            category: "AI Commander",
            tagLine: "\(command.targetSystem), \(command.priority), local-only",
            importance: command.priority == CommandPriority.critical.rawValue ? 10 : 8
        ))
        modelContext.insert(CommandTimelineEvent(
            title: "Saved to Black Vault",
            detail: command.title,
            category: "Saved Note"
        ))
        Haptics.success()
    }

    private func saveToMusic(_ command: RemoteCommand) {
        let category: String
        if command.body.localizedCaseInsensitiveContains("lyric") {
            category = "Lyrics"
        } else if command.body.localizedCaseInsensitiveContains("visual") {
            category = "Visual Concept"
        } else if command.body.localizedCaseInsensitiveContains("release") {
            category = "Release Plan"
        } else {
            category = "Song Idea"
        }
        modelContext.insert(MusicProjectNote(
            project: "Saint Black",
            title: command.title,
            note: [command.body, command.resultSummary].joined(separator: "\n\n"),
            category: category,
            tagsText: "ai-commander, local"
        ))
        modelContext.insert(CommandTimelineEvent(
            title: "Saved to Music Command",
            detail: command.title,
            category: "Saved Note"
        ))
        Haptics.success()
    }

    private func saveToDaily(_ command: RemoteCommand) {
        modelContext.insert(SavedMission(
            title: command.title,
            status: RemoteCommandStatus.queued.label,
            priority: command.priority,
            scheduledFor: .now,
            checklistText: command.body
        ))
        modelContext.insert(CommandTimelineEvent(
            title: "Saved to Daily OS",
            detail: command.title,
            category: "Mission Execution"
        ))
        Haptics.success()
    }

    private func copy(_ text: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        #endif
        Haptics.selection()
    }

    private func icon(for target: CommandTargetSystem) -> String {
        switch target {
        case .codex: "terminal"
        case .openClaw: "shield.lefthalf.filled"
        case .github: "chevron.left.forwardslash.chevron.right"
        case .blackVault: "archivebox"
        case .musicCommand: "music.mic"
        case .dailyOS: "sunrise.fill"
        }
    }
}
