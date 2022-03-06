import MapboxMaps

@objc
class RCTMGLImageSource : RCTMGLSource {
  
  @objc var url: String? = nil {
    didSet {
      if var source = source as? ImageSource {
        source.url = url
        self.doUpdate { (style) in
          try! style.setSourceProperty(for: id, property: "url", value: url)
        }
      }
    }
  }
  
  @objc var coordinates: [[NSNumber]]? = nil {
    didSet {
      if var source = source as? ImageSource {
        if let coordinates = coordinates {
          source.coordinates = coordinates.map { $0.map { $0.doubleValue }}
        } else {
          source.coordinates = nil
        }
        self.doUpdate { (style) in
          try! style.setSourceProperty(for: id, property: "coordinates", value: source.coordinates)
        }
      }
    }
  }
  
  override func sourceType() -> Source.Type {
    return ImageSource.self
  }

  override func makeSource() -> Source
  {
    var result = ImageSource()
    if let url = url {
      result.url = url
    }
    
    if let coordinates = coordinates {
      result.coordinates = coordinates.map { $0.map { $0.doubleValue }}
    }
    
    return result
  }
  
  func doUpdate(_ update:(Style) -> Void) {
    guard let map = self.map,
          let _ = self.source,
          map.mapboxMap.style.sourceExists(withId: id) else {
      return
    }
    
    let style = map.mapboxMap.style
    update(style)
  }
  
}
