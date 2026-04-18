// Shell.swift
// Instructions: Async shell runner used by the app to execute local commands with stdout/stderr capture.

import Foundation

struct ShellResult {
    let command: String
    let standardOutput: String
    let standardError: String
    let exitCode: Int32
}

enum ShellError: LocalizedError {
    case nonZeroExit(ShellResult)

    var result: ShellResult? {
        switch self {
        case .nonZeroExit(let result):
            return result
        }
    }

    var errorDescription: String? {
        switch self {
        case .nonZeroExit(let result):
            return "Command failed (\(result.exitCode)): \(result.command)"
        }
    }
}

struct Shell {
    static func run(_ command: String, in workingDirectory: String) async throws -> ShellResult {
        try await withCheckedThrowingContinuation { continuation in
            let process = Process()
            let outPipe = Pipe()
            let errPipe = Pipe()

            process.executableURL = URL(fileURLWithPath: "/bin/zsh")
            process.arguments = ["-lc", command]
            process.standardOutput = outPipe
            process.standardError = errPipe
            process.currentDirectoryURL = URL(fileURLWithPath: workingDirectory)

            process.terminationHandler = { proc in
                let outData = outPipe.fileHandleForReading.readDataToEndOfFile()
                let errData = errPipe.fileHandleForReading.readDataToEndOfFile()
                let output = String(decoding: outData, as: UTF8.self)
                let error = String(decoding: errData, as: UTF8.self)

                let result = ShellResult(
                    command: command,
                    standardOutput: output,
                    standardError: error,
                    exitCode: proc.terminationStatus
                )

                if proc.terminationStatus == 0 {
                    continuation.resume(returning: result)
                } else {
                    continuation.resume(throwing: ShellError.nonZeroExit(result))
                }
            }

            do {
                try process.run()
            } catch {
                continuation.resume(throwing: error)
            }
        }
    }
}
