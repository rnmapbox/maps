import MapboxMaps
import Turf

@objc
class RCTMGLShapeSource : RCTMGLSource {

  @objc var url : String?
  @objc var shape : String? {
    didSet {
      self.doUpdate { (style) in
        if let shape = shape {
          let data = shape.data(using: .utf8)!
          let geojson = try! GeoJSON.parse(data)
          if let featureCollection = geojson.decodedFeatureCollection {
            print("Feature collection:\(featureCollection)")
            doUpdate { (style) in
              try! style.updateGeoJSONSource(withId: id, geoJSON: featureCollection)
            }
//            updateSource(property: "data", value: GeoJSONSourceData.featureCollection(featureCollection))
          } else if let feature = geojson.decodedFeature {
            print("Feature :\(feature)")
            doUpdate { (style) in
              try! style.updateGeoJSONSource(withId: id, geoJSON: feature)
            }

//            updateSource(property: "data", value: GeoJSONSourceData.feature(feature))
          } else {
            fatalError("shape is neither feature nor featureCollection \(shape)")
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
      let data = shape.data(using: .utf8)!
      let geojson = try! GeoJSON.parse(data)
      if let featureCollection = geojson.decodedFeatureCollection {
        result.data = .featureCollection(featureCollection)
      } else if let feature = geojson.decodedFeature {
        result.data = .feature(feature)
      } else {
        fatalError("shape is neither feature nor featureCollection: \(shape)")
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
      print("[[[ Before setSourceProperty \(id) \(value)")
      try! style.setSourceProperty(for: id, property: property, value: value)
      print("]]] After setSourceProperty \(id) \(value)")
    }
  }

}
