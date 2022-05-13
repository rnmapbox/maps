import MapboxMaps
import Turf

@objc
class RCTMGLShapeSource : RCTMGLSource {
  @objc var url : String?

  @objc var shape : String? {
    didSet {
      logged("RCTMGLShapeSource.updateShape") {
        let obj : GeoJSONObject = try parse(shape)

        doUpdate { (style) in
          logged("RCTMGLShapeSource.setShape") {
            try style.updateGeoJSONSource(withId: id, geoJSON: obj)
          }
        }
      }
    }
  }
  
  @objc var cluster : NSNumber?
  @objc var clusterRadius : NSNumber?
  @objc var clusterMaxZoomLevel : NSNumber?
  
  @objc var maxZoomLevel : NSNumber?
  @objc var buffer : NSNumber?
  @objc var tolerance : NSNumber?
  @objc var lineMetrics : NSNumber?
  
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

// MARK: - parse(shape)

extension RCTMGLShapeSource
{
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
    case .featureCollection(let featureColleciton):
      return .featureCollection(featureColleciton)
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
    _ clusterId: NSNumber,
    completion: @escaping (Result<Int, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RCTMGLError.failed("getClusterExpansionZoom: no mapView")))
      return
    }

    let options = SourceQueryOptions(sourceLayerIds: nil, filter: Exp(.eq) {
      Exp(.get) { "cluster_id" }
      clusterId.uintValue
    })
    mapView.mapboxMap.querySourceFeatures(for: id, options: options) { result in
      switch result {
      case .success(let features):
        let cluster = features[0]
        mapView.mapboxMap.queryFeatureExtension(for: self.id, feature: cluster.feature, extension: "supercluster", extensionField: "expansion-zoom") { result in
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
      case .failure(let error):
        completion(.failure(error))
      }
    }
  }
  
  func getClusterLeaves(_ clusterId: NSNumber,
                              number: uint,
                              offset: uint,
                              completion: @escaping (Result<FeatureExtensionValue, Error>) -> Void)
  {
    guard let mapView = map?.mapView else {
      completion(.failure(RCTMGLError.failed("getClusterLeaves: no mapView")))
      return
    }
    
    let options = SourceQueryOptions(sourceLayerIds: nil, filter: Exp(.eq) {
      Exp(.get) { "cluster_id" }
      clusterId.uintValue
    })
    mapView.mapboxMap.querySourceFeatures(for: id, options: options) { result in
      switch result {
      case .success(let features):
        let cluster = features[0]
        mapView.mapboxMap.queryFeatureExtension(for: self.id, feature: cluster.feature, extension: "supercluster", extensionField: "leaves") {
          result in
          switch result {
          case .success(let features):
            completion(.success(features))
          case .failure(let error):
            completion(.failure(error))
          }
        }
        
      case .failure(let error):
        completion(.failure(error))
      }
    }
  }
}
