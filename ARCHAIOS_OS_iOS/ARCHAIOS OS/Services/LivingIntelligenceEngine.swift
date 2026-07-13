// Sprint 17 local intelligence engine: deterministic scoring, greetings, and recommendations with no networking.
import Foundation
import Observation

struct IntelligenceScoreSummary {
    let missionReadiness: Int
    let knowledgeGrowth: Int
    let architectureProgress: Int
    let consistency: Int
}

@Observable
final class LivingIntelligenceViewModel {
    var searchText = ""
    var selectedDock = "Commander"

    func greeting(for date: Date = .now) -> String {
        let hour = Calendar.current.component(.hour, from: date)
        if hour < 12 {
            return "Good Morning Colonel Blackburn"
        }
        if hour < 17 {
            return "Good Afternoon Colonel Blackburn"
        }
        return "Good Evening Colonel Blackburn"
    }

    func score(
        completedMissions: Int,
        openMissions: Int,
        architectureSessions: Int,
        researchSessions: Int,
        promptCount: Int,
        journalCount: Int,
        documentationCount: Int
    ) -> IntelligenceScoreSummary {
        let missionTotal = max(completedMissions + openMissions, 1)
        let missionReadiness = clamp(55 + Int((Double(completedMissions) / Double(missionTotal)) * 35) - openMissions)
        let knowledgeGrowth = clamp(50 + researchSessions * 3 + promptCount * 2 + journalCount)
        let architectureProgress = clamp(45 + architectureSessions * 5 + documentationCount * 2)
        let consistency = clamp(60 + min(journalCount, 12) * 2 + min(promptCount, 8))
        return IntelligenceScoreSummary(
            missionReadiness: missionReadiness,
            knowledgeGrowth: knowledgeGrowth,
            architectureProgress: architectureProgress,
            consistency: consistency
        )
    }

    func recommendation(openMissions: Int, researchCount: Int, promptCount: Int, journalCount: Int) -> String {
        if openMissions > 0 {
            return "Resume the highest-priority mission and capture the next decision before opening new work."
        }
        if researchCount == 0 {
            return "Add one research note to strengthen today's intelligence base."
        }
        if promptCount == 0 {
            return "Create one reusable command prompt for the current sprint."
        }
        if journalCount == 0 {
            return "Log today's commander note so the system can preserve continuity."
        }
        return "Maintain momentum: review relationships, make one decision, and update the resume point."
    }

    private func clamp(_ value: Int) -> Int {
        max(0, min(100, value))
    }
}
