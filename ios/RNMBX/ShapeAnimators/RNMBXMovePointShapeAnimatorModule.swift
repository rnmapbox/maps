import MapboxMaps

private let LOG_TAG = "MovePointShapeAnimator"

@objc
public class MovePointShapeAnimator: ShapeAnimatorCommon {
  private var point: AnimatableElement<LocationCoordinate2D>
  
  init(tag: Int, coordinate: LocationCoordinate2D) {
    point = AnimatableElement<LocationCoordinate2D>(
      source: coordinate,
      progress: coordinate,
      target: coordinate,
      startedAtSec: 0,
      progressDurationSec: 0,
      totalDurationSec: 0,
      getDistanceRemaining: { a, b in a.distance(to: b)  }
    )
    
    super.init(tag: tag)
  }
  
  override func getShape() -> GeoJSONObject {
    return .geometry(.point(.init(point.progress)))
  }
  
  override func getAnimatedShape(animatorAgeSec: TimeInterval) -> GeoJSONObject {
    let line = LineString([point.source, point.target])
    let lineLength = line.distance() ?? 0
    if lineLength == 0 {
      stop()
    }
    
    let ratio = point.durationRatio()
    if ratio >= 0, ratio < 1, let progressCoordinate = line.coordinateFromStart(distance: lineLength * ratio) {
      point.setProgress(value: progressCoordinate, animatorAgeSec: animatorAgeSec)
    } else if (ratio >= 1) {
      stop()
    }
    
    return .geometry(.point(.init(point.progress)))
  }
  
  private func moveTo(coordinate: LocationCoordinate2D, durationSec: TimeInterval) {
    if durationSec == 0 {
      point.reset(
        _source: coordinate,
        _progress: coordinate,
        _target: coordinate,
        durationSec: durationSec,
        animatorAgeSec: getAnimatorAgeSec()
      )
      refresh()
    } else {
      start()
      point.reset(
        _source: point.progress,
        _progress: point.progress,
        _target: coordinate,
        durationSec: durationSec,
        animatorAgeSec: getAnimatorAgeSec()
      )
    }
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
  public static func create(tag: NSNumber, startCoordinate: NSArray) -> MovePointShapeAnimator? {
    guard let lng = startCoordinate[0] as? NSNumber, let lat = startCoordinate[1] as? NSNumber else {
      return nil
    }
    
    let coordinate = LocationCoordinate2D(
      latitude: lat.doubleValue,
      longitude: lng.doubleValue
    )
    let animator = MovePointShapeAnimator(tag: tag.intValue, coordinate: coordinate)
    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    return animator
  }

  @objc
  public static func moveTo(tag: NSNumber, coordinate: NSArray, durationMs: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let lng = coordinate[0] as? Double, let lat = coordinate[1] as? Double else {
      reject("\(LOG_TAG): moveTo", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    guard let animator = getAnimator(tag: tag) else {
      reject("\(LOG_TAG): moveTo", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    let targetCoord = LocationCoordinate2D(
      latitude: lat,
      longitude: lng
    )
    
    animator.moveTo(coordinate: targetCoord, durationSec: durationMs.doubleValue / 1000)
    resolve(tag)
  }
}
