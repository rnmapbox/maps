import MapboxMaps

@objc
class RCTMGLRasterDemSource: RCTMGLSource {
  typealias SourceType = RasterDemSource

  @objc
  var url: String?

  @objc
  var tileUrlTemplates: [String]?

  @objc
  var tileSize: NSNumber?

  @objc
  var maxZoomLevel: NSNumber?

  @objc
  var minZoomLevel: NSNumber?

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func sourceType() -> Source.Type {
    return SourceType.self
  }

  override func makeSource() -> Source {
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
