// AppState.swift
// Instructions: Shared state and command handlers for UI actions and async shell task execution.

import Foundation
import SwiftUI

@MainActor
final class AppState: ObservableObject {
    @AppStorage("repoPath") var repoPath: String = "~/Library/Mobile Documents/com~apple~CloudDocs/QX Technology 2019/Archaios OS"
    @AppStorage("pythonCommand") var pythonCommand: String = "python3"
    @AppStorage("gitCommand") var gitCommand: String = "git"
    @AppStorage("wranglerCommand") var wranglerCommand: String = "wrangler"

    @Published var metrics: Metrics = .empty
    @Published var logFiles: [String] = []
    @Published var consoleEntries: [ConsoleEntry] = []
    @Published var isBusy: Bool = false
    @Published var lastError: String?

    private let service = ArchaiosService()

    func appendConsole(_ text: String, kind: ConsoleEntry.Kind = .info) {
        consoleEntries.append(ConsoleEntry(message: text, kind: kind))
    }

    func clearConsole() {
        consoleEntries.removeAll()
    }

    func expandedRepoPath() -> String {
        NSString(string: repoPath).expandingTildeInPath
    }

    func runDailyPipeline() {
        Task {
            await runAction("Run Daily Pipeline") {
                let result = try await service.runDailyPipeline(
                    repoPath: expandedRepoPath(),
                    pythonCommand: pythonCommand
                )
                appendCommandResult(result)
                try await loadMetrics()
                try await viewLogs()
            }
        }
    }

    func pushToGitHub() {
        Task {
            await runAction("Push to GitHub") {
                let results = try await service.pushToGitHub(
                    repoPath: expandedRepoPath(),
                    gitCommand: gitCommand
                )
                for result in results {
                    appendCommandResult(result)
                }
            }
        }
    }

    func deployCloudflareWorker() {
        Task {
            await runAction("Deploy Cloudflare Worker") {
                let result = try await service.deployCloudflareWorker(
                    repoPath: expandedRepoPath(),
                    wranglerCommand: wranglerCommand
                )
                appendCommandResult(result)
            }
        }
    }

    func refreshAll() {
        Task {
            await runAction("Refresh Dashboard") {
                try await loadMetrics()
                try await viewLogs()
            }
        }
    }

    func viewLogs() async throws {
        let result = try await service.listLogFiles(repoPath: expandedRepoPath())
        appendCommandResult(result)

        let listed = result.standardOutput
            .split(separator: "\n")
            .map(String.init)
            .filter { !$0.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty }

        logFiles = listed
    }

    func loadMetrics() async throws {
        let loaded = try await service.loadMetrics(repoPath: expandedRepoPath())
        metrics = loaded
        appendConsole("Loaded metrics from metrics/metrics.json", kind: .success)
    }

    private func appendCommandResult(_ result: ShellResult) {
        appendConsole("$ \(result.command)", kind: .command)

        let output = result.standardOutput.trimmingCharacters(in: .whitespacesAndNewlines)
        if !output.isEmpty {
            appendConsole(output, kind: .output)
        }

        let error = result.standardError.trimmingCharacters(in: .whitespacesAndNewlines)
        if !error.isEmpty {
            appendConsole(error, kind: .error)
        }

        if result.exitCode == 0 {
            appendConsole("Exit code: 0", kind: .success)
        } else {
            appendConsole("Exit code: \(result.exitCode)", kind: .error)
        }
    }

    private func runAction(_ name: String, action: @escaping () async throws -> Void) async {
        guard !isBusy else {
            appendConsole("Another task is currently running.", kind: .error)
            return
        }

        isBusy = true
        lastError = nil
        appendConsole("Starting: \(name)", kind: .info)

        do {
            try await action()
            appendConsole("Completed: \(name)", kind: .success)
        } catch {
            if let shellError = error as? ShellError, let result = shellError.result {
                appendCommandResult(result)
            }
            let message = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
            lastError = message
            appendConsole("Failed: \(name) - \(message)", kind: .error)
        }

        isBusy = false
    }
}
