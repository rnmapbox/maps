@_spi(Experimental) import MapboxMaps

@objc
class RCTMGLSource : UIView, RCTMGLMapComponent {
  
  var source : Source? = nil

  var ownsSource : Bool = false

  var map : RCTMGLMapView? = nil
  
  static let hitboxDefault = 44.0

  @objc var hitbox : [String:NSNumber] = [
    "width": NSNumber(value: hitboxDefault),
    "height": NSNumber(value: hitboxDefault)
  ]
  
  @objc var id: String! = nil
  
  @objc var hasPressListener: Bool = false
  @objc var onPress: RCTBubblingEventBlock? = nil
  
  var layers: [RCTMGLSourceConsumer] = []
  
  func makeSource() -> Source {
    fatalError("Subclasses should override makeSource")
  }
  
  func sourceType() -> Source.Type {
    fatalError("Subclasses should override makeSource")
  }
  
  func isTouchable() -> Bool {
    return hasPressListener
  }
  
  @objc override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let layer : RCTMGLSourceConsumer = subview as? RCTMGLSourceConsumer {
      if let map = map {
        layer.addToMap(map, style: map.mapboxMap.style)
      }
      layers.append(layer)
    }
  }
  
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return true
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    
    map.onMapStyleLoaded { mapboxMap in
      if style.sourceExists(withId: self.id) {
        self.source = try! style.source(withId: self.id)
      } else {
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
    }
  }

  func removeFromMap(_ map: RCTMGLMapView) {
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
  }

  func getLayerIDs() -> [String] {
    layers.compactMap {
      if let layer = $0 as? RCTMGLLayer {
        return layer.id
      } else {
        return nil
      }
    }
  }
}
