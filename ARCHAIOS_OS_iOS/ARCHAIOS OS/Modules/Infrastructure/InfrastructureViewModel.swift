import Foundation

@MainActor
final class InfrastructureViewModel: ObservableObject {
    @Published private(set) var signals: [InfrastructureSignal] = []

    private let service: InfrastructureProviding

    init(service: InfrastructureProviding) {
        self.service = service
    }

    func load() async {
        signals = (try? await service.fetchInfrastructureSignals()) ?? []
    }
}
