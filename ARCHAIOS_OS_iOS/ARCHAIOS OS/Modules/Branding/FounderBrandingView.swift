import SwiftUI

struct FounderBrandingView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @State private var rotate = false

    var body: some View {
        ScrollView {
            VStack(spacing: 22) {
                ArchaiosLogoMark(size: 156)
                    .rotationEffect(.degrees(rotate ? 360 : 0))
                    .animation(.linear(duration: 18).repeatForever(autoreverses: false), value: rotate)

                VStack(spacing: 6) {
                    Text("ARCHAIOS OS")
                        .font(.system(size: 36, weight: .black, design: .serif))
                        .foregroundStyle(themeManager.theme.heading)
                    Text("Saint Black Founder Screen")
                        .font(.headline)
                        .foregroundStyle(themeManager.theme.text.opacity(0.70))
                }

                CommandCard(title: "AI Assassins", systemImage: "bolt.horizontal.circle.fill") {
                    Text("Premium command brand for specialized AI operators, mission execution, and founder intelligence.")
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                }

                CommandCard(title: "Custom App Icon Direction", systemImage: "app.badge.fill") {
                    Text("Black field, gold ARCHAIOS mark, emerald active-state accent, tactical Founder Edition posture.")
                        .foregroundStyle(themeManager.theme.text.opacity(0.72))
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Branding")
        .onAppear { rotate = true }
    }
}
