import MapboxMaps

@objc
class RCTMGLRasterSource : RCTMGLSource {
  typealias SourceType = RasterSource

  @objc var url: String? = nil
  
  @objc var tileUrlTemplates: [String]? = nil
  
  @objc var minzoom: NSNumber?
  @objc var maxzoom: NSNumber?
  @objc var tileSize: NSNumber?
  
  @objc var tms: Bool = false
  
  @objc var attribution: String?

  override func makeSource() -> Source
  {
    var result = RasterSource()
    if let url = url {
      result.url = url
    } else {
      result.tiles = tileUrlTemplates
    }
    
    if let tileSize = tileSize {
      result.tileSize = tileSize.doubleValue
    }
    
    if let minzoom = minzoom {
      result.minzoom = minzoom.doubleValue
    }
    
    if let maxzoom = maxzoom {
      result.maxzoom = maxzoom.doubleValue
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
