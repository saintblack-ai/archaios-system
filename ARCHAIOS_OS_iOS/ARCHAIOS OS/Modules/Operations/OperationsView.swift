import SwiftUI

struct OperationsView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @StateObject var viewModel: OperationsViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                SectionHeader(title: "Operations", subtitle: "Mission queue from completed readiness work to pending launch.")
                operationSummary
                deploymentTimeline
                ForEach(viewModel.operations) { operation in
                    MissionCard(
                        title: operation.title,
                        status: operation.status,
                        owner: operation.owner,
                        nextAction: operation.nextAction,
                        priority: operation.priority,
                        progress: operation.progress,
                        eta: operation.eta
                    )
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Operations")
        .task { await viewModel.load() }
    }

    private var operationSummary: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
            MetricCard(title: "Iron Gate", value: "Complete", context: "Readiness protocol")
            MetricCard(title: "Skybridge", value: "Complete", context: "Infrastructure map")
            MetricCard(title: "Mission Board", value: "\(viewModel.operations.count)", context: "Tracked operations")
            MetricCard(title: "Priority", value: "External Keys", context: "Active blocker")
        }
    }

    private var deploymentTimeline: some View {
        CommandCard(title: "Deployment Timeline", systemImage: "point.3.connected.trianglepath.dotted") {
            TimelineRow(title: "Operation Iron Gate", detail: "Readiness evidence captured and preserved.", status: .green)
            TimelineRow(title: "Skybridge", detail: "Cloud and deployment path mapped for later approval.", status: .green)
            TimelineRow(title: "Mission Board", detail: "Active launch blockers tracked locally.", status: .amber)
            TimelineRow(title: "Founder Launch", detail: "Held until production keys are intentionally connected.", status: .standby)
        }
    }
}
