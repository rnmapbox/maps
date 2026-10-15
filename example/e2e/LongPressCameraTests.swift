import XCTest

final class LongPressCameraTests: XCTestCase {
  private let app = XCUIApplication(bundleIdentifier: "org.reactjs.native.example.RNMapboxExample")
  private let initialCenter = [-0.15, 51.51]

  private struct CameraState: Decodable {
    let target: [Double]?
    let center: [Double]
    let zoom: Double
    let gestureActive: Bool
  }

  override func setUpWithError() throws {
    continueAfterFailure = false
    app.launchArguments = []
    if let host = ProcessInfo.processInfo.environment["RNMBX_METRO_HOST"], !host.isEmpty {
      app.launchArguments = ["-RCT_jsLocation", host]
    }
    XCUIDevice.shared.orientation = .portrait
    app.launch()
    let result = app.staticTexts["long-press-result"]
    if !result.waitForExistence(timeout: 5) {
      let camera = app.otherElements.matching(NSPredicate(format: "label BEGINSWITH %@", "Camera,")).firstMatch
      XCTAssertTrue(camera.waitForExistence(timeout: 60), app.debugDescription)
      camera.tap()
      let example = app.otherElements.matching(NSPredicate(format: "label BEGINSWITH %@", "Long Press Camera,")).firstMatch
      for _ in 0..<10 {
        if example.isHittable { break }
        app.swipeUp()
      }
      XCTAssertTrue(example.isHittable, app.debugDescription)
      example.tap()
    }
    XCTAssertTrue(result.waitForExistence(timeout: 30), app.debugDescription)
  }

  func testFlyTo() throws { try checkCamera("flyTo") }
  func testEaseTo() throws { try checkCamera("easeTo") }
  func testMoveTo() throws { try checkCamera("moveTo") }
  func testMoveBy() throws { try checkCamera("moveBy") }
  func testScaleBy() throws { try checkCamera("scaleBy") }

  private func readState() throws -> CameraState {
    let result = app.staticTexts["long-press-result"]
    XCTAssertTrue(result.waitForExistence(timeout: 10))
    let data = try XCTUnwrap(result.label.data(using: .utf8), result.label)
    let state = try JSONDecoder().decode(CameraState.self, from: data)
    XCTAssertEqual(state.center.count, 2)
    return state
  }

  private func distance(_ a: [Double], _ b: [Double]) -> Double {
    zip(a, b).map { abs($0 - $1) }.max()!
  }

  private func hold(_ start: XCUICoordinate, drift: CGFloat) throws -> CameraState {
    start.press(
      forDuration: 1.5,
      thenDragTo: start.withOffset(CGVector(dx: drift, dy: 0)),
      withVelocity: XCUIGestureVelocity(rawValue: 8),
      thenHoldForDuration: 3
    )
    // The example samples 2.2 seconds after its long-press callback, before release.
    return try readState()
  }

  private func checkCamera(_ mode: String) throws {
    let modeButton = app.buttons.matching(NSPredicate(format: "label BEGINSWITH %@", "Mode: ")).firstMatch
    for _ in 0..<6 {
      if modeButton.label == "Mode: \(mode)" { break }
      modeButton.tap()
    }
    XCTAssertEqual(modeButton.label, "Mode: \(mode)")
    let map = app.descendants(matching: .any)["long-press-map"].firstMatch
    XCTAssertTrue(map.waitForExistence(timeout: 10))
    let start = map.coordinate(withNormalizedOffset: CGVector(dx: 0.75, dy: 0.65))

    // Relative destinations come from a stationary run of the same camera command.
    var stationary: CameraState?
    if mode == "moveBy" || mode == "scaleBy" {
      app.buttons["Reset camera"].tap()
      stationary = try hold(start, drift: 0)
      if mode == "moveBy" {
        XCTAssertGreaterThan(distance(stationary!.center, initialCenter), 0.00001)
      }
      XCTAssertEqual(stationary!.zoom, mode == "scaleBy" ? 17 : 16, accuracy: 0.0001)
    }

    app.buttons["Reset camera"].tap()
    let held = try hold(start, drift: 8)
    let expected = try XCTUnwrap(stationary?.center ?? held.target)
    XCTAssertEqual(expected.count, 2)
    XCTAssertLessThan(distance(held.center, expected), 0.000001)
    XCTAssertEqual(held.zoom, mode == "scaleBy" ? 17 : 16, accuracy: 0.0001)
    XCTAssertFalse(held.gestureActive)

    app.buttons["Read camera"].tap()
    let released = try readState()
    XCTAssertLessThan(distance(released.center, expected), 0.000001)
    XCTAssertEqual(released.zoom, held.zoom, accuracy: 0.0001)
    print("IOS_LONG_PRESS \(mode) held=\(held.center) released=\(released.center) zoom=\(held.zoom)")

    start.press(
      forDuration: 0,
      thenDragTo: start.withOffset(CGVector(dx: -80, dy: 0)),
      withVelocity: .slow,
      thenHoldForDuration: 0
    )
    app.buttons["Read camera"].tap()
    XCTAssertGreaterThan(distance(try readState().center, released.center), 0.00001)
  }
}
