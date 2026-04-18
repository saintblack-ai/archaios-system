// ArchaiosControlApp.swift
// Instructions: Entry point for the macOS 13+ SwiftUI app. It injects shared app state.

import SwiftUI

@main
struct ArchaiosControlApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(appState)
                .frame(minWidth: 1100, minHeight: 700)
        }
        .windowResizability(.contentSize)
    }
}
