import MapboxMaps

@objc
public class RNMBXRasterSource : RNMBXSource {
  typealias SourceType = RasterSource

  @objc public var url: String? = nil

  @objc public var tileUrlTemplates: [String]? = nil

  @objc public var minZoomLevel: NSNumber?
  @objc public var maxZoomLevel: NSNumber?
  @objc public var tileSize: NSNumber?

  @objc public var tms: Bool = false

  @objc public var attribution: String?

  @objc public var sourceBounds: [NSNumber]? = nil

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

    if let bounds = sourceBounds {
      result.bounds = bounds.map { $0.doubleValue }
    }

    return result
  }

}
