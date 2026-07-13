import XCTest
@testable import ARCHAIOS_OS

final class MockBackendServicesTests: XCTestCase {
    func testMockVaultItemsIncludeTagsAndBodies() async throws {
        let service = MockArchaiosBackendService()
        let items = try await service.fetchVaultItems()

        XCTAssertFalse(items.isEmpty)
        XCTAssertTrue(items.allSatisfy { !$0.tags.isEmpty })
        XCTAssertTrue(items.allSatisfy { !$0.body.isEmpty })
    }

    func testMockInfrastructureKeepsProductionDisconnected() async throws {
        let service = MockArchaiosBackendService()

        let modelStatus = try await service.verifyModelAccess()
        XCTAssertEqual(modelStatus, .standby)
    }
}
