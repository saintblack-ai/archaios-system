// SystemControlPanelView.swift
// Instructions: Native control panel for running pipeline, git push, and worker deployment commands.

import SwiftUI

struct SystemControlPanelView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("System Control Panel")
                .font(.title2)
                .fontWeight(.semibold)

            Text("Repository: \(appState.expandedRepoPath())")
                .font(.system(.footnote, design: .monospaced))
                .foregroundColor(.secondary)

            HStack(spacing: 12) {
                Button("Run Daily Pipeline") { appState.runDailyPipeline() }
                    .disabled(appState.isBusy)

                Button("Push to GitHub") { appState.pushToGitHub() }
                    .disabled(appState.isBusy)

                Button("Deploy Cloudflare Worker") { appState.deployCloudflareWorker() }
                    .disabled(appState.isBusy)
            }

            if appState.isBusy {
                ProgressView("Task running...")
            }

            if let error = appState.lastError {
                Text(error)
                    .foregroundColor(.red)
                    .font(.callout)
            }

            ConsoleView(entries: appState.consoleEntries, clearAction: appState.clearConsole)

            Spacer()
        }
        .padding(16)
    }
}

#Preview {
    SystemControlPanelView()
        .environmentObject(AppState())
}
