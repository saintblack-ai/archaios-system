import SwiftUI

struct StatusCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @State private var pulse = false
    let title: String
    let status: SystemStatus
    let detail: String
    let systemImage: String

    var body: some View {
        CommandCard(title: title, systemImage: systemImage) {
            HStack(alignment: .top, spacing: 12) {
                StatusPill(title: status.label, status: status)
                Spacer()
            }
            Text(detail)
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
        }
        .overlay(alignment: .topTrailing) {
            Circle()
                .fill(statusColor)
                .frame(width: 9, height: 9)
                .padding(14)
                .opacity(pulse ? 1 : 0.35)
                .animation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true), value: pulse)
        }
        .onAppear { pulse = true }
    }

    private var statusColor: Color {
        switch status {
        case .green: themeManager.theme.success
        case .amber: themeManager.theme.warning
        case .red: themeManager.theme.danger
        case .standby: themeManager.theme.accent
        }
    }
}

struct MissionCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let status: SystemStatus
    let owner: String
    let nextAction: String
    var priority: String = "Medium"
    var progress: Double = 0
    var eta: String = "TBD"

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text)
                    Text(owner)
                        .font(.caption)
                        .foregroundStyle(themeManager.theme.text.opacity(0.58))
                }
                Spacer()
                StatusPill(title: status.label, status: status)
            }

            Text(nextAction)
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.72))

            ProgressView(value: progress)
                .tint(progressColor)

            HStack {
                Label(priority, systemImage: "flag.fill")
                Spacer()
                Label(eta, systemImage: "clock")
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(themeManager.theme.text.opacity(0.62))
        }
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }

    private var progressColor: Color {
        switch status {
        case .green: themeManager.theme.success
        case .amber: themeManager.theme.warning
        case .red: themeManager.theme.danger
        case .standby: themeManager.theme.accent
        }
    }
}

struct ReadinessGauge: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let score: Int
    let label: String

    var body: some View {
        VStack(spacing: 10) {
            ZStack {
                Circle()
                    .stroke(themeManager.theme.text.opacity(0.10), lineWidth: 18)
                Circle()
                    .trim(from: 0, to: CGFloat(score) / 100)
                    .stroke(gaugeColor, style: StrokeStyle(lineWidth: 18, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 2) {
                    Text("\(score)")
                        .font(.system(size: 44, weight: .bold, design: .rounded))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("/100")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(themeManager.theme.text.opacity(0.60))
                }
            }
            .frame(width: 168, height: 168)

            Text(label)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(themeManager.theme.text.opacity(0.72))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(themeManager.theme.elevatedPanel)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
    }

    private var gaugeColor: Color {
        if score >= 90 { return themeManager.theme.success }
        if score >= 70 { return themeManager.theme.warning }
        return themeManager.theme.danger
    }
}

struct VaultDocumentRow: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let item: VaultItem

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.title3)
                .foregroundStyle(themeManager.theme.heading)
                .frame(width: 28)

            VStack(alignment: .leading, spacing: 6) {
                Text(item.title)
                    .font(.headline)
                    .foregroundStyle(themeManager.theme.text)
                Text(item.summary)
                    .font(.subheadline)
                    .foregroundStyle(themeManager.theme.text.opacity(0.70))
                Text(item.tags.map { "#\($0)" }.joined(separator: " "))
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.54))
                HStack {
                    Text(item.category)
                    Spacer()
                    Label("\(item.importance)", systemImage: "star.fill")
                }
                .font(.caption.weight(.medium))
                .foregroundStyle(themeManager.theme.heading.opacity(0.86))
            }
        }
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct CommanderButton: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let systemImage: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: systemImage)
                .font(.subheadline.weight(.bold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .foregroundStyle(.black)
                .background(themeManager.theme.heading)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
        .buttonStyle(.plain)
    }
}

struct TimelineRow: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let detail: String
    let status: SystemStatus

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(spacing: 4) {
                Circle()
                    .fill(color)
                    .frame(width: 12, height: 12)
                Rectangle()
                    .fill(themeManager.theme.text.opacity(0.15))
                    .frame(width: 2, height: 34)
            }
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(themeManager.theme.text)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(themeManager.theme.text.opacity(0.65))
            }
            Spacer()
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

struct ArchaiosLogoMark: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let size: CGFloat

    var body: some View {
        ZStack {
            Circle()
                .fill(themeManager.theme.elevatedPanel)
            Circle()
                .stroke(themeManager.theme.heading, lineWidth: max(2, size * 0.035))
            Image(systemName: "scope")
                .font(.system(size: size * 0.42, weight: .black))
                .foregroundStyle(themeManager.theme.heading)
            Text("A")
                .font(.system(size: size * 0.26, weight: .black, design: .serif))
                .foregroundStyle(themeManager.theme.text)
                .offset(y: size * 0.23)
        }
        .frame(width: size, height: size)
    }
}
