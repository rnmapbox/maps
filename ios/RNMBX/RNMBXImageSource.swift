import MapboxMaps

@objc
public class RNMBXImageSource : RNMBXSource {
  
  @objc public var url: String? = nil {
    didSet {
      if var source = source as? ImageSource {
        source.url = url
        self.map?.withMapboxMap { [weak self] _mapboxMap in
          guard let self = self else { return }
          self.doUpdate(_mapboxMap: _mapboxMap) { (style) in
            try! style.setSourceProperty(for: self.id, property: "url", value: source.url)
          }
        }
      }
    }
  }
  
  @objc public var coordinates: [[NSNumber]]? = nil {
    didSet {
      if var source = source as? ImageSource {
        if let coordinates = coordinates {
          source.coordinates = coordinates.map { $0.map { $0.doubleValue }}
        } else {
          source.coordinates = nil
        }
        self.map?.withMapboxMap { [weak self] _mapboxMap in
          guard let self = self else { return }
          self.doUpdate(_mapboxMap: _mapboxMap) { (style) in
            try! style.setSourceProperty(for: self.id, property: "coordinates", value: source.coordinates)
          }
        }
      }
    }
  }
  
  override func sourceType() -> Source.Type {
    return ImageSource.self
  }

  override func makeSource() -> Source
  {
    #if RNMBX_11
    var result = ImageSource(id: self.id)
    #else
    var result = ImageSource()
    #endif
    if let url = url {
      result.url = url
    }
    
    if let coordinates = coordinates {
      result.coordinates = coordinates.map { $0.map { $0.doubleValue }}
    }
    
    return result
  }
  
  func doUpdate(_mapboxMap: MapboxMap, _ update:(Style) -> Void) {
    guard let map = self.map,
          let _ = self.source,
          _mapboxMap.style.sourceExists(withId: id) else {
      return
    }
    
    let style = _mapboxMap.style
    update(style)
  }
  
}
