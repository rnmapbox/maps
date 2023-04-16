import MapboxMaps

@objc
class RCTMGLRasterSource: RCTMGLSource {
  typealias SourceType = RasterSource

  @objc var url: String?

  @objc var tileUrlTemplates: [String]?

  @objc var minZoomLevel: NSNumber?
  @objc var maxZoomLevel: NSNumber?
  @objc var tileSize: NSNumber?

  @objc var tms = false

  @objc var attribution: String?

  override func makeSource() -> Source {
    var result = RasterSource()
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
