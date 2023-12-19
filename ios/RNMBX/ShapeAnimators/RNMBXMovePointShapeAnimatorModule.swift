import MapboxMaps

@objc
public class MovePointShapeAnimator: ShapeAnimatorCommon {
  private var sourceCoord: LocationCoordinate2D
  private var targetCoord: LocationCoordinate2D
  private var progressSec: TimeInterval
  private var totalSec: TimeInterval
  
  init(tag: Int, lng: Double, lat: Double) {
    sourceCoord = LocationCoordinate2D(
      latitude: lat,
      longitude: lng
    )
    targetCoord = sourceCoord
    progressSec = 0
    totalSec = 0
    
    super.init(tag: tag)
    
    super.start()
  }
  
  override func getAnimatedShape(dt: TimeInterval) -> GeoJSONObject {
    print(">>> \(dt), \(totalSec)")
    progressSec += dt
    let line = LineString([sourceCoord, targetCoord])
    let lineLength = line.distance() ?? 0
    let currentCoord = line.coordinateFromStart(distance: lineLength * (progressSec / totalSec))!
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
  public static func create(tag: NSNumber, coordinate: NSArray) -> MovePointShapeAnimator? {
    guard let lng = coordinate[0] as? NSNumber, let lat = coordinate[1] as? NSNumber else {
      return nil
    }
    
    let animator = MovePointShapeAnimator(tag: tag.intValue, lng: lng.doubleValue, lat: lat.doubleValue)
    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    return animator
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
  public static func moveTo(tag: NSNumber, coordinate: NSArray, durationMs: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let lng = coordinate[0] as? Double, let lat = coordinate[1] as? Double else {
      reject("MovePointShapeAnimator:moveTo", "Missing coordinate", NSError())
      return
    }
    
    guard let animator = getAnimator(tag: tag) else {
      reject("MovePointShapeAnimator:moveTo", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    let targetCoord = LocationCoordinate2D(
      latitude: lat,
      longitude: lng
    )
    
    animator._moveTo(coordinate: targetCoord, durationSec: durationMs.doubleValue / 1000)
    resolve(tag)
  }
}

// - MARK: Implementation

extension MovePointShapeAnimator {
  private func _moveTo(coordinate: LocationCoordinate2D, durationSec: Double) {
    sourceCoord = targetCoord
    targetCoord = coordinate
    progressSec = 0
    totalSec = durationSec
  }
}
