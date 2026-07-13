import Foundation

@MainActor
final class BlackVaultViewModel: ObservableObject {
    @Published private(set) var items: [VaultItem] = []

    private let service: VaultProviding

    init(service: VaultProviding) {
        self.service = service
    }

    func load() async {
        items = (try? await service.fetchVaultItems()) ?? []
    }
}
