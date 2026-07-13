import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

struct EmptyStateView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let detail: String
    let systemImage: String

    var body: some View {
        VStack(spacing: 10) {
            Image(systemName: systemImage)
                .font(.title2)
                .foregroundStyle(themeManager.theme.heading)
            Text(title)
                .font(.headline)
                .foregroundStyle(themeManager.theme.text)
            Text(detail)
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundStyle(themeManager.theme.text.opacity(0.66))
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.theme.elevatedPanel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct BriefCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let brief: DailyCommandBrief

    var body: some View {
        CommandCard(title: brief.title, systemImage: "sun.max.fill") {
            StatusPill(title: brief.status.label, status: brief.status)
            Text(brief.summary)
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
            VStack(alignment: .leading, spacing: 8) {
                ForEach(brief.actions, id: \.self) { action in
                    Label(action, systemImage: "checkmark.seal")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                }
            }
        }
    }
}

struct ScheduledMissionView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let mission: ScheduledMissionCard

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(mission.title)
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text)
                    Text(mission.trigger)
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.58))
                }
                Spacer()
                StatusPill(title: mission.status.label, status: mission.status)
            }

            ForEach(mission.checklist, id: \.self) { item in
                Label(item, systemImage: "circle")
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.68))
            }
        }
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

enum Haptics {
    static func selection() {
        #if canImport(UIKit)
        UISelectionFeedbackGenerator().selectionChanged()
        #endif
    }

    static func success() {
        #if canImport(UIKit)
        UINotificationFeedbackGenerator().notificationOccurred(.success)
        #endif
    }
}
