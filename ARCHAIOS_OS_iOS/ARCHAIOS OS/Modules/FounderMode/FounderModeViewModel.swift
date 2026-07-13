import Foundation

@MainActor
final class FounderModeViewModel: ObservableObject {
    @Published private(set) var metrics: [FounderMetric] = []

    private let service: FounderModeProviding

    init(service: FounderModeProviding) {
        self.service = service
    }

    func load() async {
        metrics = (try? await service.fetchFounderMetrics()) ?? []
    }
}
