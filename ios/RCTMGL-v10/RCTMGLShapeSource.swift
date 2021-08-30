import MapboxMaps
import Turf

@objc
class RCTMGLShapeSource : RCTMGLSource {

  @objc var url : String?
  @objc var shape : String?
  
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

}
