import Foundation

@MainActor
final class CommanderViewModel: ObservableObject {
    @Published private(set) var brief: CommanderBrief?
    @Published private(set) var isLoading = false

    private let service: CommanderProviding

    init(service: CommanderProviding) {
        self.service = service
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        brief = try? await service.fetchCommanderBrief()
    }
}
