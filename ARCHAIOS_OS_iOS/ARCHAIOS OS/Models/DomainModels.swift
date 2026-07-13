import Foundation

enum SystemStatus: String, CaseIterable, Identifiable {
    case green
    case amber
    case red
    case standby

    var id: String { rawValue }

    var label: String {
        switch self {
        case .green: "Online"
        case .amber: "Warning"
        case .red: "Blocked"
        case .standby: "Pending"
        }
    }
}

struct CommanderBrief: Identifiable {
    let id = UUID()
    let readinessScore: Int
    let recommendation: String
    let summary: String
    let topActions: [String]
}

struct AgentCard: Identifiable {
    let id = UUID()
    let name: String
    let mission: String
    let status: SystemStatus
    let queueDepth: Int
}

struct VaultItem: Identifiable {
    let id = UUID()
    let title: String
    let category: String
    let tags: [String]
    let summary: String
    let body: String
    let importance: Int
    let updatedAt: Date
}

struct OperationItem: Identifiable {
    let id = UUID()
    let title: String
    let owner: String
    let status: SystemStatus
    let nextAction: String
    let priority: String
    let progress: Double
    let eta: String
}

struct InfrastructureSignal: Identifiable {
    let id = UUID()
    let system: String
    let status: SystemStatus
    let evidence: String
}

struct FounderMetric: Identifiable {
    let id = UUID()
    let title: String
    let value: String
    let context: String
}

struct SettingsOption: Identifiable {
    let id = UUID()
    let title: String
    let detail: String
    let enabled: Bool
}

struct ChatMessage: Identifiable {
    let id = UUID()
    let author: String
    let text: String
    let isCommander: Bool
    let timestamp: Date
}

enum CommandTargetSystem: String, CaseIterable, Identifiable {
    case codex = "Codex"
    case openClaw = "OpenClaw"
    case github = "GitHub"
    case blackVault = "Notion / Black Vault"
    case musicCommand = "Music Command"
    case dailyOS = "Daily OS"

    var id: String { rawValue }
}

enum RemoteCommandStatus: String, CaseIterable, Identifiable {
    case draft
    case queued
    case running
    case blocked
    case complete

    var id: String { rawValue }

    var label: String {
        switch self {
        case .draft: "Draft"
        case .queued: "Queued"
        case .running: "Running"
        case .blocked: "Blocked"
        case .complete: "Complete"
        }
    }
}

enum CommandPriority: String, CaseIterable, Identifiable {
    case low = "Low"
    case normal = "Normal"
    case high = "High"
    case critical = "Critical"

    var id: String { rawValue }
}

struct MissionTemplate: Identifiable {
    let id = UUID()
    let title: String
    let target: CommandTargetSystem
    let priority: CommandPriority
    let prompt: String
}

enum AgentRole: String, CaseIterable, Identifiable {
    case commander = "Commander"
    case architect = "Architect"
    case engineer = "Engineer"
    case research = "Research"
    case music = "Music"
    case operations = "Operations"
    case security = "Security"

    var id: String { rawValue }
}

struct AgentConsoleCard: Identifiable {
    let id = UUID()
    let role: AgentRole
    let status: SystemStatus
    let missionQueue: Int
    let recentActivity: String
    let pendingCommands: Int
}

enum LocalNotificationKind: String, CaseIterable, Identifiable {
    case missionComplete = "Mission Complete"
    case reminder = "Reminder"
    case buildFinished = "Build Finished"
    case dailyBrief = "Daily Brief"
    case securityAlert = "Security Alert"

    var id: String { rawValue }
}

struct IntelligenceWidget: Identifiable {
    let id = UUID()
    let title: String
    let value: String
    let status: SystemStatus
    let detail: String
    let systemImage: String
}

struct DailyCommandBrief: Identifiable {
    let id = UUID()
    let title: String
    let summary: String
    let status: SystemStatus
    let actions: [String]
}

struct DailyObjective: Identifiable {
    let id = UUID()
    let title: String
    let priority: String
    let isComplete: Bool
}

struct ScheduledMissionCard: Identifiable {
    let id = UUID()
    let title: String
    let trigger: String
    let status: SystemStatus
    let checklist: [String]
}

struct MusicProjectTracker: Identifiable {
    let id = UUID()
    let title: String
    let phase: String
    let progress: Double
    let nextAction: String
    let releaseWindow: String
}

struct MusicAlbumPlan: Identifiable {
    let id = UUID()
    let title: String
    let status: String
    let focus: String
    let trackIdeas: [String]
}
