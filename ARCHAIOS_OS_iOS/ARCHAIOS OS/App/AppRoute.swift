import SwiftUI

enum AppRoute: String, CaseIterable, Identifiable, Hashable {
    case executivePersistence
    case operationalPersistence
    case livingIntelligence
    case livingCommander
    case founderOperations
    case liveCommandBridge
    case coreNetwork
    case missionControlAI
    case intelligenceCore
    case commander
    case dailyCommandCenter
    case aiAssassins
    case blackVault
    case operations
    case musicCommand
    case infrastructure
    case founderMode
    case aiCommander
    case macCoreBridge
    case splash
    case settings

    var id: String { rawValue }

    var title: String {
        switch self {
        case .executivePersistence: "Executive Persistence"
        case .operationalPersistence: "Operational Persistence"
        case .livingIntelligence: "Living Intelligence"
        case .livingCommander: "Commander Mode"
        case .founderOperations: "Founder Ops"
        case .liveCommandBridge: "Live Bridge"
        case .coreNetwork: "Core Network"
        case .missionControlAI: "Mission Control AI"
        case .intelligenceCore: "Intelligence Core"
        case .commander: "Commander"
        case .dailyCommandCenter: "Daily OS"
        case .aiAssassins: "AI Assassins"
        case .blackVault: "Black Vault"
        case .operations: "Operations"
        case .musicCommand: "Music Command"
        case .infrastructure: "Infrastructure"
        case .founderMode: "Founder Mode"
        case .aiCommander: "AI Commander"
        case .macCoreBridge: "Mac Core Bridge"
        case .splash: "Branding"
        case .settings: "Settings"
        }
    }

    var symbol: String {
        switch self {
        case .executivePersistence: "building.columns.fill"
        case .operationalPersistence: "externaldrive.badge.checkmark"
        case .livingIntelligence: "brain.filled.head.profile"
        case .livingCommander: "building.columns.circle.fill"
        case .founderOperations: "chart.line.uptrend.xyaxis.circle.fill"
        case .liveCommandBridge: "antenna.radiowaves.left.and.right"
        case .coreNetwork: "point.3.connected.trianglepath.dotted"
        case .missionControlAI: "command"
        case .intelligenceCore: "brain.head.profile"
        case .commander: "scope"
        case .dailyCommandCenter: "sunrise.fill"
        case .aiAssassins: "bolt.horizontal.circle"
        case .blackVault: "archivebox"
        case .operations: "checklist"
        case .musicCommand: "music.mic"
        case .infrastructure: "network"
        case .founderMode: "person.crop.circle.badge.checkmark"
        case .aiCommander: "message.badge.waveform"
        case .macCoreBridge: "desktopcomputer.and.arrow.down"
        case .splash: "sparkles"
        case .settings: "gearshape"
        }
    }
}
