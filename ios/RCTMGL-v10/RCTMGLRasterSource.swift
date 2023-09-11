import MapboxMaps

@objc
class RCTMGLRasterSource : RCTMGLSource {
  typealias SourceType = RasterSource

  @objc var url: String? = nil
  
  @objc var tileUrlTemplates: [String]? = nil
  
  @objc var minZoomLevel: NSNumber?
  @objc var maxZoomLevel: NSNumber?
  @objc var tileSize: NSNumber?
  
  @objc var tms: Bool = false
  
  @objc var attribution: String?

  override func makeSource() -> Source
  {
    #if RNMBX_11
    var result = RasterSource(id: self.id)
    #else
    var result = RasterSource()
    #endif
    if let url = url {
      result.url = url
    } else {
      result.tiles = tileUrlTemplates
    }
    
    if let tileSize = tileSize {
      result.tileSize = tileSize.doubleValue
    }
    
    if let minZoomLevel = minZoomLevel {
      result.minzoom = minZoomLevel.doubleValue
    }
    
    if let maxZoomLevel = maxZoomLevel {
      result.maxzoom = maxZoomLevel.doubleValue
    }
    
    if tms {
      result.scheme = .tms
    }
    
    if let attribution = attribution {
      result.attribution = attribution
    }
    
    return result
  }

}
