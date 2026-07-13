import Foundation

protocol CommanderProviding {
    func fetchCommanderBrief() async throws -> CommanderBrief
}

protocol AgentNetworkProviding {
    func fetchAgents() async throws -> [AgentCard]
}

protocol VaultProviding {
    func fetchVaultItems() async throws -> [VaultItem]
}

protocol OperationsProviding {
    func fetchOperations() async throws -> [OperationItem]
}

protocol InfrastructureProviding {
    func fetchInfrastructureSignals() async throws -> [InfrastructureSignal]
}

protocol FounderModeProviding {
    func fetchFounderMetrics() async throws -> [FounderMetric]
}

protocol SettingsProviding {
    func fetchSettings() async throws -> [SettingsOption]
}

protocol SupabaseGateway {
    func verifyAuthHealth() async throws -> SystemStatus
}

protocol StripeGateway {
    func fetchRevenueStatus() async throws -> SystemStatus
}

protocol CloudflareGateway {
    func verifyWorkerIdentity() async throws -> SystemStatus
}

protocol OpenAIGateway {
    func verifyModelAccess() async throws -> SystemStatus
}

protocol GitHubGateway {
    func fetchWorkflowStatus() async throws -> SystemStatus
}

protocol CommandRouting {
    func classifyCommand(_ text: String) -> CommandTargetSystem
    func offlineResponse(for text: String, target: CommandTargetSystem) -> String
    func missionTemplates() -> [MissionTemplate]
}

protocol FutureOpenAIInterface {
    var isOpenAIEnabled: Bool { get }
}

protocol FutureCodexInterface {
    var isCodexBridgeEnabled: Bool { get }
}

protocol FutureOpenClawInterface {
    var isOpenClawBridgeEnabled: Bool { get }
}

protocol FutureGitHubInterface {
    var isGitHubBridgeEnabled: Bool { get }
}

protocol FutureNotionInterface {
    var isNotionBridgeEnabled: Bool { get }
}

protocol FutureSupabaseInterface {
    var isSupabaseBridgeEnabled: Bool { get }
}

protocol FutureCloudflareInterface {
    var isCloudflareBridgeEnabled: Bool { get }
}

protocol FutureAppleShortcutsInterface {
    var isAppleShortcutsBridgeEnabled: Bool { get }
}

protocol FutureLocalLLMInterface {
    var isLocalLLMEnabled: Bool { get }
}

typealias ArchaiosBackendService =
    CommanderProviding &
    AgentNetworkProviding &
    VaultProviding &
    OperationsProviding &
    InfrastructureProviding &
    FounderModeProviding &
    SettingsProviding &
    SupabaseGateway &
    StripeGateway &
    CloudflareGateway &
    OpenAIGateway &
    GitHubGateway &
    CommandRouting &
    FutureOpenAIInterface &
    FutureCodexInterface &
    FutureOpenClawInterface &
    FutureGitHubInterface &
    FutureNotionInterface &
    FutureSupabaseInterface &
    FutureCloudflareInterface &
    FutureAppleShortcutsInterface &
    FutureLocalLLMInterface
