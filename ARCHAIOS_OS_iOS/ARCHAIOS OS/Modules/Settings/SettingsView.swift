import SwiftUI

struct SettingsView: View {
    @EnvironmentObject private var themeManager: ThemeManager
    @AppStorage("founderName") private var founderName = "Saint Black"
    @AppStorage("notificationsEnabled") private var notificationsEnabled = false
    @AppStorage("requireLocalSecurity") private var requireLocalSecurity = true
    @AppStorage("missionPreference") private var missionPreference = "Revenue + Security"
    @AppStorage("accentColorName") private var accentColorName = "Founder Gold"
    @AppStorage("animationsEnabled") private var animationsEnabled = true
    @AppStorage("offlineModeEnabled") private var offlineModeEnabled = true
    @AppStorage("developerModeEnabled") private var developerModeEnabled = false
    @AppStorage("experimentalFeaturesEnabled") private var experimentalFeaturesEnabled = false
    @AppStorage("lastLocalBackupExport") private var lastLocalBackupExport = "Never"
    @StateObject var viewModel: SettingsViewModel

    var body: some View {
        List {
            Section("Appearance") {
                Button {
                    themeManager.toggleTheme()
                } label: {
                    Label("Dark Mode / Vault Theme", systemImage: "moon.stars.fill")
                }
                Picker("Accent Color", selection: $accentColorName) {
                    Text("Founder Gold").tag("Founder Gold")
                    Text("Vault Gold").tag("Vault Gold")
                    Text("Signal Green").tag("Signal Green")
                }
                HStack {
                    Text("Active Theme")
                    Spacer()
                    Text(themeManager.theme.name)
                        .foregroundStyle(themeManager.theme.heading)
                }
            }

            Section("Founder Profile") {
                TextField("Founder name", text: $founderName)
                Picker("Mission Preference", selection: $missionPreference) {
                    Text("Revenue + Security").tag("Revenue + Security")
                    Text("Creative Mode").tag("Creative Mode")
                    Text("Launch Readiness").tag("Launch Readiness")
                    Text("Research Deep Work").tag("Research Deep Work")
                }
            }

            Section("Notifications") {
                Toggle("Commander morning brief", isOn: $notificationsEnabled)
                Toggle("Mission blocker alerts", isOn: $notificationsEnabled)
            }

            Section("Founder Settings") {
                Toggle("Animations", isOn: $animationsEnabled)
                Toggle("Offline Mode", isOn: $offlineModeEnabled)
                Toggle("Developer Mode", isOn: $developerModeEnabled)
                Toggle("Experimental Features", isOn: $experimentalFeaturesEnabled)
                Button {
                    lastLocalBackupExport = Date.now.formatted(date: .abbreviated, time: .shortened)
                    Haptics.success()
                } label: {
                    Label("Export Local Backup", systemImage: "externaldrive.badge.arrow.down")
                }
                HStack {
                    Text("Last Backup")
                    Spacer()
                    Text(lastLocalBackupExport)
                        .foregroundStyle(themeManager.theme.heading)
                }
            }

            Section("Security") {
                Toggle("Require local security review", isOn: $requireLocalSecurity)
                Label("No production keys stored in app", systemImage: "lock.shield")
                Label("No live network calls enabled", systemImage: "wifi.slash")
                Label("Founder Edition runs local-first", systemImage: "iphone.and.arrow.forward")
            }

            Section("Runtime") {
                ForEach(viewModel.settings) { item in
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.title)
                                .font(.headline)
                            Text(item.detail)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                        Spacer()
                        Image(systemName: item.enabled ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(item.enabled ? themeManager.theme.success : .secondary)
                    }
                    .padding(.vertical, 4)
                }
            }

            Section("About") {
                HStack {
                    Text("Version")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String ?? "1.0")
                        .foregroundStyle(themeManager.theme.heading)
                }
                HStack {
                    Text("Build")
                    Spacer()
                    Text(Bundle.main.infoDictionary?["CFBundleVersion"] as? String ?? "5")
                        .foregroundStyle(themeManager.theme.heading)
                }
                Label("ARCHAIOS OS Founder Edition", systemImage: "scope")
            }
        }
        .scrollContentBackground(.hidden)
        .background(themeManager.theme.background)
        .navigationTitle("Settings")
        .task { await viewModel.load() }
    }
}
