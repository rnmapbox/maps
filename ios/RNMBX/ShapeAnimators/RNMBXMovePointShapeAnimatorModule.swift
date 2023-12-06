import MapboxMaps

@objc
public class MovePointShapeAnimator: ShapeAnimatorCommon {
  let start: LocationCoordinate2D
  
  init(tag: Int, lng: Double, lat: Double) {
    self.start = LocationCoordinate2D(latitude: lat, longitude: lng)
    super.init(tag: tag)
  }
  
  override func getAnimatedShape(timeIntervalSinceStart: TimeInterval) -> GeoJSONObject {
    return .geometry(.point(Point(LocationCoordinate2D(latitude: start.latitude + timeIntervalSinceStart * 0.01, longitude: start.longitude + timeIntervalSinceStart * 0.01))))
  }
}

// MARK: Manager functions

extension MovePointShapeAnimator {
  @objc
  public func getTag() -> NSNumber
  {
    return NSNumber(value: tag)
  }
  
  @objc
  public static func start(tag: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    if let animator = ShapeAnimatorManager.shared.get(tag: tag.intValue), let animator = animator as? MovePointShapeAnimator {
      ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
      resolve(tag)
    } else {
      Logger.log(level: .error, message: "MovePointShapeAnimator: Unable to find MovePointShapeAnimator for tag: \(tag)")
      reject("TagNotFound", "MovePointShapeAnimator: Unable to find MovePointShapeAnimator for tag: \(tag)", NSError())
    }
  }
  
  @objc
  public static func create(tag: NSNumber, coordinate: NSArray) -> MovePointShapeAnimator? {
    if let lng = coordinate[0] as? NSNumber,
       let lat = coordinate[1] as? NSNumber {
      var animator = MovePointShapeAnimator(tag: tag.intValue, lng: lng.doubleValue, lat: lat.doubleValue)
      ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
      return animator
    }
    return nil
  }
}
