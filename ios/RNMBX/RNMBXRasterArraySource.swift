#if RNMBX_11
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
    // Note: tileSize and bounds are read-only after initialization in RasterArraySource
    // They can only be set via the constructor or are derived from the source
    var result = RasterArraySource(id: self.id)
    if let url = url {
      result.url = url
    } else {
      result.tiles = tileUrlTemplates
    }

    if let minZoomLevel = minZoomLevel {
      result.minzoom = minZoomLevel.doubleValue
    }

    if let maxZoomLevel = maxZoomLevel {
      result.maxzoom = maxZoomLevel.doubleValue
    }

    // Note: tileSize and bounds are read-only properties in RasterArraySource
    // and cannot be set directly. They are either:
    // - Derived from the TileJSON when using url
    // - Use default values when using tiles
    // If custom values are needed, they should be included in the TileJSON response

    return result
  }

}
#endif
