// ConsoleView.swift
// Instructions: Reusable UI console showing timestamped shell commands, outputs, and errors.

import SwiftUI

struct ConsoleView: View {
    let entries: [ConsoleEntry]
    let clearAction: () -> Void

    var body: some View {
        GroupBox("Interpreter Console") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Stored shell commands and output")
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Spacer()
                    Button("Clear", action: clearAction)
                }

                ScrollView {
                    LazyVStack(alignment: .leading, spacing: 6) {
                        ForEach(entries) { entry in
                            Text(line(for: entry))
                                .font(.system(.caption, design: .monospaced))
                                .foregroundStyle(color(for: entry.kind))
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                    }
                }
                .frame(minHeight: 180)
            }
        }
    }

    private func line(for entry: ConsoleEntry) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss"
        return "[\(formatter.string(from: entry.timestamp))] \(entry.message)"
    }

    private func color(for kind: ConsoleEntry.Kind) -> Color {
        switch kind {
        case .info: return .primary
        case .command: return .blue
        case .output: return .secondary
        case .success: return .green
        case .error: return .red
        }
    }
}

#Preview {
    ConsoleView(entries: [ConsoleEntry(message: "$ python3 jobs/daily/run_daily.py", kind: .command)], clearAction: {})
}
