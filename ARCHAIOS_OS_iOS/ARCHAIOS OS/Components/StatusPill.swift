import SwiftUI

struct StatusPill: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let status: SystemStatus

    var body: some View {
        Label(title.isEmpty ? status.label : title, systemImage: icon)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .foregroundStyle(color)
            .background(color.opacity(0.12))
            .clipShape(Capsule())
    }

    private var icon: String {
        switch status {
        case .green: "checkmark.circle.fill"
        case .amber: "exclamationmark.triangle.fill"
        case .red: "xmark.octagon.fill"
        case .standby: "pause.circle.fill"
        }
    }

    private var color: Color {
        switch status {
        case .green: themeManager.theme.success
        case .amber: themeManager.theme.warning
        case .red: themeManager.theme.danger
        case .standby: themeManager.theme.accent
        }
    }
}
