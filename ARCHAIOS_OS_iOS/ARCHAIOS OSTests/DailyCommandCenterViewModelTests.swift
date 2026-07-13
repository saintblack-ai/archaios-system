import XCTest
@testable import ARCHAIOS_OS

@MainActor
final class DailyCommandCenterViewModelTests: XCTestCase {
    func testMissionCountdownReportsGapToProductionGate() {
        let viewModel = DailyCommandCenterViewModel(readinessScore: 68)

        XCTAssertEqual(viewModel.missionCountdown, "22 points to production gate")
        XCTAssertEqual(viewModel.completedObjectiveCount, 1)
    }

    func testChecklistGeneratorKeepsWorkLocalAndEvidenceDriven() {
        let viewModel = DailyCommandCenterViewModel()
        let checklist = viewModel.generateChecklist(for: "Morning Brief")

        XCTAssertTrue(checklist.contains("Confirm no production API keys are required."))
        XCTAssertTrue(checklist.contains("Archive evidence in Black Vault."))
    }
}
