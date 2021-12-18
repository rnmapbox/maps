import MapboxMaps

@objc(RCTMGLLight)
class RCTMGLLight: UIView, RCTMGLMapComponent {
  weak var bridge : RCTBridge! = nil
  weak var map: MapboxMap! = nil
  @objc var reactStyle : [String:Any]! = nil {
    didSet {
      if map != nil {
        addStyles()
      }
    }
  }
  
  func apply(light: Light) {
    self.map.style
    let lightData = try! JSONEncoder().encode(light)
    let lightDictionary = try! JSONSerialization.jsonObject(with: lightData)
    print("=> lightDictionary \(lightDictionary)")
    try! self.map.style.setLight(properties: lightDictionary as! [String:Any])
  }

  func addStyles() {
    var light = Light()
    let style = RCTMGLStyle(style: map.style)
    style.lightLayer(layer: &light, reactStyle: reactStyle, applyUpdater: { (updater) in
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

  func addToMap(_ map: RCTMGLMapView) {
    self.map = map.mapboxMap
    if (reactStyle != nil) {
      addStyles()
    }
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    self.map = nil
  }
}
