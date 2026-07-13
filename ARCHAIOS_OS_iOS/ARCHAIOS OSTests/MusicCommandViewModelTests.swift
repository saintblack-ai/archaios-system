import XCTest
@testable import ARCHAIOS_OS

@MainActor
final class MusicCommandViewModelTests: XCTestCase {
    func testPrimaryProjectUsesHighestProgressTracker() {
        let viewModel = MusicCommandViewModel()

        XCTAssertEqual(viewModel.primaryProject?.title, "Jugg 'Em")
    }

    func testNoteCategoriesCoverDailyMusicWorkflow() {
        let viewModel = MusicCommandViewModel()

        XCTAssertEqual(viewModel.noteCategories(), ["Song Idea", "Lyrics", "Visual Concept", "Release Plan", "Studio Task"])
    }
}
