import MapboxMaps

class DummyShapeAnimator: ShapeAnimatorBase {
  var start = LocationCoordinate2D(latitude: 40.71427, longitude: -74.00597)
  
  override func getShape() -> GeoJSONObject {
    return .geometry(.point(Point(LocationCoordinate2D(latitude: 40.71427, longitude: -74.00597))))
  }
  
  override func getAnimatedShape(timeIntervalSinceStart: TimeInterval) -> GeoJSONObject {
    return .geometry(.point(Point(LocationCoordinate2D(latitude: start.latitude + timeIntervalSinceStart / 2000.0, longitude: start.longitude + timeIntervalSinceStart / 2000.0))))
  }
}

@objc(RNDummyShapeAnimatorModule)
class RNDummyShapeAnimatorModule : NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
      return true
  }

  @objc
  func create(_ tag: NSNumber,
              startLocation: [String: Any],
              resolver:@escaping RCTPromiseResolveBlock,
              rejecter:@escaping RCTPromiseRejectBlock
  ) {
    let animator = DummyShapeAnimator()
    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    resolver(tag)
  }

  @objc
  func start(_ tag: NSNumber) {
    ShapeAnimatorManager.shared.withAnimator(tag: tag) { $0.start() }
  }
}
