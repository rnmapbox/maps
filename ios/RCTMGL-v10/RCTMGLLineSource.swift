import MapboxMaps
import Turf

@objc
class RCTMGLLineSource: RCTMGLSource {
  @objc var lineString: String? {
    didSet {
      timer?.invalidate()
      timer = nil
      currentStartOffset = 0
      currentEndOffset = 0
      
      applyLineGeometry()
    }
  }
  
  @objc var startOffset: NSNumber? {
    didSet {
      animateToNewStartOffset(
        prevOffset: currentStartOffset,
        targetOffset: startOffset?.doubleValue
      )
    }
  }
  
  @objc var endOffset: NSNumber? {
    didSet {
      animateToNewEndOffset(
        prevOffset: currentEndOffset,
        targetOffset: endOffset?.doubleValue
      )
    }
  }
  
  @objc var animationDuration: NSNumber?

  private var currentStartOffset: Double = 0
  private var currentEndOffset: Double = 0
  private var timer: Timer?

  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  func buildLineGeometry() throws -> LineString {
    guard let data = lineString?.data(using: .utf8) else {
      throw RCTMGLError.parseError("line data could not be parsed")
    }
    
    var geometry: LineString
    do {
      geometry = try JSONDecoder().decode(LineString.self, from: data)
    } catch {
      throw RCTMGLError.parseError("line string could not decoded: \(error.localizedDescription)")
    }
    
    return geometry
  }
  
  func applyLineGeometry() {
    let style = try? getStyle()
    let geometry = try? buildLineGeometry()
    guard let style = style, let geometry = geometry else {
      return
    }
    
    let geometryTrimmed = geometry.trimmed(
      from: currentStartOffset,
      to: geometry.distance()! - currentEndOffset
    )
    guard let geometryTrimmed = geometryTrimmed else {
      print("line could not be trimmed")
      return
    }
    
    let obj = GeoJSONObject.geometry(.lineString(geometryTrimmed))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }
  
  func animateToNewStartOffset(prevOffset: Double, targetOffset: Double?) {
    guard let targetOffset = targetOffset else {
      return
    }

    self.timer?.invalidate()

    guard let duration = animationDuration?.doubleValue, duration > 0 else {
      self.currentStartOffset = targetOffset
      self.applyLineGeometry()
      return
    }
    
    let fps: Double = 30
    var ratio: Double = 0

    let frameCt = duration / 1000
    let ratioIncr = 1 / (fps * frameCt)
    let period = 1000 / fps
    
    self.timer = Timer.scheduledTimer(withTimeInterval: period / 1000, repeats: true, block: { t in
      ratio += ratioIncr
      if ratio >= 1 {
        t.invalidate()
        return
      }
      
      let progress = (targetOffset - prevOffset) * ratio
      self.currentStartOffset = prevOffset + progress
      self.applyLineGeometry()
    })
  }
  
  func animateToNewEndOffset(prevOffset: Double, targetOffset: Double?) {
    print("animateToNewEndOffset is not implemented")
  }
  
  override func makeSource() -> Source {
    var result =  GeoJSONSource()
    if let geometry = try? buildLineGeometry() {
      result.data = GeoJSONSourceData.geometry(.lineString(geometry))
    }
    result.lineMetrics = true
    return result
  }
  
  func getStyle() throws -> Style {
    guard let id = id else {
      throw RCTMGLError.parseError("update style failed: no id found")
    }
    
    guard let map = self.map, let _ = self.source, map.mapboxMap.style.sourceExists(withId: id) else {
      throw RCTMGLError.parseError("update style failed: style source does not exist with id \(id)")
    }

    let style = map.mapboxMap.style
    return style
  }
}
