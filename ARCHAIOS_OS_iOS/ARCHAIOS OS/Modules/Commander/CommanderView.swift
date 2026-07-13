import SwiftUI

struct CommanderView: View {
    @EnvironmentObject private var container: AppContainer
    @EnvironmentObject private var themeManager: ThemeManager
    @StateObject var viewModel: CommanderViewModel

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                SectionHeader(title: "Commander Dashboard", subtitle: "Daily command brief, readiness, operations, and infrastructure posture.")
                if let brief = viewModel.brief {
                    ReadinessGauge(score: brief.readinessScore, label: brief.recommendation)

                    CommandCard(title: "Mission Countdown", systemImage: "timer") {
                        HStack {
                            MetricCard(title: "External Keys", value: "4-8 hrs", context: "Estimated operator work")
                            MetricCard(title: "Launch Gate", value: ">= 90", context: "Required readiness score")
                        }
                    }

                    CommandCard(title: "Daily Commander Brief", systemImage: "doc.text.magnifyingglass") {
                        Text(brief.summary)
                            .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    }

                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 150), spacing: 12)], spacing: 12) {
                        MetricCard(title: "Weather", value: "Local", context: "Placeholder only")
                        MetricCard(title: "Calendar", value: "Clear", context: "No calendar connected")
                    }

                    CommandCard(title: "Mission Readiness Score", systemImage: "gauge.with.dots.needle.67percent") {
                        Text("Current status is tactical hold. Engineering foundation is complete; external infrastructure remains the launch gate.")
                            .font(.subheadline)
                            .foregroundStyle(themeManager.theme.text.opacity(0.72))
                    }

                    NavigationLink(value: AppRoute.aiCommander) {
                        Label("AI Commander Shortcut", systemImage: "message.badge.waveform")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .padding()
                            .foregroundStyle(.black)
                            .background(themeManager.theme.heading)
                            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                    .buttonStyle(.plain)

                    CommandCard(title: "Active Operations", systemImage: "checklist") {
                        ForEach(brief.topActions, id: \.self) { action in
                            Label(action, systemImage: "arrow.right.circle")
                                .font(.subheadline)
                                .foregroundStyle(themeManager.theme.text.opacity(0.82))
                        }
                    }

                    CommandCard(title: "Commander Timeline", systemImage: "point.3.connected.trianglepath.dotted") {
                        TimelineRow(title: "Iron Gate", detail: "Readiness gate established and complete.", status: .green)
                        TimelineRow(title: "Skybridge", detail: "Infrastructure map and deployment sequence complete.", status: .green)
                        TimelineRow(title: "External Keys", detail: "Waiting for operator-approved production access.", status: .amber)
                        TimelineRow(title: "Launch", detail: "Pending final readiness above 90.", status: .standby)
                    }

                    CommandCard(title: "Infrastructure Status", systemImage: "network") {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Local status summary only. No production APIs are queried.")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(themeManager.theme.heading.opacity(0.82))
                            StatusPill(title: "Cloudflare Blocked", status: .red)
                            StatusPill(title: "Supabase Blocked", status: .red)
                            StatusPill(title: "Stripe Warning", status: .amber)
                            StatusPill(title: "Vercel Online", status: .green)
                        }
                    }

                    CommandCard(title: "Quick Launch", systemImage: "bolt.fill") {
                        VStack(spacing: 10) {
                            NavigationLink(value: AppRoute.dailyCommandCenter) {
                                Label("Open Daily OS", systemImage: "sunrise.fill")
                            }
                            NavigationLink(value: AppRoute.musicCommand) {
                                Label("Open Music Command", systemImage: "music.mic")
                            }
                            NavigationLink(value: AppRoute.blackVault) {
                                Label("Open Black Vault", systemImage: "archivebox")
                            }
                            NavigationLink(value: AppRoute.operations) {
                                Label("Open Mission Center", systemImage: "checklist")
                            }
                            NavigationLink(value: AppRoute.founderMode) {
                                Label("Open Founder Mode", systemImage: "person.crop.circle.badge.checkmark")
                            }
                        }
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(themeManager.theme.heading)
                    }
                }
            }
            .padding()
        }
        .background(themeManager.theme.background)
        .navigationTitle("Commander")
        .task { await viewModel.load() }
    }
}
