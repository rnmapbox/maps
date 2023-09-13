import MapboxMaps

@objc
public class MBXRasterDemSource : MBXSource {
  typealias SourceType = RasterDemSource
  
  @objc
    public var url: String? = nil
  
  @objc
    public var tileUrlTemplates: [String]? = nil
  
  @objc
    public var tileSize : NSNumber? = nil
  
  @objc
    public var maxZoomLevel : NSNumber? = nil
  
  @objc
    public var minZoomLevel : NSNumber? = nil

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func sourceType() -> Source.Type {
    return SourceType.self
  }

  override func makeSource() -> Source
  {
    var result = SourceType()
    if let url = url {
      result.url = url
    } else if let tileUrlTemplates = tileUrlTemplates {
      result.tiles = tileUrlTemplates
    } else {
      Logger.log(level: .error, message: "RCTMGLRasterDemSource should have either url or tileUrlTemplates ")
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
  
