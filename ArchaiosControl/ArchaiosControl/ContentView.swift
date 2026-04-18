// ContentView.swift
// Instructions: Root navigation container for Dashboard, Control Panel, and Settings tabs.

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.bar.doc.horizontal")
                }

            SystemControlPanelView()
                .tabItem {
                    Label("System Control", systemImage: "switch.2")
                }

            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
