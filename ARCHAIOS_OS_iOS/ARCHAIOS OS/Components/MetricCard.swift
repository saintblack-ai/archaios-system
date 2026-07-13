import SwiftUI

struct MetricCard: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let value: String
    let context: String

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.weight(.bold))
            Text(context)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
