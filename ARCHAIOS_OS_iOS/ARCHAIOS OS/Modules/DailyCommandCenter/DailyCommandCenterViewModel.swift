import Foundation

@MainActor
final class DailyCommandCenterViewModel: ObservableObject {
    @Published private(set) var readinessScore: Int = 68
    @Published private(set) var founderStatus = "Saint Black: operational, creative block protected, launch gate pending external keys."
    @Published private(set) var morningBrief: DailyCommandBrief
    @Published private(set) var eveningReview: DailyCommandBrief
    @Published private(set) var weeklyReview: DailyCommandBrief
    @Published private(set) var objectives: [DailyObjective]
    @Published private(set) var automations: [ScheduledMissionCard]

    init(
        readinessScore: Int = 68,
        founderStatus: String = "Saint Black: operational, creative block protected, launch gate pending external keys."
    ) {
        self.readinessScore = readinessScore
        self.founderStatus = founderStatus
        self.morningBrief = DailyCommandCenterViewModel.makeMorningBrief()
        self.eveningReview = DailyCommandCenterViewModel.makeEveningReview()
        self.weeklyReview = DailyCommandCenterViewModel.makeWeeklyReview()
        self.objectives = DailyCommandCenterViewModel.makeObjectives()
        self.automations = DailyCommandCenterViewModel.makeAutomations()
    }

    var completedObjectiveCount: Int {
        objectives.filter(\.isComplete).count
    }

    var missionCountdown: String {
        readinessScore >= 90 ? "Launch gate ready" : "\(90 - readinessScore) points to production gate"
    }

    func toggleObjective(_ objective: DailyObjective) {
        objectives = objectives.map { item in
            guard item.id == objective.id else { return item }
            return DailyObjective(title: item.title, priority: item.priority, isComplete: !item.isComplete)
        }
    }

    func generateChecklist(for title: String) -> [String] {
        [
            "Define success condition for \(title).",
            "Confirm no production API keys are required.",
            "Capture result in Founder Journal.",
            "Archive evidence in Black Vault."
        ]
    }

    private static func makeMorningBrief() -> DailyCommandBrief {
        DailyCommandBrief(
            title: "Morning Brief",
            summary: "Protect music creation, move one launch blocker, and keep Commander evidence current.",
            status: .amber,
            actions: [
                "Verify today’s top infrastructure blocker.",
                "Capture one founder insight before noon.",
                "Reserve focused studio time."
            ]
        )
    }

    private static func makeEveningReview() -> DailyCommandBrief {
        DailyCommandBrief(
            title: "Evening Review",
            summary: "Close the day by logging wins, blockers, energy level, and tomorrow’s first move.",
            status: .standby,
            actions: [
                "Mark completed objectives.",
                "Save music or business notes.",
                "Set tomorrow’s first mission."
            ]
        )
    }

    private static func makeWeeklyReview() -> DailyCommandBrief {
        DailyCommandBrief(
            title: "Weekly Review",
            summary: "Review readiness, revenue, release calendar, documentation drift, and security posture.",
            status: .green,
            actions: [
                "Review launch gate score.",
                "Audit saved missions.",
                "Pick one revenue action."
            ]
        )
    }

    private static func makeObjectives() -> [DailyObjective] {
        [
            DailyObjective(title: "Move one external production blocker", priority: "Critical", isComplete: false),
            DailyObjective(title: "Write or refine one music asset", priority: "High", isComplete: false),
            DailyObjective(title: "Capture one Black Vault note", priority: "Medium", isComplete: true),
            DailyObjective(title: "Review Commander readiness", priority: "High", isComplete: false)
        ]
    }

    private static func makeAutomations() -> [ScheduledMissionCard] {
        [
            ScheduledMissionCard(title: "Morning Brief", trigger: "Daily at 0700", status: .standby, checklist: ["Readiness", "Calendar", "Top objective"]),
            ScheduledMissionCard(title: "Evening Review", trigger: "Daily at 2100", status: .standby, checklist: ["Wins", "Blockers", "Tomorrow"]),
            ScheduledMissionCard(title: "Weekly Security Review", trigger: "Friday at 1600", status: .amber, checklist: ["Secrets", "Dependencies", "Auth"]),
            ScheduledMissionCard(title: "Pre-Deploy Checklist", trigger: "Manual before release", status: .red, checklist: ["Build", "Tests", "Rollback", "Approval"])
        ]
    }
}
