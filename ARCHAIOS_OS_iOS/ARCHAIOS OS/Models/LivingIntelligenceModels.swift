// Sprint 19 living intelligence persistence models for local commander memory, decisions, relationships, collections, resume state, daily cycle, and reports.
import Foundation
import SwiftData

enum MissionState: String, CaseIterable, Identifiable {
    case missionReady = "Mission Ready"
    case missionActive = "Mission Active"
    case paused = "Paused"
    case waiting = "Waiting"
    case blocked = "Blocked"
    case completed = "Completed"
    case archived = "Archived"

    var id: String { rawValue }
}

@Model
final class CommanderMemoryRecord {
    var id: UUID
    var currentMission: String
    var currentSprint: String
    var lastMission: String
    var lastConversation: String
    var lastJournal: String
    var lastResearch: String
    var activeProject: String
    var currentObjective: String
    var resumePoint: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        currentMission: String = "Living Intelligence Operating System",
        currentSprint: String = "Sprint 19",
        lastMission: String = "",
        lastConversation: String = "",
        lastJournal: String = "",
        lastResearch: String = "",
        activeProject: String = "ARCHAIOS OS",
        currentObjective: String = "Unify Commander memory, knowledge, decisions, and resume context.",
        resumePoint: String = "Living Intelligence",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.currentMission = currentMission
        self.currentSprint = currentSprint
        self.lastMission = lastMission
        self.lastConversation = lastConversation
        self.lastJournal = lastJournal
        self.lastResearch = lastResearch
        self.activeProject = activeProject
        self.currentObjective = currentObjective
        self.resumePoint = resumePoint
        self.updatedAt = updatedAt
    }
}

@Model
final class IntelligenceRelationshipRecord {
    var id: UUID
    var sourceType: String
    var sourceTitle: String
    var targetType: String
    var targetTitle: String
    var relation: String
    var notes: String
    var strength: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        sourceType: String,
        sourceTitle: String,
        targetType: String,
        targetTitle: String,
        relation: String = "Related",
        notes: String = "",
        strength: Int = 5,
        createdAt: Date = .now
    ) {
        self.id = id
        self.sourceType = sourceType
        self.sourceTitle = sourceTitle
        self.targetType = targetType
        self.targetTitle = targetTitle
        self.relation = relation
        self.notes = notes
        self.strength = strength
        self.createdAt = createdAt
    }
}

@Model
final class ExecutiveDecisionRecord {
    var id: UUID
    var decision: String
    var evidence: String
    var confidence: Int
    var alternatives: String
    var risks: String
    var recommendation: String
    var finalDecision: String
    var reviewDate: Date
    var createdAt: Date

    init(
        id: UUID = UUID(),
        decision: String,
        evidence: String = "",
        confidence: Int = 75,
        alternatives: String = "",
        risks: String = "",
        recommendation: String = "",
        finalDecision: String = "",
        reviewDate: Date = .now,
        createdAt: Date = .now
    ) {
        self.id = id
        self.decision = decision
        self.evidence = evidence
        self.confidence = confidence
        self.alternatives = alternatives
        self.risks = risks
        self.recommendation = recommendation
        self.finalDecision = finalDecision
        self.reviewDate = reviewDate
        self.createdAt = createdAt
    }
}

@Model
final class KnowledgeCollectionRecord {
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
final class ResumeStateRecord {
    var id: UUID
    var currentScreen: String
    var scrollPosition: Double
    var mission: String
    var selectedResearch: String
    var draftPrompt: String
    var openJournal: String
    var lastSprint: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        currentScreen: String = "Living Intelligence",
        scrollPosition: Double = 0,
        mission: String = "",
        selectedResearch: String = "",
        draftPrompt: String = "",
        openJournal: String = "",
        lastSprint: String = "Sprint 19",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.currentScreen = currentScreen
        self.scrollPosition = scrollPosition
        self.mission = mission
        self.selectedResearch = selectedResearch
        self.draftPrompt = draftPrompt
        self.openJournal = openJournal
        self.lastSprint = lastSprint
        self.updatedAt = updatedAt
    }
}

@Model
final class DailyIntelligenceCycleRecord {
    var id: UUID
    var phase: String
    var title: String
    var summary: String
    var relatedMission: String
    var isComplete: Bool
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        phase: String,
        title: String,
        summary: String,
        relatedMission: String = "",
        isComplete: Bool = false,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.phase = phase
        self.title = title
        self.summary = summary
        self.relatedMission = relatedMission
        self.isComplete = isComplete
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

@Model
final class FounderMemorySnapshotRecord {
    var id: UUID
    var favoriteMissions: String
    var favoritePrompts: String
    var recentSearches: String
    var recentResearch: String
    var lastJournal: String
    var lastSprint: String
    var lastCommanderSession: String
    var lastEngineeringWork: String
    var recentMusicWork: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        favoriteMissions: String = "",
        favoritePrompts: String = "",
        recentSearches: String = "",
        recentResearch: String = "",
        lastJournal: String = "",
        lastSprint: String = "Sprint 19",
        lastCommanderSession: String = "",
        lastEngineeringWork: String = "",
        recentMusicWork: String = "",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.favoriteMissions = favoriteMissions
        self.favoritePrompts = favoritePrompts
        self.recentSearches = recentSearches
        self.recentResearch = recentResearch
        self.lastJournal = lastJournal
        self.lastSprint = lastSprint
        self.lastCommanderSession = lastCommanderSession
        self.lastEngineeringWork = lastEngineeringWork
        self.recentMusicWork = recentMusicWork
        self.updatedAt = updatedAt
    }
}

@Model
final class LocalIntelligenceReportRecord {
    var id: UUID
    var title: String
    var kind: String
    var markdown: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        kind: String,
        markdown: String,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.kind = kind
        self.markdown = markdown
        self.createdAt = createdAt
    }
}

@Model
final class DecisionRecord {
    var id: UUID
    var title: String
    var mission: String
    var reason: String
    var alternatives: String
    var outcome: String
    var lessonsLearned: String
    var relatedIntelligence: String
    var decisionDate: Date
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        mission: String = "",
        reason: String = "",
        alternatives: String = "",
        outcome: String = "",
        lessonsLearned: String = "",
        relatedIntelligence: String = "",
        decisionDate: Date = .now,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.mission = mission
        self.reason = reason
        self.alternatives = alternatives
        self.outcome = outcome
        self.lessonsLearned = lessonsLearned
        self.relatedIntelligence = relatedIntelligence
        self.decisionDate = decisionDate
        self.createdAt = createdAt
    }
}

@Model
final class DailyBriefRecord {
    var id: UUID
    var todaysMission: String
    var topPriorities: String
    var recentDecisions: String
    var researchProgress: String
    var sprintProgress: String
    var openTasks: String
    var suggestedNextAction: String
    var missionHealth: String
    var focusScore: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        todaysMission: String,
        topPriorities: String = "",
        recentDecisions: String = "",
        researchProgress: String = "",
        sprintProgress: String = "",
        openTasks: String = "",
        suggestedNextAction: String = "",
        missionHealth: String = "Stable",
        focusScore: Int = 75,
        createdAt: Date = .now
    ) {
        self.id = id
        self.todaysMission = todaysMission
        self.topPriorities = topPriorities
        self.recentDecisions = recentDecisions
        self.researchProgress = researchProgress
        self.sprintProgress = sprintProgress
        self.openTasks = openTasks
        self.suggestedNextAction = suggestedNextAction
        self.missionHealth = missionHealth
        self.focusScore = focusScore
        self.createdAt = createdAt
    }
}

@Model
final class LegacyRecord {
    var id: UUID
    var section: String
    var title: String
    var summary: String
    var tagsText: String
    var isPinned: Bool
    var createdAt: Date

    init(
        id: UUID = UUID(),
        section: String,
        title: String,
        summary: String = "",
        tagsText: String = "",
        isPinned: Bool = false,
        createdAt: Date = .now
    ) {
        self.id = id
        self.section = section
        self.title = title
        self.summary = summary
        self.tagsText = tagsText
        self.isPinned = isPinned
        self.createdAt = createdAt
    }
}

@Model
final class CommanderSession {
    var id: UUID
    var title: String
    var currentMission: String
    var currentScreen: String
    var currentOperation: String
    var currentSprint: String
    var currentObjective: String
    var openDocuments: String
    var lastCommanderSession: String
    var notes: String
    var createdAt: Date
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        title: String = "Executive Commander Session",
        currentMission: String = "",
        currentScreen: String = "Executive Persistence",
        currentOperation: String = "Founder OS",
        currentSprint: String = "Sprint 21",
        currentObjective: String = "",
        openDocuments: String = "",
        lastCommanderSession: String = "",
        notes: String = "",
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.currentMission = currentMission
        self.currentScreen = currentScreen
        self.currentOperation = currentOperation
        self.currentSprint = currentSprint
        self.currentObjective = currentObjective
        self.openDocuments = openDocuments
        self.lastCommanderSession = lastCommanderSession
        self.notes = notes
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

@Model
final class ExecutiveDashboardState {
    var id: UUID
    var currentMission: String
    var currentSprint: String
    var intelligenceScore: Int
    var missionReadiness: Int
    var weeklyProgress: Int
    var dailyFocus: String
    var activeOperations: String
    var founderStatus: String
    var lastSession: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        currentMission: String = "",
        currentSprint: String = "Sprint 21",
        intelligenceScore: Int = 76,
        missionReadiness: Int = 72,
        weeklyProgress: Int = 50,
        dailyFocus: String = "",
        activeOperations: String = "",
        founderStatus: String = "Focused",
        lastSession: String = "",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.currentMission = currentMission
        self.currentSprint = currentSprint
        self.intelligenceScore = intelligenceScore
        self.missionReadiness = missionReadiness
        self.weeklyProgress = weeklyProgress
        self.dailyFocus = dailyFocus
        self.activeOperations = activeOperations
        self.founderStatus = founderStatus
        self.lastSession = lastSession
        self.updatedAt = updatedAt
    }
}

@Model
final class MissionQueueState {
    var id: UUID
    var sortMode: String
    var selectedMissionID: String
    var pinnedMissionIDs: String
    var lastResumeMission: String
    var updatedAt: Date

    init(
        id: UUID = UUID(),
        sortMode: String = "Manual",
        selectedMissionID: String = "",
        pinnedMissionIDs: String = "",
        lastResumeMission: String = "",
        updatedAt: Date = .now
    ) {
        self.id = id
        self.sortMode = sortMode
        self.selectedMissionID = selectedMissionID
        self.pinnedMissionIDs = pinnedMissionIDs
        self.lastResumeMission = lastResumeMission
        self.updatedAt = updatedAt
    }
}

@Model
final class MissionHistory {
    var id: UUID
    var missionTitle: String
    var eventTitle: String
    var eventDetail: String
    var state: String
    var influenceScore: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        missionTitle: String,
        eventTitle: String,
        eventDetail: String = "",
        state: String = MissionState.missionReady.rawValue,
        influenceScore: Int = 5,
        createdAt: Date = .now
    ) {
        self.id = id
        self.missionTitle = missionTitle
        self.eventTitle = eventTitle
        self.eventDetail = eventDetail
        self.state = state
        self.influenceScore = influenceScore
        self.createdAt = createdAt
    }
}

@Model
final class FounderDecision {
    var id: UUID
    var title: String
    var mission: String
    var rationale: String
    var priority: String
    var impact: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        mission: String = "",
        rationale: String = "",
        priority: String = CommandPriority.normal.rawValue,
        impact: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.mission = mission
        self.rationale = rationale
        self.priority = priority
        self.impact = impact
        self.createdAt = createdAt
    }
}

@Model
final class DailyReflection {
    var id: UUID
    var title: String
    var wins: String
    var blockers: String
    var lessons: String
    var nextFocus: String
    var energyScore: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        wins: String = "",
        blockers: String = "",
        lessons: String = "",
        nextFocus: String = "",
        energyScore: Int = 75,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.wins = wins
        self.blockers = blockers
        self.lessons = lessons
        self.nextFocus = nextFocus
        self.energyScore = energyScore
        self.createdAt = createdAt
    }
}

@Model
final class ResearchConnection {
    var id: UUID
    var sourceTitle: String
    var targetTitle: String
    var cluster: String
    var strength: Int
    var notes: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        sourceTitle: String,
        targetTitle: String,
        cluster: String = "Knowledge",
        strength: Int = 5,
        notes: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.sourceTitle = sourceTitle
        self.targetTitle = targetTitle
        self.cluster = cluster
        self.strength = strength
        self.notes = notes
        self.createdAt = createdAt
    }
}

@Model
final class IntelligenceInsight {
    var id: UUID
    var title: String
    var summary: String
    var category: String
    var priority: String
    var relatedMission: String
    var confidence: Int
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        summary: String = "",
        category: String = "Insight",
        priority: String = CommandPriority.normal.rawValue,
        relatedMission: String = "",
        confidence: Int = 75,
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.summary = summary
        self.category = category
        self.priority = priority
        self.relatedMission = relatedMission
        self.confidence = confidence
        self.createdAt = createdAt
    }
}

@Model
final class LegacyEntry {
    var id: UUID
    var title: String
    var domain: String
    var summary: String
    var progress: Int
    var tagsText: String
    var createdAt: Date

    init(
        id: UUID = UUID(),
        title: String,
        domain: String = "Legacy",
        summary: String = "",
        progress: Int = 0,
        tagsText: String = "",
        createdAt: Date = .now
    ) {
        self.id = id
        self.title = title
        self.domain = domain
        self.summary = summary
        self.progress = progress
        self.tagsText = tagsText
        self.createdAt = createdAt
    }
}
