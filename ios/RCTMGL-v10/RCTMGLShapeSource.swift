import MapboxMaps
import Turf

@objc
class RCTMGLShapeSource : RCTMGLSource {
  @objc var url : String? {
    didSet {
      parseJSON(url) { [weak self] result in
        guard let self = self else { return }

        switch result {
          case .success(let obj):
            self.doUpdate { (style) in
              logged("RCTMGLShapeSource.setUrl") {
                try style.updateGeoJSONSource(withId: self.id, geoJSON: obj)
              }
            }

          case .failure(let error):
            Logger.log(level: .error, message: ":: Error - update url failed \(error) \(error.localizedDescription)")
        }
      }
    }
  }

  @objc var shape : String? {
    didSet {
      let type = parseType(shape)
      
      switch type {
      case .FeatureCollection, .Feature, .Geometry:
        guard let geoJSONObj = try? parse(shape) else {
          return
        }
        try? map?.mapboxMap.style.updateGeoJSONSource(withId: id, geoJSON: geoJSONObj)
      case .LineString:
        timer?.invalidate()
        currentLineStartOffset = 0.0
        currentLineEndOffset = 0.0
        let targetLine = try? getGeometryAsLine(shape)
        applyGeometryFromLine(targetLine)
      case .Point:
          let targetPoint = try? getGeometryAsPoint(shape)
          let prevPoint = lastUpdatedPoint ?? targetPoint
          if let prevPoint = prevPoint, let targetPoint = targetPoint {
            animateToNewPoint(prevPoint: prevPoint, targetPoint: targetPoint)
          }
      default:
        break
      }
    }
  }
  
  @objc var lineStartOffset: NSNumber? {
    didSet {
      animateToNewLineStartOffset(
        prevOffset: currentLineStartOffset,
        targetOffset: lineStartOffset?.doubleValue
      )
    }
  }
  
  @objc var lineEndOffset: NSNumber? {
    didSet {
      animateToNewLineEndOffset(
        prevOffset: currentLineEndOffset,
        targetOffset: lineEndOffset?.doubleValue
      )
    }
  }
  
  @objc var animationDuration: NSNumber?
  
  @objc var snapIfDistanceIsGreaterThan: NSNumber?

  private func getGeometryAsPoint(_ str: String?) throws -> Point? {
    guard let data = str?.data(using: .utf8) else {
      throw RCTMGLError.parseError("point data could not be parsed as utf-8")
    }
    
    var geometry: Point
    do {
      geometry = try JSONDecoder().decode(Point.self, from: data)
    } catch {
      throw RCTMGLError.parseError("point data could not be decoded: \(error.localizedDescription)")
    }
    
    return geometry
  }

  private func applyGeometryFromPoint(_ point: Point?) {
    guard let style = map?.mapboxMap.style, let geometry = point else {
      return
    }
    
    lastUpdatedPoint = point
    
    let obj = GeoJSONObject.geometry(.point(geometry))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }

  private func animateToNewPoint(prevPoint: Point, targetPoint: Point) {
    self.timer?.invalidate()
    
    let lineBetween = LineString.init([
      prevPoint.coordinates,
      targetPoint.coordinates
    ])
    let distanceBetween = lineBetween.distance() ?? 0
    
    if let snapThreshold = snapIfDistanceIsGreaterThan?.doubleValue, distanceBetween > snapThreshold {
      self.applyGeometryFromPoint(targetPoint)
      return
    }
    
    guard let animationDuration = animationDuration?.doubleValue, animationDuration > 0 else {
      self.applyGeometryFromPoint(targetPoint)
      return
    }
    
    let fps: Double = 30
    var ratio: Double = 0
    
    let durationSec = animationDuration / 1000
    let ratioIncr = 1 / (fps * durationSec)
    let period = 1000 / fps
    
    self.timer = Timer.scheduledTimer(withTimeInterval: period / 1000, repeats: true, block: { t in
      ratio += ratioIncr
      if ratio >= 1 {
        t.invalidate()
        return
      }
      
      let coord = lineBetween.coordinateFromStart(distance: distanceBetween * ratio)!
      let point = Point(coord)
      self.applyGeometryFromPoint(point)
    })
  }

  private func getGeometryAsLine(_ str: String?) throws -> LineString? {
    guard let data = str?.data(using: .utf8) else {
      throw RCTMGLError.parseError("line data could not be parsed as utf-8")
    }

    var lineString: LineString?
    
    do {
      let obj = try JSONDecoder().decode(Feature.self, from: data)
      switch obj.geometry {
      case .lineString(let ls):
        lineString = ls
      default:
        throw RCTMGLError.parseError("geoJSON object is not of type Feature")
      }
    } catch {
      throw RCTMGLError.parseError("line data could not be decoded: \(error.localizedDescription)")
    }
    
    if lineString == nil {
      do {
        let obj = try JSONDecoder().decode(LineString.self, from: data)
        lineString = obj
      } catch {
        throw RCTMGLError.parseError("line data could not be decoded: \(error.localizedDescription)")
      }
    }
    
    return lineString
  }

  func applyGeometryFromLine(_ line: LineString?) {
    guard let style = map?.mapboxMap.style, let geometry = line else {
      return
    }
    
    guard let geometryTrimmed = geometry.trimmed(
      from: currentLineStartOffset,
      to: geometry.distance()! - currentLineEndOffset
    ) else {
      print("[RCTMGLShapeSource] line could not be trimmed")
      return
    }
    
    let obj = GeoJSONObject.geometry(.lineString(geometryTrimmed))
    try? style.updateGeoJSONSource(withId: id, geoJSON: obj)
  }

  func animateToNewLineStartOffset(prevOffset: Double, targetOffset: Double?) {
    guard let targetOffset = targetOffset else {
      return
    }

    self.timer?.invalidate()

    guard let duration = animationDuration?.doubleValue, duration > 0 else {
      currentLineStartOffset = targetOffset
      let lineString = try? getGeometryAsLine(shape)
      applyGeometryFromLine(lineString)
      return
    }
    
    let fps: Double = 30
    var ratio: Double = 0

    let durationSec = duration / 1000
    let ratioIncr = 1 / (fps * durationSec)
    let period = 1000 / fps
    
    self.timer = Timer.scheduledTimer(withTimeInterval: period / 1000, repeats: true, block: { t in
      ratio += ratioIncr
      if ratio >= 1 {
        t.invalidate()
        return
      }
      
      let progress = (targetOffset - prevOffset) * ratio
      self.currentLineStartOffset = prevOffset + progress
      
      let lineString = try? self.getGeometryAsLine(self.shape)
      self.applyGeometryFromLine(lineString)
    })
  }

  func animateToNewLineEndOffset(prevOffset: Double, targetOffset: Double?) {
      print("[RCTMGLShapeSource] animateToNewLineEndOffset is not implemented")
  }


  @objc var cluster : NSNumber?
  @objc var clusterRadius : NSNumber?
  @objc var clusterMaxZoomLevel : NSNumber? {
    didSet {
      logged("RCTMGLShapeSource.clusterMaxZoomLevel") {
        if let number = clusterMaxZoomLevel?.doubleValue {
          doUpdate { (style) in
            logged("RCTMGLShapeSource.doUpdate") {
              try style.setSourceProperty(for: id, property: "clusterMaxZoom", value: number)
            }
          }
        }
      }
    }
  }
  @objc var clusterProperties : [String: [Any]]?;

  @objc var maxZoomLevel : NSNumber?
  @objc var buffer : NSNumber?
  @objc var tolerance : NSNumber?
  @objc var lineMetrics : NSNumber?

  private var lastUpdatedPoint: Point?
  private var currentLineStartOffset: Double = 0.0
  private var currentLineEndOffset: Double = 0.0
  private var timer: Timer?
  
  override func sourceType() -> Source.Type {
    return GeoJSONSource.self
  }

  override func makeSource() -> Source
  {
    var result =  GeoJSONSource()

    if let shape = shape {
      do {
        result.data = try parse(shape)
      } catch {
        Logger.log(level: .error, message: "Unable to read shape: \(shape) \(error) setting it to empty")
        result.data = emptyShape()
      }
    }

    if let url = url {
      result.data = .url(URL(string: url)!)
    }

    if let cluster = cluster {
      result.cluster = cluster.boolValue
    }

    if let clusterRadius = clusterRadius {
      result.clusterRadius = clusterRadius.doubleValue
    }

    if let clusterMaxZoomLevel = clusterMaxZoomLevel {
      result.clusterMaxZoom = clusterMaxZoomLevel.doubleValue
    }

    do {
      if let clusterProperties = clusterProperties {
        result.clusterProperties = try clusterProperties.mapValues { (params : [Any]) in
          let data = try JSONSerialization.data(withJSONObject: params, options: .prettyPrinted)
          let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)

          return decodedExpression
        }
      }
    } catch {
      Logger.log(level: .error, message: "RCTMGLShapeSource.parsing clusterProperties failed", error: error)
    }

    if let maxZoomLevel = maxZoomLevel {
      result.maxzoom = maxZoomLevel.doubleValue
    }

    if let buffer = buffer {
      result.buffer = buffer.doubleValue
    }

    if let tolerance = tolerance {
      result.tolerance = tolerance.doubleValue
    }

    if let lineMetrics = lineMetrics {
      result.lineMetrics = lineMetrics.boolValue
    }

    return result
  }

  func doUpdate(_ update:(Style) -> Void) {
    guard let map = self.map,
          let _ = self.source,
          map.mapboxMap.style.sourceExists(withId: id) else {
      return
    }

    let style = map.mapboxMap.style
    update(style)
  }

  func updateSource(property: String, value: Any) {
    doUpdate { style in
      try! style.setSourceProperty(for: id, property: property, value: value)
    }
  }
}

// MARK: - parseJSON(url)

extension RCTMGLShapeSource
{
  func parseJSON(_ url: String?, completion: @escaping (Result<GeoJSONObject, Error>) -> Void) {
    guard let url = url else { return }

    DispatchQueue.global().async { [url] in
      let result: Result<GeoJSONObject, Error>

      do {
        let data = try Data(contentsOf: URL(string: url)!)
        let obj = try JSONDecoder().decode(GeoJSONObject.self, from: data)

        result = .success(obj)
      } catch {
        result = .failure(error)
      }

      DispatchQueue.main.async {
        completion(result)
      }
    }
  }
}

// MARK: - parse(shape)

enum ShapeType {
  case Geometry, LineString, Point, Feature, FeatureCollection, Url, Unknown
}

extension RCTMGLShapeSource
{
  func parseType(_ shape: String?) -> ShapeType {
    guard let shape = shape else {
      return .Unknown
    }
    
    let data: GeoJSONSourceData
    do {
      data = try parse(shape)
    } catch {
      return .Unknown
    }
    
    switch data {
    case .feature(let feature):
      switch feature.geometry {
      case .lineString:
        return .LineString
      case .point:
        return .Point
      default:
        return .Feature
      }
    case .featureCollection:
      return .FeatureCollection
    case .geometry(let geometry):
      switch geometry {
      case .lineString:
        return .LineString
      case .point:
        return .Point
      default:
        return .Geometry
      }
    case .url:
      return .Url
    default:
      return .Unknown
    }
  }

  func parse(_ shape: String) throws -> GeoJSONSourceData {
    guard let data = shape.data(using: .utf8) else {
      throw RCTMGLError.parseError("shape is not utf8")
    }
    do {
      return try JSONDecoder().decode(GeoJSONSourceData.self, from: data)
    } catch {
      let origError = error
      do {
        // workaround for mapbox issue, GeoJSONSourceData can't decode a single geometry
        let geometry = try JSONDecoder().decode(Geometry.self, from: data)
        return .geometry(geometry)
      } catch {
        throw origError
      }
    }
  }

  func parse(_ shape: String) throws -> Feature {
    guard let data = shape.data(using: .utf8) else {
      throw RCTMGLError.parseError("shape is not utf8")
    }
    return try JSONDecoder().decode(Feature.self, from: data)
  }

  func parse(_ shape: String?) throws -> GeoJSONObject {
    guard let shape = shape else {
      return emptyGeoJSONObject()
    }
    let data : GeoJSONSourceData = try parse(shape)
    switch data {
    case .empty:
      return emptyGeoJSONObject()
    case .feature(let feature):
      return .feature(feature)
    case .featureCollection(let featureCollection):
      return .featureCollection(featureCollection)
    case .geometry(let geometry):
      return .geometry(geometry)
    case .url(_):
      throw RCTMGLError.parseError("url as shape is not supported when updating a ShapeSource")
    }
  }

  func emptyGeoJSONObject() -> GeoJSONObject {
    return .featureCollection(emptyFeatureCollection())
  }

  func emptyShape() -> GeoJSONSourceData {
    return GeoJSONSourceData.featureCollection(FeatureCollection(features:[]))
  }

  func emptyFeatureCollection() -> FeatureCollection {
    return FeatureCollection(features:[])
  }

  func parseAsJSONObject(shape: String?) -> Any? {
    guard let shape = shape else {
      return nil
    }
    guard let data = shape.data(using: .utf8) else {
      Logger.log(level: .error, message: "shapeSource.setShape: Shape is not utf8")
      return nil
    }
    let objs = logged("shapeSource.setShape.parseJSON") {
      try JSONSerialization.jsonObject(with: data)
    }
    return objs
  }
}

// MARK: - getClusterExpansionZoom/getClusterLeaves

extension RCTMGLShapeSource
{
  func getClusterExpansionZoom(
    _ featureJSON: String,
    completion: @escaping (Result<Int, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RCTMGLError.failed("getClusterExpansionZoom: no mapView")))
      return
    }

    logged("RCTMGLShapeSource.getClusterExpansionZoom", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);

      mapView.mapboxMap.queryFeatureExtension(for: self.id, feature: cluster, extension: "supercluster", extensionField: "expansion-zoom") { result in
        switch result {
        case .success(let features):
          guard let value = features.value as? NSNumber else {
            completion(.failure(RCTMGLError.failed("getClusterExpansionZoom: not a number")))
            return
          }

          completion(.success(value.intValue))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }

  func getClusterLeaves(_ featureJSON: String,
                              number: uint,
                              offset: uint,
                              completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RCTMGLError.failed("getClusterLeaves: no mapView")))
      return
    }

    logged("RCTMGLShapeSource.getClusterLeaves", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);
      mapView.mapboxMap.queryFeatureExtension(for: self.id, feature: cluster,  extension: "supercluster", extensionField: "leaves", args: ["limit": UInt64(number),"offset": UInt64(offset)]) {
        result in
        switch result {
        case .success(let features):
          completion(.success(features))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }

  func getClusterChildren(_ featureJSON: String, completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void) {
    guard let mapView = map?.mapView else {
      completion(.failure(RCTMGLError.failed("getClusterChildren: no mapView")))
      return
    }

    logged("RCTMGLShapeSource.getClusterChildren", rejecter: { (_,_,error) in
      completion(.failure(error!))
    }) {
      let cluster : Feature = try parse(featureJSON);
      mapView.mapboxMap.queryFeatureExtension(for: self.id, feature: cluster, extension: "supercluster", extensionField: "children") {
        result in
        switch result {
        case .success(let features):
          completion(.success(features))
        case .failure(let error):
          completion(.failure(error))
        }
      }
    }
  }
}
