// DashboardView.swift
// Instructions: Main dashboard showing metrics, logs, quick actions, and interpreter command console.

import SwiftUI

struct DashboardView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("ArchaiosControl Dashboard")
                    .font(.title2)
                    .fontWeight(.semibold)

                Spacer()

                Button("Refresh") {
                    appState.refreshAll()
                }
                .disabled(appState.isBusy)
            }

            if let error = appState.lastError {
                Text(error)
                    .foregroundColor(.red)
            }

            HStack(spacing: 12) {
                metricCard(title: "Daily Tasks", value: "\(appState.metrics.dailyTasksCompleted)")
                metricCard(title: "Music Releases", value: "\(appState.metrics.musicReleases)")
                metricCard(title: "Content Posts", value: "\(appState.metrics.contentPosts)")
                metricCard(title: "QX Updates", value: "\(appState.metrics.qxUpdates)")
            }

            VStack(alignment: .leading, spacing: 8) {
                Text("3-Year Progress")
                    .font(.headline)
                ProgressView(value: appState.metrics.progressPercent / 100.0)
                Text(String(format: "%.2f%% (Days Active: %d)", appState.metrics.progressPercent, appState.metrics.daysActive))
                    .foregroundColor(.secondary)
            }

            HStack(spacing: 12) {
                Button("Run Daily Pipeline") { appState.runDailyPipeline() }
                    .disabled(appState.isBusy)

                Button("View Logs") {
                    Task {
                        do {
                            try await appState.viewLogs()
                        } catch {
                            appState.lastError = error.localizedDescription
                        }
                    }
                }
                .disabled(appState.isBusy)

                Button("Display Metrics") {
                    Task {
                        do {
                            try await appState.loadMetrics()
                        } catch {
                            appState.lastError = error.localizedDescription
                        }
                    }
                }
                .disabled(appState.isBusy)
            }

            GroupBox("Log Files") {
                List(appState.logFiles, id: \.self) { file in
                    Text(file)
                        .font(.system(.body, design: .monospaced))
                }
                .frame(minHeight: 140)
            }

            ConsoleView(entries: appState.consoleEntries, clearAction: appState.clearConsole)

            Spacer()
        }
        .padding(16)
        .task {
            appState.refreshAll()
        }
    }

    @ViewBuilder
    private func metricCard(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption)
                .foregroundColor(.secondary)
            Text(value)
                .font(.title3)
                .fontWeight(.bold)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(nsColor: .windowBackgroundColor))
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
        )
        .cornerRadius(8)
    }
}

#Preview {
    DashboardView()
        .environmentObject(AppState())
}
