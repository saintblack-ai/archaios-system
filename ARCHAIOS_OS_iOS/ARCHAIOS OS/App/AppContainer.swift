import Foundation

@MainActor
final class AppContainer: ObservableObject {
    let backend: ArchaiosBackendService
    let themeManager: ThemeManager

    init(backend: ArchaiosBackendService, themeManager: ThemeManager) {
        self.backend = backend
        self.themeManager = themeManager
    }

    static let preview = AppContainer(
        backend: MockArchaiosBackendService(),
        themeManager: ThemeManager()
    )
}
