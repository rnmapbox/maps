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

}
