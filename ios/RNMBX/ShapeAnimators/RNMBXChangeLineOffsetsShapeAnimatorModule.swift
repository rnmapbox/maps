import MapboxMaps
import Turf

@objc
public class ChangeLineOffsetsShapeAnimator: ShapeAnimatorCommon {
  private var lineString: LineString
  private var startOfLine: AnimatableElement<Double>
  private var endOfLine: AnimatableElement<Double>
  
  init(tag: Int, lineString: LineString, startOffset: Double, endOffset: Double) {
    self.lineString = lineString
    self.startOfLine = AnimatableElement<Double>(
      source: startOffset,
      progress: startOffset,
      target: startOffset,
      startedAtSec: 0,
      progressDurationSec: 0,
      totalDurationSec: 0,
      getDistanceRemaining: { a, b in b - a }
    )
    self.endOfLine = AnimatableElement<Double>(
      source: endOffset,
      progress: endOffset,
      target: endOffset,
      startedAtSec: 0,
      progressDurationSec: 0,
      totalDurationSec: 0,
      getDistanceRemaining: { a, b in b - a }
    )
    
    super.init(tag: tag)
  }
  
  override func getShape() -> GeoJSONObject {
    return .geometry(.lineString(lineString))
  }
  
  override func getAnimatedShape(currentTimestamp: TimeInterval) -> GeoJSONObject {
    if (startOfLine.durationRatio() < 1) {
      startOfLine.setProgress(
        value: startOfLine.source + (startOfLine.distanceRemaining() * startOfLine.durationRatio()),
        currentTimestamp: currentTimestamp
      )
    }
    
    if (endOfLine.durationRatio() < 1) {
      endOfLine.setProgress(
        value: endOfLine.source + (endOfLine.distanceRemaining() * endOfLine.durationRatio()),
        currentTimestamp: currentTimestamp
      )
    }
    
    if (startOfLine.durationRatio() >= 1 && endOfLine.durationRatio() >= 1) {
      stop()
    }
    
    if (lineString.coordinates.count < 2) {
      return emptyGeoJsonObj
    }
    
    guard let totalDistance = lineString.distance(), totalDistance > 0 else {
      return emptyGeoJsonObj
    }
    
    if (startOfLine.progress + endOfLine.progress >= totalDistance) {
      return emptyGeoJsonObj
    }
    
    guard let trimmed = lineString.trimmed(from: startOfLine.progress, to: totalDistance - endOfLine.progress) else {
      return emptyGeoJsonObj
    }
    
    return .geometry(.lineString(trimmed))
  }
  
  private func _setLineString(lineString: LineString) {
    self.lineString = lineString
  }
  
  private func _setStartOffset(offset: Double, durationSec: TimeInterval) {
    start()
    startOfLine.reset(
      _source: startOfLine.progress,
      _progress: startOfLine.progress,
      _target: offset,
      durationSec: durationSec,
      currentTimestamp: getCurrentTimestamp()
    )
  }
  
  private func _setEndOffset(offset: Double, durationSec: TimeInterval) {
    start()
    endOfLine.reset(
      _source: endOfLine.progress,
      _progress: endOfLine.progress,
      _target: offset,
      durationSec: durationSec,
      currentTimestamp: getCurrentTimestamp()
    )
  }
  
  private static func getAnimator(tag: NSNumber) -> ChangeLineOffsetsShapeAnimator? {
    let animator = ShapeAnimatorManager.shared.get(tag: tag.intValue)
    return animator as? ChangeLineOffsetsShapeAnimator
  }
}

// MARK: Exposed functions

extension ChangeLineOffsetsShapeAnimator {
  @objc
  public func getTag() -> NSNumber {
    return NSNumber(value: tag)
  }

  @objc
  public static func create(tag: NSNumber, coordinates: NSArray, startOffset: NSNumber, endOffset: NSNumber) -> ChangeLineOffsetsShapeAnimator? {
    let lineString = buildLineString(_coordinates: coordinates)
    let animator = ChangeLineOffsetsShapeAnimator(tag: tag.intValue, lineString: lineString, startOffset: startOffset.doubleValue, endOffset: endOffset.doubleValue)
    ShapeAnimatorManager.shared.register(tag: tag.intValue, animator: animator)
    return animator
  }

  @objc
  public static func setLineString(tag: NSNumber, coordinates: NSArray, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    let lineString = buildLineString(_coordinates: coordinates)
    guard let animator = getAnimator(tag: tag) else {
      reject("ChangeLineOffsetsShapeAnimator:setLineString", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    animator._setLineString(lineString: lineString)
    resolve(tag)
  }
  
  @objc
  public static func setStartOffset(tag: NSNumber, offset: NSNumber, durationMs: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let animator = getAnimator(tag: tag) else {
      reject("ChangeLineOffsetsShapeAnimator:setStartOffset", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    animator._setStartOffset(offset: offset.doubleValue, durationSec: durationMs.doubleValue / 1000)
    resolve(tag)
  }
  
  @objc
  public static func setEndOffset(tag: NSNumber, offset: NSNumber, durationMs: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let animator = getAnimator(tag: tag) else {
      reject("ChangeLineOffsetsShapeAnimator:setEndOffset", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    animator._setEndOffset(offset: offset.doubleValue, durationSec: durationMs.doubleValue / 1000)
    resolve(tag)
  }
}

// - MARK: Utils

private func buildLineString(_coordinates: NSArray) -> LineString {
  let coordinates = _coordinates.map { coord in
    let coord = coord as! [NSNumber]
    return LocationCoordinate2D(latitude: coord[1].doubleValue, longitude: coord[0].doubleValue)
  }
  
  return .init(coordinates)
}
