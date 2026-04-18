// SettingsView.swift
// Instructions: Configure repository path and command executables used by the control app.

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        Form {
            Section("Archaios Repository") {
                TextField("Repo path", text: $appState.repoPath)
                    .textFieldStyle(.roundedBorder)
                Text("Default points to your iCloud Archaios OS folder.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }

            Section("Command Configuration") {
                LabeledContent("Python") {
                    TextField("python3", text: $appState.pythonCommand)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 240)
                }

                LabeledContent("Git") {
                    TextField("git", text: $appState.gitCommand)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 240)
                }

                LabeledContent("Wrangler") {
                    TextField("wrangler", text: $appState.wranglerCommand)
                        .textFieldStyle(.roundedBorder)
                        .frame(width: 240)
                }
            }

            Section("Current Expanded Path") {
                Text(appState.expandedRepoPath())
                    .font(.system(.footnote, design: .monospaced))
            }
        }
        .formStyle(.grouped)
        .padding(16)
    }
}

#Preview {
    SettingsView()
        .environmentObject(AppState())
}
