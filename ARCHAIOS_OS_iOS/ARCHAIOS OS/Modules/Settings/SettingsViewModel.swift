import Foundation

@MainActor
final class SettingsViewModel: ObservableObject {
    @Published private(set) var settings: [SettingsOption] = []

    private let service: SettingsProviding

    init(service: SettingsProviding) {
        self.service = service
    }

    func load() async {
        settings = (try? await service.fetchSettings()) ?? []
    }
}
