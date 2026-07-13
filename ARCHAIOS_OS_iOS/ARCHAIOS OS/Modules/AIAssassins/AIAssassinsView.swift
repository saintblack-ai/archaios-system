import SwiftUI

struct AIAssassinsView: View {
    @StateObject var viewModel: AIAssassinsViewModel

    var body: some View {
        List {
            Section {
                ForEach(viewModel.agents) { agent in
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Text(agent.name)
                                .font(.headline)
                            Spacer()
                            StatusPill(title: agent.status.rawValue.capitalized, status: agent.status)
                        }
                        Text(agent.mission)
                            .foregroundStyle(.secondary)
                        Text("Queue depth: \(agent.queueDepth)")
                            .font(.caption)
                    }
                    .padding(.vertical, 6)
                }
            } header: {
                Text("Agent Network")
            }
        }
        .navigationTitle("AI Assassins")
        .task { await viewModel.load() }
    }
}
