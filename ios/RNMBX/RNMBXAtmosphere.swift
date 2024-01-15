import MapboxMaps

#if RNMBX_11
public typealias Style = StyleManager
#endif

@objc(RNMBXAtmosphere)
public class RNMBXAtmosphere : RNMBXSingletonLayer, RNMBXMapComponent, RNMBXSourceConsumer {
  var atmosphere : Atmosphere? = nil
  
  func makeAtmosphere() -> Atmosphere {
    return Atmosphere()
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    self.style = style
    
    let atmosphere = self.makeAtmosphere()
    self.atmosphere = atmosphere
    addStylesAndUpdate()
  }
  
  public func removeFromMap(_ map: RNMBXMapView, reason _: RemovalReason) -> Bool {
    self.map = nil
    
    guard let mapboxMap = map.mapboxMap else {
      return false
    }
    
    let style = mapboxMap.style
    removeFromMap(map, style: style)
    return true
  }
  
  public func waitForStyleLoad() -> Bool {
    return true
  }
  
  func removeFromMap(_ map: RNMBXMapView, style: Style) {
    logged("RNMBXAtmosphere.removeFromMap") {
      try style.removeAtmosphere()
    }
  }

  override func addStylesAndUpdate() {
    guard atmosphere != nil else {
      return
    }

    super.addStylesAndUpdate()
  }
  
  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = self.reactStyle {
      let styler = RNMBXStyle(style: style)
      styler.bridge = self.bridge
      
      if var atmosphere = atmosphere {
        styler.atmosphereLayer(
          layer: &atmosphere,
          reactStyle: reactStyle,
          oldReactStyle: oldReactStyle,
          applyUpdater: { (updater) in fatalError("Atmosphere: TODO - implement apply updater")},
          isValid: { fatalError("Atmosphere: TODO - no isValid") }
        )
        self.atmosphere = atmosphere
      } else {
        fatalError("[xxx] atmosphere is nil \(optional: self.atmosphere)")
      }
    }
  }
  
  override func apply(style : Style) throws {
    if let atmosphere = atmosphere {
      try style.setAtmosphere(atmosphere)
    }
  }
}
