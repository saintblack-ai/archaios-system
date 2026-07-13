import Foundation

@MainActor
final class OperationsViewModel: ObservableObject {
    @Published private(set) var operations: [OperationItem] = []

    private let service: OperationsProviding

    init(service: OperationsProviding) {
        self.service = service
    }

    func load() async {
        operations = (try? await service.fetchOperations()) ?? []
    }
}
