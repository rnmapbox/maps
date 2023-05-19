import MapboxMaps
import Turf

@objc
class RCTMGLPointSource: RCTMGLSource {
  @objc var point: String? {
    didSet {
      let targetPoint = try? getPointGeometry()
      let prevPoint = lastUpdatedPoint ?? targetPoint
      
      if let prevPoint = prevPoint, let targetPoint = targetPoint {
        animateToNewPoint(prevPoint: prevPoint, targetPoint: targetPoint)
      }
    }
  }
  
  @objc var animationDuration: NSNumber?
  
  @objc var snapIfDistanceIsGreaterThan: NSNumber?

  private var lastUpdatedPoint: Point?
  private var timer: Timer?

  override init(frame: CGRect) {
    super.init(frame: frame)
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
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
  
  func applyPointGeometry(currentPoint: Point?) {
    let style = try? getStyle()

    guard let style = style, let geometry = currentPoint else {
      return
    }
    
    lastUpdatedPoint = currentPoint
    
    let obj = GeoJSONObject.geometry(.point(geometry))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }

  func animateToNewPoint(prevPoint: Point, targetPoint: Point) {
    self.timer?.invalidate()
    
    let lineBetween = LineString.init([
      prevPoint.coordinates,
      targetPoint.coordinates
    ])
    let distanceBetween = lineBetween.distance() ?? 0
    
    if let snapThreshold = snapIfDistanceIsGreaterThan?.doubleValue, distanceBetween > snapThreshold {
      self.applyPointGeometry(currentPoint: targetPoint)
      return
    }
    
    guard let animationDuration = animationDuration?.doubleValue, animationDuration > 0 else {
      self.applyPointGeometry(currentPoint: targetPoint)
      return
    }

    let fps: Double = 30
    var ratio: Double = 0

    let frameCt = animationDuration / 1000
    let ratioIncr = 1 / (fps * frameCt)
    let period = 1000 / fps

    self.timer = Timer.scheduledTimer(withTimeInterval: period / 1000, repeats: true, block: { t in
      ratio += ratioIncr
      if ratio >= 1 {
        t.invalidate()
        return
      }
      
      let coord = lineBetween.coordinateFromStart(distance: distanceBetween * ratio)!
      let point = Point(coord)
      self.applyPointGeometry(currentPoint: point)
    })
  }
  
  override func makeSource() -> Source {
    var result =  GeoJSONSource()
    if let geometry = try? getPointGeometry() {
      result.data = GeoJSONSourceData.geometry(.point(geometry))
    }
    return result
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
