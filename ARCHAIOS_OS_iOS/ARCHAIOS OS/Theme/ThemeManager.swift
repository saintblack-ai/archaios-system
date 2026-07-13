import SwiftUI

@MainActor
final class ThemeManager: ObservableObject {
    @Published var theme: ArchaiosTheme

    init(theme: ArchaiosTheme = .command) {
        self.theme = theme
    }

    func toggleTheme() {
        theme = theme == .command ? .vault : .command
    }
}
