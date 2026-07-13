import Foundation

struct MockArchaiosBackendService: ArchaiosBackendService {
    func fetchCommanderBrief() async throws -> CommanderBrief {
        CommanderBrief(
            readinessScore: 61,
            recommendation: "NO-GO until external infrastructure is verified.",
            summary: "Engineering foundation is stable. Remaining launch blockers are Cloudflare identity, Supabase DNS, Stripe live verification, and GitHub heartbeat.",
            topActions: [
                "Restore Cloudflare access and verify Worker identity.",
                "Confirm production Supabase project ref.",
                "Verify Stripe live products, prices, and webhook."
            ]
        )
    }

    func fetchAgents() async throws -> [AgentCard] {
        [
            AgentCard(name: "Commander", mission: "Executive orchestration", status: .green, queueDepth: 3),
            AgentCard(name: "Researcher", mission: "Evidence collection", status: .standby, queueDepth: 1),
            AgentCard(name: "Security", mission: "Risk and Sentinel review", status: .amber, queueDepth: 2),
            AgentCard(name: "Engineer", mission: "Build verification", status: .green, queueDepth: 0)
        ]
    }

    func fetchVaultItems() async throws -> [VaultItem] {
        [
            VaultItem(title: "Founder Handbook", category: "Founder Vault", tags: ["doctrine", "rhythm", "decisions"], summary: "Operating doctrine, decision rights, and founder rhythm.", body: "The founder role is to set intent, approve high-risk actions, protect the mission, and preserve creative command. ARCHAIOS should reduce operational drag, not create it.", importance: 10, updatedAt: .now),
            VaultItem(title: "Architecture Guide", category: "Engineering", tags: ["architecture", "systems", "handoff"], summary: "System layers, dependencies, and production boundaries.", body: "ARCHAIOS is a modular operating system composed of SwiftUI clients, web dashboards, Cloudflare Workers, Supabase, Stripe, GitHub, and Commander-led readiness gates.", importance: 10, updatedAt: .now),
            VaultItem(title: "AI Assassins User Guide", category: "Product", tags: ["product", "agents", "customer"], summary: "Customer-facing workflows for command dashboards and agents.", body: "AI Assassins helps users review Commander briefs, inspect missions, capture knowledge, and coordinate agents without connecting production services in mock mode.", importance: 9, updatedAt: .now),
            VaultItem(title: "Security Manual", category: "Security", tags: ["security", "secrets", "audit"], summary: "Secret handling, incident response, and security checks.", body: "Never expose live keys. Do not print secrets. Production integrations require scoped credentials, signed events, audit logs, and rollback procedures.", importance: 10, updatedAt: .now),
            VaultItem(title: "Disaster Recovery", category: "Operations", tags: ["recovery", "rollback", "incident"], summary: "Rollback and recovery steps for Cloudflare, Supabase, Stripe, and Git.", body: "Stop deployment first. Capture timestamp, exact error, last known good state, and one recovery action. Change one platform at a time.", importance: 10, updatedAt: .now),
            VaultItem(title: "Product Vision", category: "Strategy", tags: ["vision", "roadmap", "founder"], summary: "Long-range ARCHAIOS product thesis and north star.", body: "ARCHAIOS should become the daily AI operating system for founders who need memory, intelligence, revenue awareness, and decisive execution.", importance: 9, updatedAt: .now),
            VaultItem(title: "Investor Summary", category: "Business", tags: ["investor", "business", "market"], summary: "Market, product, business model, and milestone overview.", body: "ARCHAIOS sits at the intersection of AI productivity, founder operating systems, knowledge management, DevOps readiness, and revenue operations.", importance: 8, updatedAt: .now)
        ]
    }

    func fetchOperations() async throws -> [OperationItem] {
        [
            OperationItem(title: "Iron Gate", owner: "Commander", status: .green, nextAction: "Complete. Preserve readiness evidence.", priority: "High", progress: 1.0, eta: "Complete"),
            OperationItem(title: "Skybridge", owner: "Infrastructure", status: .green, nextAction: "Complete. Use deployment map for operator approval.", priority: "High", progress: 1.0, eta: "Complete"),
            OperationItem(title: "Black Vault", owner: "Archivist", status: .green, nextAction: "Complete. Import documentation into Notion when ready.", priority: "Medium", progress: 1.0, eta: "Complete"),
            OperationItem(title: "External Keys", owner: "Operator", status: .amber, nextAction: "Active. Confirm Cloudflare, Supabase, Stripe, and GitHub access.", priority: "Critical", progress: 0.42, eta: "4-8 hrs"),
            OperationItem(title: "Launch", owner: "Founder", status: .standby, nextAction: "Pending. Wait for readiness score above 90.", priority: "Critical", progress: 0.12, eta: "After External Keys")
        ]
    }

    func fetchInfrastructureSignals() async throws -> [InfrastructureSignal] {
        [
            InfrastructureSignal(system: "GitHub", status: .amber, evidence: "Heartbeat requires fresh run."),
            InfrastructureSignal(system: "Cloudflare", status: .red, evidence: "Worker identity requires correction."),
            InfrastructureSignal(system: "Supabase", status: .red, evidence: "Configured project ref needs verification."),
            InfrastructureSignal(system: "Stripe", status: .amber, evidence: "Live account not connected yet."),
            InfrastructureSignal(system: "Vercel", status: .green, evidence: "Latest observed deployment READY."),
            InfrastructureSignal(system: "OpenAI", status: .standby, evidence: "Protocol ready. Production key not connected.")
        ]
    }

    func fetchFounderMetrics() async throws -> [FounderMetric] {
        [
            FounderMetric(title: "Saint Black Journal", value: "Open", context: "Capture daily field notes and lessons."),
            FounderMetric(title: "Music Projects", value: "Active", context: "Protect creative execution blocks."),
            FounderMetric(title: "Spymaster Album", value: "Writing", context: "Track sequencing, visuals, and campaign."),
            FounderMetric(title: "Jugg 'Em Single", value: "Priority", context: "Single rollout and content queue."),
            FounderMetric(title: "LinkedIn Growth", value: "Build", context: "Founder authority and distribution."),
            FounderMetric(title: "Business Goals", value: "Launch", context: "First paying customer and readiness above 90."),
            FounderMetric(title: "Dream Archive", value: "Vault", context: "Preserve visions, symbols, and creative intelligence.")
        ]
    }

    func fetchSettings() async throws -> [SettingsOption] {
        [
            SettingsOption(title: "Mock Services", detail: "Production APIs are not connected.", enabled: true),
            SettingsOption(title: "SwiftData", detail: "Local persistence enabled.", enabled: true),
            SettingsOption(title: "Commander Briefs", detail: "Daily executive report surface.", enabled: true),
            SettingsOption(title: "Live Billing", detail: "Stripe protocol pending production connection.", enabled: false)
        ]
    }

    func verifyAuthHealth() async throws -> SystemStatus { .red }
    func fetchRevenueStatus() async throws -> SystemStatus { .amber }
    func verifyWorkerIdentity() async throws -> SystemStatus { .red }
    func verifyModelAccess() async throws -> SystemStatus { .standby }
    func fetchWorkflowStatus() async throws -> SystemStatus { .amber }

    var isOpenAIEnabled: Bool { false }
    var isCodexBridgeEnabled: Bool { false }
    var isOpenClawBridgeEnabled: Bool { false }
    var isGitHubBridgeEnabled: Bool { false }
    var isNotionBridgeEnabled: Bool { false }
    var isSupabaseBridgeEnabled: Bool { false }
    var isCloudflareBridgeEnabled: Bool { false }
    var isAppleShortcutsBridgeEnabled: Bool { false }
    var isLocalLLMEnabled: Bool { false }

    func classifyCommand(_ text: String) -> CommandTargetSystem {
        let lowercased = text.lowercased()
        if lowercased.contains("openclaw") || lowercased.contains("audit") {
            return .openClaw
        }
        if lowercased.contains("github") || lowercased.contains("checkpoint") || lowercased.contains("commit") {
            return .github
        }
        if lowercased.contains("notion") || lowercased.contains("vault") || lowercased.contains("document") {
            return .blackVault
        }
        if lowercased.contains("music") || lowercased.contains("song") || lowercased.contains("lyric") || lowercased.contains("release") {
            return .musicCommand
        }
        if lowercased.contains("daily") || lowercased.contains("morning") || lowercased.contains("evening") || lowercased.contains("blocker") {
            return .dailyOS
        }
        return .codex
    }

    func offlineResponse(for text: String, target: CommandTargetSystem) -> String {
        "Offline mock route: \(target.rawValue). Command saved locally with no network call, no secrets, and no laptop bridge execution."
    }

    func missionTemplates() -> [MissionTemplate] {
        [
            MissionTemplate(title: "Codex build sprint", target: .codex, priority: .high, prompt: "Plan and execute a local build sprint. Include scope, files to inspect, risks, verification, and report."),
            MissionTemplate(title: "OpenClaw audit", target: .openClaw, priority: .high, prompt: "Run an OpenClaw-style audit locally. Identify gaps, blockers, and next corrective actions."),
            MissionTemplate(title: "GitHub checkpoint", target: .github, priority: .normal, prompt: "Prepare a GitHub checkpoint summary. Do not commit or push. List changed files, tests, and risks."),
            MissionTemplate(title: "Notion Black Vault update", target: .blackVault, priority: .normal, prompt: "Draft a Black Vault update from this command. Preserve source, summary, tags, and follow-ups."),
            MissionTemplate(title: "Music release plan", target: .musicCommand, priority: .high, prompt: "Create a music release plan with song idea, lyric angle, visuals, content, and release tasks."),
            MissionTemplate(title: "Daily Commander brief", target: .dailyOS, priority: .normal, prompt: "Create a daily brief: today's mission, blockers, energy level, top 3 tasks, and handoff summary."),
            MissionTemplate(title: "Production readiness gate", target: .codex, priority: .critical, prompt: "Run a production readiness gate in mock mode. Check secrets, build, auth, billing, health, rollback, and launch blockers.")
        ]
    }
}
