import SwiftUI

struct CommandCard<Content: View>: View {
    @EnvironmentObject private var themeManager: ThemeManager
    let title: String
    let systemImage: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label(title, systemImage: systemImage)
                .font(.headline)
                .foregroundStyle(themeManager.theme.accent)
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(themeManager.theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}
