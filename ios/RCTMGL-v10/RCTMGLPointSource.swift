import MapboxMaps
import Turf

@objc
class RCTMGLPointSource: RCTMGLSource {
  @objc var point: String? {
    didSet {
      let targetPoint = try? getPointGeometry()
      
      if let prevPoint = lastUpdatedPoint, let targetPoint = targetPoint {
        animateToNewOffset(prevPoint: prevPoint, targetPoint: targetPoint)
      }
      
      lastUpdatedPoint = targetPoint
    }
  }
  
  @objc var animationDuration: NSNumber? {
    didSet {
      if let d = animationDuration {
        duration = d.doubleValue
      } else {
        duration = nil
      }
    }
  }

  private var lastUpdatedPoint: Point?
  private var duration: Double?
  private var animLoopTimer: Timer?

  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  func animateToNewOffset(prevPoint: Point, targetPoint: Point) {
    self.animLoopTimer?.invalidate()

    if let duration = duration {
      let fps: Double = 30
      var ratio: Double = 0

      let frameCt = duration / 1000
      let ratioIncr = 1 / (fps * frameCt)
      let period = 1000 / fps

      let lineBetween = LineString.init([
        prevPoint.coordinates,
        targetPoint.coordinates
      ])
      let distanceBetween = lineBetween.distance() ?? 0
      
      self.animLoopTimer = Timer.scheduledTimer(withTimeInterval: period / 1000, repeats: true, block: { t in
        ratio += ratioIncr
        if ratio >= 1 {
          t.invalidate()
          return
        }
        
        let coord = lineBetween.coordinateFromStart(distance: distanceBetween * ratio)!
        self.refresh(currentPoint: Point(coord))
      })
    } else {
      self.refresh(currentPoint: targetPoint)
    }
  }
  
  func refresh(currentPoint: Point?) {
    let style = try? getStyle()

    guard let style = style, let geometry = currentPoint else {
      return
    }
    
    let obj = GeoJSONObject.geometry(.point(geometry))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }

  override func makeSource() -> Source {
    var result =  GeoJSONSource()
    if let geometry = try? getPointGeometry() {
      result.data = GeoJSONSourceData.geometry(.point(geometry))
    }
    return result
  }
  
  func getPointGeometry() throws -> Point {
    guard let data = point?.data(using: .utf8) else {
      throw RCTMGLError.parseError("shape is not utf8")
    }

    var geometry: Point
    do {
      geometry = try JSONDecoder().decode(Point.self, from: data)
    } catch {
      throw RCTMGLError.parseError("data cannot be decoded: \(error.localizedDescription)")
    }

    return geometry
  }
  
  func getStyle() throws -> Style {
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
    let style = try? getStyle()
    try? style?.setSourceProperty(for: id, property: property, value: value)
  }
}
