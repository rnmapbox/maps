import MapboxMaps
import Turf

@objc
class RCTMGLLineSource: RCTMGLSource {
  @objc var lineString: String? {
    didSet {
      refresh()
    }
  }
  
  @objc var startOffset: NSNumber? {
    didSet {
      animateToNewOffset(
        prevOffset: currentStartOffset,
        targetOffset: startOffset?.doubleValue
      )
    }
  }
  
  @objc var endOffset: NSNumber? {
    didSet {
      animateToNewOffset(
        prevOffset: currentEndOffset,
        targetOffset: endOffset?.doubleValue
      )
    }
  }
  
  @objc var animationDuration: NSNumber? {
    didSet {
      if let d = animationDuration {
        duration = d.doubleValue / 1000
      } else {
        duration = nil
      }
    }
  }

  private var currentStartOffset: Double = 0
  private var currentEndOffset: Double = 0
  private var duration: TimeInterval?
  private var animLoopTimer: Timer?

  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func animateToNewOffset(prevOffset: Double, targetOffset: Double?) {
    guard let targetOffset = targetOffset else {
      return
    }

    self.animLoopTimer?.invalidate()

    if let duration = duration {
      let fps: Double = 30
      var ratio: Double = 0
      
      self.animLoopTimer = Timer.scheduledTimer(withTimeInterval: duration / fps, repeats: true, block: { t in
        ratio += duration / fps
        let progress = (targetOffset - prevOffset) * ratio
        self.currentStartOffset = prevOffset + progress
        self.refresh()
      })
    } else {
      self.currentStartOffset = targetOffset
      self.refresh()
    }
  }
  
  func refresh() {
    let style = try? updateStyle()
    let geometry = try? getLineGeometry()

    guard let style = style, let geometry = geometry else {
      return
    }
    
    let obj = GeoJSONObject.geometry(.lineString(geometry))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }

  override func makeSource() -> Source {
    var result =  GeoJSONSource()
    if let geometry = try? getLineGeometry() {
      result.data = GeoJSONSourceData.geometry(.lineString(geometry))
    }
    result.lineMetrics = true
    return result
  }
  
  func getLineGeometry() throws -> LineString {
    guard let data = lineString?.data(using: .utf8) else {
      throw RCTMGLError.parseError("shape is not utf8")
    }

    var geometry: LineString
    do {
      geometry = try JSONDecoder().decode(LineString.self, from: data)
    } catch {
      throw RCTMGLError.parseError("data cannot be decoded: \(error.localizedDescription)")
    }
    
    let geometryTrimmed = geometry.trimmed(from: currentStartOffset, to: geometry.distance()! - currentEndOffset)
    guard let geometryTrimmed = geometryTrimmed else {
      throw RCTMGLError.parseError("line could not be trimmed")
    }
    
    return geometryTrimmed
  }
  
  func updateStyle() throws -> Style {
    guard let id = id else {
      throw RCTMGLError.parseError("Update style failed: no id found")
    }
    
    guard let map = self.map, let _ = self.source, map.mapboxMap.style.sourceExists(withId: id) else {
      throw RCTMGLError.parseError("Update style failed: style source does not exist with id \(id)")
    }

    let style = map.mapboxMap.style
    return style
  }

  func updateSource(property: String, value: Any) {
    let style = try? updateStyle()
    try? style?.setSourceProperty(for: id, property: property, value: value)
  }
}
