// ArchaiosService.swift
// Instructions: Service layer that maps UI actions to local Archaios OS shell commands and file loading.

import Foundation

enum ArchaiosServiceError: LocalizedError {
    case invalidRepositoryPath(String)
    case metricsMissing(String)

    var errorDescription: String? {
        switch self {
        case .invalidRepositoryPath(let path):
            return "Repository path does not exist: \(path)"
        case .metricsMissing(let file):
            return "Metrics file not found: \(file)"
        }
    }
}

struct ArchaiosService {
    func runDailyPipeline(repoPath: String, pythonCommand: String) async throws -> ShellResult {
        try validateRepoPath(repoPath)
        return try await Shell.run("\(pythonCommand) jobs/daily/run_daily.py", in: repoPath)
    }

    func pushToGitHub(repoPath: String, gitCommand: String) async throws -> [ShellResult] {
        try validateRepoPath(repoPath)

        let timestamp = ISO8601DateFormatter().string(from: Date())
        let addResult = try await Shell.run("\(gitCommand) add .", in: repoPath)

        // Allow commit to fail when there are no changes; still return push attempt signal.
        let commitCommand = "\(gitCommand) commit -m \"chore: ArchaiosControl sync \(timestamp)\" || true"
        let commitResult = try await Shell.run(commitCommand, in: repoPath)

        let pushResult = try await Shell.run("\(gitCommand) push", in: repoPath)

        return [addResult, commitResult, pushResult]
    }

    func deployCloudflareWorker(repoPath: String, wranglerCommand: String) async throws -> ShellResult {
        try validateRepoPath(repoPath)
        let workerPath = URL(fileURLWithPath: repoPath).appendingPathComponent("cloudflare_worker").path
        return try await Shell.run("\(wranglerCommand) deploy", in: workerPath)
    }

    func listLogFiles(repoPath: String) async throws -> ShellResult {
        try validateRepoPath(repoPath)
        return try await Shell.run("ls -1 logs 2>/dev/null || true", in: repoPath)
    }

    func loadMetrics(repoPath: String) async throws -> Metrics {
        try validateRepoPath(repoPath)
        let metricsPath = URL(fileURLWithPath: repoPath).appendingPathComponent("metrics/metrics.json").path
        guard FileManager.default.fileExists(atPath: metricsPath) else {
            throw ArchaiosServiceError.metricsMissing(metricsPath)
        }

        let data = try Data(contentsOf: URL(fileURLWithPath: metricsPath))
        return try JSONDecoder().decode(Metrics.self, from: data)
    }

    private func validateRepoPath(_ path: String) throws {
        var isDirectory: ObjCBool = false
        let exists = FileManager.default.fileExists(atPath: path, isDirectory: &isDirectory)
        if !exists || !isDirectory.boolValue {
            throw ArchaiosServiceError.invalidRepositoryPath(path)
        }
    }
}
