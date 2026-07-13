import Foundation

@MainActor
final class AICommanderChatViewModel: ObservableObject {
    @Published var inputText = ""
    @Published var selectedPriority: CommandPriority = .normal
    @Published private(set) var routedTarget: CommandTargetSystem = .codex
    @Published private(set) var lastResponse = "No command routed yet."
    @Published private(set) var savedPrompts: [String] = [
        "Draft a mission plan for External Keys.",
        "Summarize today's Founder priorities.",
        "Create a release checklist for Jugg Em.",
        "Review Black Vault docs for launch blockers."
    ]
    @Published private(set) var missionTemplates: [MissionTemplate]
    @Published private(set) var messages: [ChatMessage] = [
        ChatMessage(author: "Commander", text: "Daily SITREP ready. ARCHAIOS is in tactical hold until External Keys clears Cloudflare, Supabase, Stripe, and GitHub heartbeat.", isCommander: true, timestamp: .now),
        ChatMessage(author: "Saint Black", text: "Keep the mission tight. No production API connections yet.", isCommander: false, timestamp: .now),
        ChatMessage(author: "Commander", text: "Acknowledged. Mock mode is active. iOS shell is ready for tap-through validation.", isCommander: true, timestamp: .now)
    ]

    private let router: CommandRouting

    init(router: CommandRouting = MockArchaiosBackendService()) {
        self.router = router
        self.missionTemplates = router.missionTemplates()
    }

    @discardableResult
    func send() -> RemoteCommand? {
        let trimmed = inputText.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }
        routedTarget = router.classifyCommand(trimmed)
        let response = router.offlineResponse(for: trimmed, target: routedTarget)
        lastResponse = response
        messages.append(ChatMessage(author: "Saint Black", text: trimmed, isCommander: false, timestamp: .now))
        messages.append(ChatMessage(author: "Commander", text: response, isCommander: true, timestamp: .now))
        inputText = ""
        return RemoteCommand(
            title: makeTitle(from: trimmed),
            body: trimmed,
            priority: selectedPriority.rawValue,
            targetSystem: routedTarget.rawValue,
            status: RemoteCommandStatus.queued.rawValue,
            resultSummary: response
        )
    }

    @discardableResult
    func quickAction(_ title: String) -> RemoteCommand? {
        inputText = title
        return send()
    }

    func applyTemplate(_ template: MissionTemplate) {
        selectedPriority = template.priority
        inputText = template.prompt
        routedTarget = template.target
    }

    private func makeTitle(from body: String) -> String {
        let firstLine = body.components(separatedBy: .newlines).first ?? body
        let trimmed = firstLine.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.count <= 48 { return trimmed.isEmpty ? "Untitled Command" : trimmed }
        return String(trimmed.prefix(45)) + "..."
    }
}
