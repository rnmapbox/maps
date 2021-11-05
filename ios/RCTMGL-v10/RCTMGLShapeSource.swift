import MapboxMaps
import Turf

@objc
class RCTMGLShapeSource : RCTMGLSource {

  @objc var url : String?

  @objc var shape : String? {
    didSet {
      self.doUpdate { (style) in
        if let shape = shape {
          let geojsonObject = try! RCTMGLFeatureUtils.parseAsFC(string: shape)
          doUpdate { (style) in
            try! style.updateGeoJSONSource(withId: id, geoJSON: geojsonObject)
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

  func parseShape(_ shape: String) -> GeoJSONSourceData {
    guard let data = shape.data(using: .utf8) else {
      fatalError("shape could not be converted to urf8 \(shape)")
    }
    do {
      let geojson = try JSONDecoder().decode(GeoJSONObject.self, from: data)
      switch geojson {
      case .feature(let feature):
        return .feature(feature)
      case .featureCollection(let featureCollection):
        return .featureCollection(featureCollection)
      case .geometry(let geometry):
        return .geometry(geometry)
      }
    } catch {
      let origError = error
      do {
        let feature = Feature(geometry: try JSONDecoder().decode(Geometry.self, from: data))
        return .feature(feature)
      } catch {
        fatalError("Unexpected error: \(error) and \(origError) from \(shape)")
      }
    }
  }
  
  override func makeSource() -> Source
  {
    var result =  GeoJSONSource()
    
    if let shape = shape {
      result.data = parseShape(shape)
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
