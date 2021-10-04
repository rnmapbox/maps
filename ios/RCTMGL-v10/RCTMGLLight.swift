import MapboxMaps

@objc(RCTMGLLight)
class RCTMGLLight: UIView, RCTMGLMapComponent {
  weak var bridge : RCTBridge! = nil
  weak var map: MapboxMap! = nil
  @objc var reactStye : [String:Any]! = nil {
    didSet {
      addStyles()
    }
  }

  func addStyles() {
    var light = Light()
    let style = RCTMGLStyle(style:map.style)
    style.lightLayer(layer: &light, reactStyle: reactStye, applyUpdater: { (updater) in
      updater(&light)
      let lightData = try! JSONEncoder().encode(light)
      let lightDictionary = try! JSONSerialization.jsonObject(with: lightData)
      try! self.map.style.setLight(properties: lightDictionary as! [String:Any])
    }, isValid: {
      return self.isAddedToMap()
    })
  }
  
  func isAddedToMap() -> Bool {
    return map != nil
  }

  func addToMap(_ map: RCTMGLMapView) {
    self.map = map.mapboxMap
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    self.map = nil
  }
}
