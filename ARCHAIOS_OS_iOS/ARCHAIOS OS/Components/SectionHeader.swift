import SwiftUI

struct SectionHeader: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let subtitle: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.title2.weight(.bold))
                .foregroundStyle(themeManager.theme.heading)
            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(themeManager.theme.text.opacity(0.68))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
