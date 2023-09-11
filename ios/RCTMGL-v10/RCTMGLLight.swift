@_spi(Experimental) import MapboxMaps

#if RNMBX_11
typealias Light = FlatLight
#endif

@objc(RCTMGLLight)
class RCTMGLLight: UIView, RCTMGLMapComponent {
  weak var bridge : RCTBridge! = nil
  weak var map: MapboxMap! = nil
  var oldReactStyle: [String:Any]?
  @objc var reactStyle : [String:Any]! = nil {
    willSet {
      oldReactStyle = reactStyle
    }
    didSet {
      if map != nil {
        addStyles()
      }
    }
  }
  
  func apply(light: Light) {
    logged("RCTMGLLight.apply") {
#if RNMBX_11
      try self.map.setLights(light)
#else
      let lightData = try JSONEncoder().encode(light)
      let lightDictionary = try JSONSerialization.jsonObject(with: lightData)
      try self.map.style.setLight(properties: lightDictionary as! [String:Any])
#endif
    }
  }

  func addStyles() {
    var light = Light()
    let style = RCTMGLStyle(style: map.style)
    style.lightLayer(layer: &light, reactStyle: reactStyle, oldReactStyle: oldReactStyle, applyUpdater: { (updater) in
      updater(&light)
      self.apply(light: light)
    }, isValid: {
      return self.isAddedToMap()
    })
    
    apply(light: light)
  }
  
  func isAddedToMap() -> Bool {
    return map != nil
  }
  
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return true
  }

  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map.mapboxMap
    if (reactStyle != nil) {
      addStyles()
    }
  }
  
  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool  {
    self.map = nil
    return true
  }
}
