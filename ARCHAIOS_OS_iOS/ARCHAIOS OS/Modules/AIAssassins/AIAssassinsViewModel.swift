import Foundation

@MainActor
final class AIAssassinsViewModel: ObservableObject {
    @Published private(set) var agents: [AgentCard] = []

    private let service: AgentNetworkProviding

    init(service: AgentNetworkProviding) {
        self.service = service
    }

    func load() async {
        agents = (try? await service.fetchAgents()) ?? []
    }
}
