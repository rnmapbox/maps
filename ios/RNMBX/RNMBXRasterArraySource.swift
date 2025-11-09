@_spi(Experimental) import MapboxMaps

@objc
public class RNMBXRasterArraySource : RNMBXSource {
  typealias SourceType = RasterArraySource

  @objc public var url: String? = nil

  @objc public var tileUrlTemplates: [String]? = nil

  @objc public var minZoomLevel: NSNumber?
  @objc public var maxZoomLevel: NSNumber?
  @objc public var tileSize: NSNumber?

  @objc public var sourceBounds: [NSNumber]? = nil

  override func makeSource() -> Source
  {
    #if RNMBX_11
    var result = RasterArraySource(id: self.id)
    #else
    var result = RasterArraySource()
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

    if let bounds = sourceBounds {
      result.bounds = bounds.map { $0.doubleValue }
    }

    return result
  }

}
