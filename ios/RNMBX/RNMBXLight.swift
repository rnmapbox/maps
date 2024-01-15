import MapboxMaps

#if RNMBX_11
typealias Light = FlatLight
#endif

@objc(RNMBXLight)
public class RNMBXLight: UIView, RNMBXMapComponent {
  @objc public weak var bridge : RCTBridge! = nil
  weak var map: MapboxMap! = nil
  var oldReactStyle: [String:Any]?
  @objc public var reactStyle : [String:Any]! = nil {
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
    let lightData = try! JSONEncoder().encode(light)
    let lightDictionary = try! JSONSerialization.jsonObject(with: lightData)
    logged("RNMBXLight.apply") {
#if RNMBX_11
      try self.map.setLights(light)
#else
      try! self.map.style.setLight(properties: lightDictionary as! [String:Any])
#endif
    }
  }

  func addStyles() {
    var light = Light()
    let style = RNMBXStyle(style: map.style)
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
  
  // MARK: - RNMBXMapComponent

  public func waitForStyleLoad() -> Bool {
    return true
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map.mapboxMap
    if (reactStyle != nil) {
      addStyles()
    }
  }
  
  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool  {
    self.map = nil
    return true
  }
}
