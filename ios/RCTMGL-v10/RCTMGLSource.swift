@_spi(Experimental) import MapboxMaps

@objc
class RCTMGLSource : RCTMGLInteractiveElement {
  var layers: [RCTMGLSourceConsumer] = []
  var components: [RCTMGLMapComponent] = []

  var source : Source? = nil

  var ownsSource : Bool = false

  @objc var existing: Bool = false
  
  override func getLayerIDs() -> [String] {
    layers.compactMap {
      if let layer = $0 as? RCTMGLLayer {
        return layer.id
      } else {
        return nil
      }
    }
  }

  func makeSource() -> Source {
    fatalError("Subclasses should override makeSource")
  }
  
  func sourceType() -> Source.Type {
    fatalError("Subclasses should override makeSource")
  }
  
  // MARK: - UIView+React

  @objc override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let layer = subview as? RCTMGLSourceConsumer {
      if let map = map {
        layer.addToMap(map, style: map.mapboxMap.style)
      }
      layers.append(layer)
    } else if let component = subview as? RCTMGLMapComponent {
      if let map = map {
        component.addToMap(map, style: map.mapboxMap.style)
      }
      components.append(component)
    }
    super.insertReactSubview(subview, at: atIndex)
  }
  
  @objc override func removeReactSubview(_ subview: UIView!) {
    if let layer : RCTMGLSourceConsumer = subview as? RCTMGLSourceConsumer {
      if let map = map {
        layer.removeFromMap(map, style: map.mapboxMap.style)
      }
      layers.removeAll { $0 as AnyObject === layer }
    } else if let component = subview as? RCTMGLMapComponent {
      if let map = map {
        component.removeFromMap(map, reason: .ViewRemoval)
      }
      layers.removeAll { $0 as AnyObject === component }
    }
    super.removeReactSubview(subview)
  }
  
  @objc override func didUpdateReactSubviews() {
    // do nothing to prevent inserting layers to UIView hierarchy
  }
  
  // MARK: - RCTMGLInteractiveElement
  
  override func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map

    if style.sourceExists(withId: self.id) {
      if (!existing) {
        Logger.log(level: .warn, message: "Warning source with id:\(optional: id) referred to existing source but `existing` attibute was missing. https://github.com/rnmapbox/maps/wiki/Deprecated-ExistingSourceLayer")
      }
      self.source = try! style.source(withId: self.id)
    } else {
      if (existing) {
        Logger.log(level: .warn, message: "Warning source with id:\(optional: id) marked as existing, but could not find in style, source identifiers: \(style.allSourceIdentifiers.map { [$0.id, $0.type.rawValue] })")
      }
      let source = self.makeSource()
      self.ownsSource = true
      self.source = source
      logged("SyleSource.addToMap", info: {"id: \(optional: self.id)"}) {
        try style.addSource(source, id: self.id)
      }
    }

    for layer in self.layers {
      layer.addToMap(map, style: map.mapboxMap.style)
    }
    for component in self.components {
      component.addToMap(map, style: map.mapboxMap.style)
    }
  }

  override func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    self.map = nil

    for layer in self.layers {
      layer.removeFromMap(map, style: map.mapboxMap.style)
    }

    if self.ownsSource {
      let style = map.mapboxMap.style
      logged("StyleSource.removeFromMap", info: { "id: \(optional: self.id)"}) {
        try style.removeSource(withId: id)
      }
      self.ownsSource = false
    }
    return true
  }
}
