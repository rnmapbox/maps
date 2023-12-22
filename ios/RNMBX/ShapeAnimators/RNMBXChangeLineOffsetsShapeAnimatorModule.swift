import MapboxMaps
import Turf

@objc
public class ChangeLineOffsetsShapeAnimator: ShapeAnimatorCommon {
  private var lineString: LineString
  
  private struct LineOffset {
    var sourceOffset: Double
    var progressOffset: Double
    var targetOffset: Double
    var startedAt: TimeInterval
    var progressDurationSec: Double
    var totalDurationSec: TimeInterval
    
    var offsetRemaining: Double {
      targetOffset - sourceOffset
    }
    
    var durationRatio: Double {
      min(progressDurationSec / totalDurationSec, 1)
    }
  }
  
  private var startOfLine: LineOffset
    
  init(tag: Int, lineString: LineString, startOffset: Double, endOffset: Double) {
    self.lineString = lineString
    
    startOfLine = .init(
      sourceOffset: startOffset,
      progressOffset: startOffset,
      targetOffset: startOffset,
      startedAt: 0,
      progressDurationSec: 0,
      totalDurationSec: 0
    )
    
    super.init(tag: tag)
    super.start()
  }
  
  override func getShape() -> GeoJSONObject {
    return .geometry(.lineString(lineString))
  }
  
  override func getAnimatedShape() -> GeoJSONObject {
    startOfLine.progressOffset = startOfLine.sourceOffset + (startOfLine.offsetRemaining * startOfLine.durationRatio)
    startOfLine.progressDurationSec = currentTimestamp - startOfLine.startedAt
    
    let totalDistance = lineString.distance() ?? 0
    guard let trimmed = lineString.trimmed(from: startOfLine.progressOffset, to: totalDistance) else {
      return .geometry(.lineString(.init([])))
    }
    
    return .geometry(.lineString(trimmed))
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
    let _coordinates = coordinates.map { coord in
      let coord = coord as! [NSNumber]
      return LocationCoordinate2D(latitude: coord[1].doubleValue, longitude: coord[0].doubleValue)
    }
    let lineString = LineString(_coordinates)
    let animator = ChangeLineOffsetsShapeAnimator(tag: tag.intValue, lineString: lineString, startOffset: startOffset.doubleValue, endOffset: endOffset.doubleValue)
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
  public static func setStartOffset(tag: NSNumber, offset: NSNumber, durationMs: NSNumber, resolve: RCTPromiseResolveBlock, reject: @escaping (_ code: String, _ message: String, _ error: NSError) -> Void) {
    guard let animator = getAnimator(tag: tag) else {
      reject("ChangeLineOffsetsShapeAnimator:moveTo", "Unable to find animator with tag \(tag)", NSError())
      return
    }
    
    animator._setStartOffset(offset: offset.doubleValue, durationSec: durationMs.doubleValue / 1000)
    resolve(tag)
  }
}

// - MARK: Implementation

extension ChangeLineOffsetsShapeAnimator {
  private func _setStartOffset(offset: Double, durationSec: Double) {
    startOfLine = .init(
      sourceOffset: startOfLine.progressOffset,
      progressOffset: startOfLine.progressOffset,
      targetOffset: offset,
      startedAt: currentTimestamp,
      progressDurationSec: 0,
      totalDurationSec: durationSec
    )
  }
}
