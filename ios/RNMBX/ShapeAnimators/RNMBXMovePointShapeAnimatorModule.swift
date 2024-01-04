import MapboxMaps

@objc
public class MovePointShapeAnimator: ShapeAnimatorCommon {
  private var sourceCoord: LocationCoordinate2D
  private var progressCoord: LocationCoordinate2D
  private var targetCoord: LocationCoordinate2D
  
  private var startTimestamp: TimeInterval
  private var totalDurationSec: TimeInterval
  
  init(tag: Int, coordinate: LocationCoordinate2D) {
    sourceCoord = coordinate
    progressCoord = sourceCoord
    targetCoord = sourceCoord
    
    startTimestamp = 0
    totalDurationSec = 0
    
    super.init(tag: tag)
    super.start()
  }
  
  override func getShape() -> GeoJSONObject {
    return .geometry(.point(.init(progressCoord)))
  }
  
  override func getAnimatedShape(currentTimestamp: TimeInterval) -> GeoJSONObject {
    let progressSec = currentTimestamp - startTimestamp
    let line = LineString([sourceCoord, targetCoord])
    let lineLength = line.distance() ?? 0
    progressCoord = line.coordinateFromStart(distance: lineLength * (progressSec / totalDurationSec))!
    return .geometry(.point(.init(progressCoord)))
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
    
    let startCoordinate = LocationCoordinate2D(
      latitude: lat.doubleValue,
      longitude: lng.doubleValue
    )
    let animator = MovePointShapeAnimator(tag: tag.intValue, coordinate: startCoordinate)
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
    sourceCoord = progressCoord
    progressCoord = sourceCoord
    targetCoord = coordinate
    
    startTimestamp = getCurrentTimestamp()
    totalDurationSec = durationSec
  }
}
