import MapboxMaps

@objc
public class MovePointShapeAnimator: ShapeAnimatorCommon {
  private var sourceCoord: LocationCoordinate2D
  private var targetCoord: LocationCoordinate2D
  private var durationProgress: TimeInterval
  
  init(tag: Int, lng: Double, lat: Double) {
    sourceCoord = LocationCoordinate2D(
      latitude: lat,
      longitude: lng
    )
    targetCoord = sourceCoord
    durationProgress = 0
    
    super.init(tag: tag)
    
    super.start()
  }
  
  override func getAnimatedShape(dt: TimeInterval) -> GeoJSONObject {
    durationProgress += dt
    let line = LineString([sourceCoord, targetCoord])
    let lineLength = line.distance() ?? 0
    let currentCoord = line.coordinateFromStart(distance: lineLength * durationProgress)!
    return .geometry(.point(.init(currentCoord)))
  }
  
  private static func getAnimator(tag: NSNumber) -> MovePointShapeAnimator? {
    let animator = ShapeAnimatorManager.shared.get(tag: tag.intValue)
    return animator as? MovePointShapeAnimator
  }
}

// MARK: Exposed functions

extension MovePointShapeAnimator {
  @objc
  public func getTag() -> NSNumber {
    return NSNumber(value: tag)
  }
  
  @objc
  public static func start(tag: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let animator = getAnimator(tag: tag) else {
      return
    }

    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    resolve(tag)
  }
  
  @objc
  public static func moveTo(tag: NSNumber, coordinate: NSArray, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let lng = coordinate[0] as? Double, let lat = coordinate[1] as? Double else {
      return
    }
    
    guard let animator = getAnimator(tag: tag) else {
      return
    }
    
    let targetCoord = LocationCoordinate2D(
      latitude: lat,
      longitude: lng
    )
    animator._moveTo(coordinate: targetCoord)
    
    resolve(tag)
  }
  
  @objc
  public static func create(tag: NSNumber, coordinate: NSArray) -> MovePointShapeAnimator? {
    guard let lng = coordinate[0] as? NSNumber, let lat = coordinate[1] as? NSNumber else {
      return nil
    }
    
    let animator = MovePointShapeAnimator(tag: tag.intValue, lng: lng.doubleValue, lat: lat.doubleValue)
    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    return animator
  }
}

// - MARK: Implementation

extension MovePointShapeAnimator {
  private func _moveTo(coordinate: LocationCoordinate2D) {
    sourceCoord = targetCoord
    targetCoord = coordinate
    durationProgress = 0
  }
}
