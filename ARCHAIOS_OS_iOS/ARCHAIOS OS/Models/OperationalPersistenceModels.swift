// Sprint 18 local persistence models for mission lifecycle, exports, daily briefs, and integrity checks.
import Foundation
import SwiftData

enum OperationalMissionState: String, CaseIterable, Identifiable {
    case planned = "Planned"
    case active = "Active"
    case paused = "Paused"
    case blocked = "Blocked"
    case completed = "Completed"
    case archived = "Archived"

    var id: String { rawValue }
}

enum LocalExportKind: String, CaseIterable, Identifiable {
    case missionReport = "Mission Report"
    case dailyBrief = "Daily Brief"
    case journalEntry = "Journal Entry"
    case sprintReport = "Sprint Report"
    case blackVaultNote = "Black Vault Note"

    var id: String { rawValue }
}

@Model
final class OperationalMissionRecord {
    var id: UUID
    var title: String
    var state: String
    var sprint: String
    var currentObjective: String
    var nextAction: String
    var blockers: String
    var relatedNotes: String
    var recentActivity: String
    var priority: String
    var createdAt: Date
    var updatedAt: Date
    var completedAt: Date?
    var archivedAt: Date?

    init(
        id: UUID = UUID(),
        title: String,
        state: String = OperationalMissionState.planned.rawValue,
        sprint: String = "Sprint 18",
        currentObjective: String = "",
        nextAction: String = "",
        blockers: String = "",
        relatedNotes: String = "",
        recentActivity: String = "",
        priority: String = CommandPriority.normal.rawValue,
        createdAt: Date = .now,
        updatedAt: Date = .now,
        completedAt: Date? = nil,
        archivedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.state = state
        self.sprint = sprint
        self.currentObjective = currentObjective
        self.nextAction = nextAction
        self.blockers = blockers
        self.relatedNotes = relatedNotes
        self.recentActivity = recentActivity
        self.priority = priority
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.completedAt = completedAt
        self.archivedAt = archivedAt
    }
}

@Model
final class LocalMarkdownExportRecord {
    var id: UUID
    var title: String
    var kind: String
    var markdown: String
    var fileName: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        kind: String,
        markdown: String,
        fileName: String,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.kind = kind
        self.markdown = markdown
        self.fileName = fileName
        self.createdAt = createdAt
    }
}

@Model
final class DailyOperationalBriefRecord {
    var id: UUID
    var title: String
    var summary: String
    var activeMissions: String
    var pausedMissions: String
    var commanderNotes: String
    var recentResearch: String
    var recentMusicWork: String
    var recentEngineeringWork: String
    var systemHealth: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        summary: String,
        activeMissions: String,
        pausedMissions: String,
        commanderNotes: String,
        recentResearch: String,
        recentMusicWork: String,
        recentEngineeringWork: String,
        systemHealth: String,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.summary = summary
        self.activeMissions = activeMissions
        self.pausedMissions = pausedMissions
        self.commanderNotes = commanderNotes
        self.recentResearch = recentResearch
        self.recentMusicWork = recentMusicWork
        self.recentEngineeringWork = recentEngineeringWork
        self.systemHealth = systemHealth
        self.createdAt = createdAt
    }
}
