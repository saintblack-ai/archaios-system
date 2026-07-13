import SwiftData
import SwiftUI

struct DailyCommandCenterView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \SavedMission.scheduledFor, order: .forward) private var savedMissions: [SavedMission]
    @StateObject var viewModel: DailyCommandCenterViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Daily Command Center", subtitle: "Morning intent, evening reflection, weekly review, objectives, and local automation prep.")

                ReadinessGauge(score: viewModel.readinessScore, label: viewModel.missionCountdown)

                CommandCard(title: "Founder Status", systemImage: "person.text.rectangle.fill") {
                    Text(viewModel.founderStatus)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.78))
                }

                BriefCard(brief: viewModel.morningBrief)
                BriefCard(brief: viewModel.eveningReview)
                BriefCard(brief: viewModel.weeklyReview)

                mobilePrompts
                objectives
                automationLayer
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 18)
        }
        .background(themeManager.theme.background)
        .navigationTitle("Daily OS")
    }

    private var mobilePrompts: some View {
        CommandCard(title: "Mobile Commander Prompts", systemImage: "iphone.gen3.radiowaves.left.and.right") {
            VStack(alignment: .leading, spacing: 10) {
                PromptLine(title: "Today's mission", detail: "What must move forward before laptop time?")
                PromptLine(title: "Blockers", detail: "What is stopping execution right now?")
                PromptLine(title: "Energy level", detail: "Low, steady, high, or surge.")
                PromptLine(title: "Top 3 tasks", detail: "Pick only the next three visible actions.")
                PromptLine(title: "Handoff summary", detail: "What should Mac Core or Codex know later?")
            }
        }
    }

    private var objectives: some View {
        CommandCard(title: "Daily Objectives", systemImage: "target") {
            HStack {
                Text("\(viewModel.completedObjectiveCount)/\(viewModel.objectives.count) complete")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(themeManager.theme.heading)
                Spacer()
            }

            ForEach(viewModel.objectives) { objective in
                Button {
                    Haptics.selection()
                    viewModel.toggleObjective(objective)
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: objective.isComplete ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(objective.isComplete ? themeManager.theme.success : themeManager.theme.text.opacity(0.45))
                        VStack(alignment: .leading, spacing: 2) {
                            Text(objective.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(themeManager.theme.text)
                            Text(objective.priority)
                                .font(.caption)
                                .foregroundStyle(themeManager.theme.text.opacity(0.58))
                        }
                        Spacer()
                    }
                    .padding(.vertical, 6)
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var automationLayer: some View {
        VStack(alignment: .leading, spacing: 12) {
            SectionHeader(title: "Mission Automation", subtitle: "Mock scheduling layer. Automations are prepared locally and disabled by default.")
            ForEach(viewModel.automations) { mission in
                VStack(alignment: .leading, spacing: 8) {
                    ScheduledMissionView(mission: mission)
                    CommanderButton(title: "Save Local Mission", systemImage: "calendar.badge.plus") {
                        saveMission(mission)
                    }
                }
            }

            CommandCard(title: "Saved Missions", systemImage: "calendar") {
                if savedMissions.isEmpty {
                    EmptyStateView(title: "No saved missions", detail: "Save an automation card to prepare it for future local scheduling.", systemImage: "calendar.badge.clock")
                } else {
                    ForEach(savedMissions) { mission in
                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: mission.isComplete ? "checkmark.circle.fill" : "calendar")
                                .foregroundStyle(mission.isComplete ? themeManager.theme.success : themeManager.theme.heading)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(mission.title)
                                    .font(.subheadline.weight(.bold))
                                    .foregroundStyle(themeManager.theme.text)
                                Text("\(mission.priority) | \(mission.status)")
                                    .font(.caption)
                                    .foregroundStyle(themeManager.theme.text.opacity(0.60))
                            }
                            Spacer()
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
    }

    private func saveMission(_ mission: ScheduledMissionCard) {
        let record = SavedMission(
            title: mission.title,
            status: mission.status.label,
            priority: mission.status == .red ? "Critical" : "Normal",
            scheduledFor: .now,
            checklistText: mission.checklist.joined(separator: "\n")
        )
        modelContext.insert(record)
        Haptics.success()
    }
}

private struct PromptLine: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let detail: String

    var body: some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "circle.dashed")
                .foregroundStyle(themeManager.theme.heading)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.62))
            }
        }
    }
}
