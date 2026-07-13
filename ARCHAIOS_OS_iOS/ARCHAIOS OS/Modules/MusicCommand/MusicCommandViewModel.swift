import Foundation

@MainActor
final class MusicCommandViewModel: ObservableObject {
    @Published private(set) var trackers: [MusicProjectTracker]
    @Published private(set) var albums: [MusicAlbumPlan]
    @Published private(set) var studioTasks: [DailyObjective]
    @Published private(set) var releaseCalendar: [ScheduledMissionCard]
    @Published private(set) var streamingChecklist: [DailyObjective]

    init() {
        self.trackers = [
            MusicProjectTracker(title: "Spymaster", phase: "Album buildout", progress: 0.46, nextAction: "Lock sequence candidates and visual language.", releaseWindow: "TBD"),
            MusicProjectTracker(title: "Jugg 'Em", phase: "Single priority", progress: 0.68, nextAction: "Finalize rollout checklist and short-form content.", releaseWindow: "Next campaign window")
        ]
        self.albums = [
            MusicAlbumPlan(title: "Spymaster", status: "Founder album", focus: "Espionage luxury, strategy, loyalty, and power.", trackIdeas: ["Black Briefing", "Velvet Intel", "No Witnesses", "Gold Scope"]),
            MusicAlbumPlan(title: "Jugg Em", status: "Single / EP lane", focus: "High-energy rollout with street-command hooks.", trackIdeas: ["Jugg Em", "Pressure Route", "Paid in Signals", "Switchboard"])
        ]
        self.studioTasks = [
            DailyObjective(title: "Write hook variations", priority: "High", isComplete: false),
            DailyObjective(title: "Review cover concept", priority: "Medium", isComplete: false),
            DailyObjective(title: "Export reference mix notes", priority: "High", isComplete: false),
            DailyObjective(title: "Schedule studio session block", priority: "High", isComplete: false),
            DailyObjective(title: "Capture voice memo placeholders", priority: "Medium", isComplete: false)
        ]
        self.releaseCalendar = [
            ScheduledMissionCard(title: "Visual Concepts", trigger: "Before campaign", status: .amber, checklist: ["Mood board", "Color story", "Shoot list"]),
            ScheduledMissionCard(title: "Single Rollout", trigger: "Release week", status: .standby, checklist: ["Pre-save", "Content", "Distribution"]),
            ScheduledMissionCard(title: "Album Intelligence", trigger: "Weekly", status: .green, checklist: ["Tracklist", "Themes", "Business tie-in"])
        ]
        self.streamingChecklist = [
            DailyObjective(title: "Metadata and ISRC placeholders", priority: "Required", isComplete: false),
            DailyObjective(title: "Cover art export queue", priority: "Required", isComplete: false),
            DailyObjective(title: "DSP pitch notes", priority: "Medium", isComplete: false),
            DailyObjective(title: "Short-form content bank", priority: "High", isComplete: false)
        ]
    }

    var primaryProject: MusicProjectTracker? {
        trackers.max { $0.progress < $1.progress }
    }

    func noteCategories() -> [String] {
        ["Song Idea", "Lyrics", "Track Idea", "Visual Concept", "Release Plan", "Studio Session"]
    }
}
