import MapboxMaps

@objc
class RNMBXRasterDemSource : RNMBXSource {
  typealias SourceType = RasterDemSource
  
  @objc
  var url: String? = nil
  
  @objc
  var tileUrlTemplates: [String]? = nil
  
  @objc
  var tileSize : NSNumber? = nil
  
  @objc
  var maxZoomLevel : NSNumber? = nil
  
  @objc
  var minZoomLevel : NSNumber? = nil

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func sourceType() -> Source.Type {
    return SourceType.self
  }

  override func makeSource() -> Source
  {
    #if RNMBX_11 // RNMBX_11_TODO
    var result = SourceType(id: "raster-dem-source-id-todo")
    #else
    var result = SourceType()
    #endif
    if let url = url {
      result.url = url
    } else if let tileUrlTemplates = tileUrlTemplates {
      result.tiles = tileUrlTemplates
    } else {
      Logger.log(level: .error, message: "RNMBXRasterDemSource should have either url or tileUrlTemplates ")
      return result
    }
    
    if let tileSize = tileSize {
      result.tileSize = tileSize.doubleValue
    }
    
    if let maxZoomLevel = maxZoomLevel {
      result.maxzoom = maxZoomLevel.doubleValue
    }

    if let minZoomLevel = minZoomLevel {
      result.minzoom = minZoomLevel.doubleValue
    } 
    return result
  }  
}
  
