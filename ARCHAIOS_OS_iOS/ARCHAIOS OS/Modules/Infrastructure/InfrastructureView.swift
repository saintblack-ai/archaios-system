import SwiftUI

struct InfrastructureView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @StateObject var viewModel: InfrastructureViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SectionHeader(title: "Infrastructure", subtitle: "Production dependency cards with mock-only status indicators.")
                Text("All cards are mock status surfaces. No live network calls are made from ARCHAIOS OS v1.")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(themeManager.theme.heading.opacity(0.82))
                ForEach(viewModel.signals) { signal in
                    StatusCard(
                        title: signal.system,
                        status: signal.status,
                        detail: signal.evidence,
                        systemImage: icon(for: signal.system)
                    )
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Infrastructure")
        .task { await viewModel.load() }
    }

    private func icon(for system: String) -> String {
        switch system {
        case "GitHub": "chevron.left.forwardslash.chevron.right"
        case "Cloudflare": "cloud"
        case "Supabase": "cylinder.split.1x2"
        case "Stripe": "creditcard"
        case "Vercel": "triangle"
        case "OpenAI": "brain"
        default: "network"
        }
    }
}
