@_spi(Experimental) import MapboxMaps

@objc
public class RNMBXSource : RNMBXInteractiveElement {
  var layers: [RNMBXSourceConsumer] = []
  var components: [RNMBXMapComponent] = []

  var source : Source? = nil

  var ownsSource : Bool = false

  @objc public var existing: Bool = false
  
  override func getLayerIDs() -> [String] {
    layers.compactMap {
      if let layer = $0 as? RNMBXLayer {
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

  @objc public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    insertReactSubviewInternal(subview, at: atIndex)
    super.insertReactSubview(subview, at: atIndex)
  }
    
    @objc public func insertReactSubviewInternal(_ subview: UIView!, at atIndex: Int) {
        if let layer = subview as? RNMBXSourceConsumer {
          if let map = map {
            layer.addToMap(map, style: map.mapboxMap.style)
          }
          layers.append(layer)
        } else if let component = subview as? RNMBXMapComponent {
          if let map = map {
            component.addToMap(map, style: map.mapboxMap.style)
          }
          components.append(component)
        }
    }
  
  @objc public override func removeReactSubview(_ subview: UIView!) {
    removeReactSubviewInternal(subview)
    super.removeReactSubview(subview)
  }
    
    @objc public func removeReactSubviewInternal(_ subview: UIView!) {
        if let layer : RNMBXSourceConsumer = subview as? RNMBXSourceConsumer {
          if let map = map {
            layer.removeFromMap(map, style: map.mapboxMap.style)
          }
          layers.removeAll { $0 as AnyObject === layer }
        } else if let component = subview as? RNMBXMapComponent {
          if let map = map {
            component.removeFromMap(map, reason: .ViewRemoval)
          }
          layers.removeAll { $0 as AnyObject === component }
        }
    }

  
  @objc public override func didUpdateReactSubviews() {
    // do nothing to prevent inserting layers to UIView hierarchy
  }
  
  // MARK: - RNMBXInteractiveElement
  
  public override func addToMap(_ map: RNMBXMapView, style: Style) {
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
        #if RNMBX_11
        try style.addSource(source)
        #else
        try style.addSource(source, id: self.id)
        #endif
      }
    }

    for layer in self.layers {
      layer.addToMap(map, style: map.mapboxMap.style)
    }
    for component in self.components {
      component.addToMap(map, style: map.mapboxMap.style)
    }
  }

  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
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
