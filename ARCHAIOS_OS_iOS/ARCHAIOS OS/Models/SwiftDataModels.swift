import Foundation
import SwiftData

@Model
final class VaultEntry {
    var id: UUID
    var title: String
    var category: String
    var tagLine: String
    var importance: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        category: String,
        tagLine: String,
        importance: Int,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.tagLine = tagLine
        self.importance = importance
        self.createdAt = createdAt
    }
}

@Model
final class MissionRecord {
    var id: UUID
    var title: String
    var status: String
    var owner: String
    var state: String
    var priority: String
    var sortOrder: Int
    var historyText: String
    var createdAt: Date
    var updatedAt: Date
    var archivedAt: Date?

    init(
        id: UUID = UUID(),
        title: String,
        status: String,
        owner: String,
        state: String = MissionState.missionReady.rawValue,
        priority: String = CommandPriority.normal.rawValue,
        sortOrder: Int = 0,
        historyText: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now,
        archivedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.status = status
        self.owner = owner
        self.state = state
        self.priority = priority
        self.sortOrder = sortOrder
        self.historyText = historyText
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.archivedAt = archivedAt
    }
}

@Model
final class FounderJournalEntry {
    var id: UUID
    var title: String
    var body: String
    var category: String
    var mood: String
    var energy: String
    var tagsText: String
    var isFavorite: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        body: String,
        category: String,
        mood: String = "Focused",
        energy: String = "Steady",
        tagsText: String = "",
        isFavorite: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.category = category
        self.mood = mood
        self.energy = energy
        self.tagsText = tagsText
        self.isFavorite = isFavorite
        self.createdAt = createdAt
    }
}

@Model
final class MusicProjectNote {
    var id: UUID
    var project: String
    var title: String
    var note: String
    var category: String
    var tagsText: String
    var isFavorite: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        project: String,
        title: String,
        note: String,
        category: String,
        tagsText: String = "",
        isFavorite: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.project = project
        self.title = title
        self.note = note
        self.category = category
        self.tagsText = tagsText
        self.isFavorite = isFavorite
        self.createdAt = createdAt
    }
}

@Model
final class SavedMission {
    var id: UUID
    var title: String
    var status: String
    var priority: String
    var scheduledFor: Date
    var checklistText: String
    var isComplete: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        status: String,
        priority: String,
        scheduledFor: Date = .now,
        checklistText: String = "",
        isComplete: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.status = status
        self.priority = priority
        self.scheduledFor = scheduledFor
        self.checklistText = checklistText
        self.isComplete = isComplete
        self.createdAt = createdAt
    }
}

@Model
final class RemoteCommand {
    var id: UUID
    var title: String
    var body: String
    var priority: String
    var targetSystem: String
    var status: String
    var resultSummary: String
    var createdAt: Date
    var updatedAt: Date
    var completedAt: Date?

    init(
        id: UUID = UUID(),
        title: String,
        body: String,
        priority: String = CommandPriority.normal.rawValue,
        targetSystem: String = CommandTargetSystem.codex.rawValue,
        status: String = RemoteCommandStatus.draft.rawValue,
        resultSummary: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now,
        completedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.priority = priority
        self.targetSystem = targetSystem
        self.status = status
        self.resultSummary = resultSummary
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.completedAt = completedAt
    }
}

@Model
final class ConversationMemory {
    var id: UUID
    var title: String
    var prompt: String
    var response: String
    var tagsText: String
    var isFavorite: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        prompt: String,
        response: String,
        tagsText: String = "",
        isFavorite: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.prompt = prompt
        self.response = response
        self.tagsText = tagsText
        self.isFavorite = isFavorite
        self.createdAt = createdAt
    }
}

@Model
final class CommandTimelineEvent {
    var id: UUID
    var title: String
    var detail: String
    var category: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        detail: String,
        category: String,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.detail = detail
        self.category = category
        self.createdAt = createdAt
    }
}

@Model
final class LocalNotificationRecord {
    var id: UUID
    var title: String
    var body: String
    var kind: String
    var isRead: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        body: String,
        kind: String,
        isRead: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.kind = kind
        self.isRead = isRead
        self.createdAt = createdAt
    }
}

@Model
final class Conversation {
    var id: UUID
    var title: String
    var folder: String
    var messagesText: String
    var isPinned: Bool
    var isFavorite: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        folder: String = "Founder",
        messagesText: String = "",
        isPinned: Bool = false,
        isFavorite: Bool = false,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.folder = folder
        self.messagesText = messagesText
        self.isPinned = isPinned
        self.isFavorite = isFavorite
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

@Model
final class Mission {
    var id: UUID
    var title: String
    var priority: String
    var status: String
    var deadline: Date
    var tagsText: String
    var checklistText: String
    var notes: String
    var attachmentPlaceholder: String
    var completionTimelineText: String
    var createdAt: Date
    var completedAt: Date?

    init(
        id: UUID = UUID(),
        title: String,
        priority: String = CommandPriority.normal.rawValue,
        status: String = RemoteCommandStatus.draft.label,
        deadline: Date = .now,
        tagsText: String = "",
        checklistText: String = "",
        notes: String = "",
        attachmentPlaceholder: String = "No attachments yet",
        completionTimelineText: String = "",
        createdAt: Date = .now,
        completedAt: Date? = nil
    ) {
        self.id = id
        self.title = title
        self.priority = priority
        self.status = status
        self.deadline = deadline
        self.tagsText = tagsText
        self.checklistText = checklistText
        self.notes = notes
        self.attachmentPlaceholder = attachmentPlaceholder
        self.completionTimelineText = completionTimelineText
        self.createdAt = createdAt
        self.completedAt = completedAt
    }
}

@Model
final class ResearchNote {
    var id: UUID
    var title: String
    var category: String
    var body: String
    var tagsText: String
    var isFavorite: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        category: String,
        body: String,
        tagsText: String = "",
        isFavorite: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.body = body
        self.tagsText = tagsText
        self.isFavorite = isFavorite
        self.createdAt = createdAt
    }
}

@Model
final class JournalEntry {
    var id: UUID
    var title: String
    var body: String
    var mood: String
    var energyScore: Int
    var tagsText: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        body: String,
        mood: String = "Focused",
        energyScore: Int = 75,
        tagsText: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.mood = mood
        self.energyScore = energyScore
        self.tagsText = tagsText
        self.createdAt = createdAt
    }
}

@Model
final class Reminder {
    var id: UUID
    var title: String
    var note: String
    var dueAt: Date
    var isComplete: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        note: String = "",
        dueAt: Date = .now,
        isComplete: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.note = note
        self.dueAt = dueAt
        self.isComplete = isComplete
        self.createdAt = createdAt
    }
}

@Model
final class KnowledgeNode {
    var id: UUID
    var title: String
    var category: String
    var body: String
    var tagsText: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        category: String,
        body: String,
        tagsText: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.body = body
        self.tagsText = tagsText
        self.createdAt = createdAt
    }
}

@Model
final class PromptTemplate {
    var id: UUID
    var title: String
    var category: String
    var prompt: String
    var isFavorite: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        category: String,
        prompt: String,
        isFavorite: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.prompt = prompt
        self.isFavorite = isFavorite
        self.createdAt = createdAt
    }
}

@Model
final class Agent {
    var id: UUID
    var name: String
    var role: String
    var status: String
    var queueLength: Int
    var lastActivity: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        role: String,
        status: String = SystemStatus.standby.label,
        queueLength: Int = 0,
        lastActivity: String = "Local mock agent ready.",
        createdAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.role = role
        self.status = status
        self.queueLength = queueLength
        self.lastActivity = lastActivity
        self.createdAt = createdAt
    }
}

@Model
final class KnowledgeRelationship {
    var id: UUID
    var sourceID: UUID
    var sourceType: String
    var targetID: UUID
    var targetType: String
    var relation: String
    var strength: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        sourceID: UUID,
        sourceType: String,
        targetID: UUID,
        targetType: String,
        relation: String = "Related",
        strength: Int = 5,
        createdAt: Date = .now
    ) {
        self.id = id
        self.sourceID = sourceID
        self.sourceType = sourceType
        self.targetID = targetID
        self.targetType = targetType
        self.relation = relation
        self.strength = strength
        self.createdAt = createdAt
    }
}

@Model
final class DailyBriefCard {
    var id: UUID
    var title: String
    var category: String
    var body: String
    var readinessScore: Int
    var winsText: String
    var blockersText: String
    var nextActionsText: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        category: String,
        body: String,
        readinessScore: Int = 80,
        winsText: String = "",
        blockersText: String = "",
        nextActionsText: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.category = category
        self.body = body
        self.readinessScore = readinessScore
        self.winsText = winsText
        self.blockersText = blockersText
        self.nextActionsText = nextActionsText
        self.createdAt = createdAt
    }
}

@Model
final class VoiceCommandDraft {
    var id: UUID
    var transcript: String
    var interpretedIntent: String
    var target: String
    var status: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        transcript: String,
        interpretedIntent: String,
        target: String,
        status: String = "Draft",
        createdAt: Date = .now
    ) {
        self.id = id
        self.transcript = transcript
        self.interpretedIntent = interpretedIntent
        self.target = target
        self.status = status
        self.createdAt = createdAt
    }
}

@Model
final class MissionControlCommand {
    var id: UUID
    var title: String
    var body: String
    var route: String
    var priority: String
    var status: String
    var resultSummary: String
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        body: String,
        route: String,
        priority: String = CommandPriority.normal.rawValue,
        status: String = RemoteCommandStatus.queued.label,
        resultSummary: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.body = body
        self.route = route
        self.priority = priority
        self.status = status
        self.resultSummary = resultSummary
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

@Model
final class AgentStatusRecord {
    var id: UUID
    var name: String
    var status: String
    var priority: String
    var assignedMission: String
    var lastActivity: String
    var nextAction: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        name: String,
        status: String = SystemStatus.standby.label,
        priority: String = CommandPriority.normal.rawValue,
        assignedMission: String = "Unassigned",
        lastActivity: String = "Local status board ready.",
        nextAction: String = "Await founder command.",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.status = status
        self.priority = priority
        self.assignedMission = assignedMission
        self.lastActivity = lastActivity
        self.nextAction = nextAction
        self.updatedAt = updatedAt
    }
}

@Model
final class WorkSessionRecord {
    var id: UUID
    var title: String
    var status: String
    var startedAt: Date
    var pausedAt: Date?
    var endedAt: Date?
    var durationSeconds: Double
    var completedWork: String
    var notes: String

    init(
        id: UUID = UUID(),
        title: String,
        status: String = "Active",
        startedAt: Date = .now,
        pausedAt: Date? = nil,
        endedAt: Date? = nil,
        durationSeconds: Double = 0,
        completedWork: String = "",
        notes: String = ""
    ) {
        self.id = id
        self.title = title
        self.status = status
        self.startedAt = startedAt
        self.pausedAt = pausedAt
        self.endedAt = endedAt
        self.durationSeconds = durationSeconds
        self.completedWork = completedWork
        self.notes = notes
    }
}

@Model
final class MissionContinuationRecord {
    var id: UUID
    var missionTitle: String
    var currentObjective: String
    var previousObjective: String
    var nextSuggestedAction: String
    var requiredResources: String
    var recentFiles: String
    var relatedKnowledge: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        missionTitle: String,
        currentObjective: String,
        previousObjective: String = "",
        nextSuggestedAction: String = "",
        requiredResources: String = "",
        recentFiles: String = "",
        relatedKnowledge: String = "",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.missionTitle = missionTitle
        self.currentObjective = currentObjective
        self.previousObjective = previousObjective
        self.nextSuggestedAction = nextSuggestedAction
        self.requiredResources = requiredResources
        self.recentFiles = recentFiles
        self.relatedKnowledge = relatedKnowledge
        self.updatedAt = updatedAt
    }
}

@Model
final class RecentlyViewedRecord {
    var id: UUID
    var title: String
    var itemType: String
    var context: String
    var viewedAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        itemType: String,
        context: String,
        viewedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.itemType = itemType
        self.context = context
        self.viewedAt = viewedAt
    }
}
