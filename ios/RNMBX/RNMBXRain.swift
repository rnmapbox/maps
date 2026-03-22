@_spi(Experimental) import MapboxMaps

@objc(RNMBXRain)
public class RNMBXRain : RNMBXSingletonLayer, RNMBXMapComponent, RNMBXSourceConsumer {
  var rain : Rain? = nil

  func makeRain() -> Rain {
    return Rain()
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    self.style = style

    let rain = self.makeRain()
    self.rain = rain
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
    logged("RNMBXRain.removeFromMap") {
      try style.removeRain()
    }
  }

  override func addStylesAndUpdate() {
    guard rain != nil else {
      return
    }

    super.addStylesAndUpdate()
  }

  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = self.reactStyle {
      let styler = RNMBXStyle(style: style)
      styler.bridge = self.bridge

      if var rain = rain {
        styler.rainLayer(
          layer: &rain,
          reactStyle: reactStyle,
          oldReactStyle: oldReactStyle,
          applyUpdater: { (updater) in fatalError("Rain: TODO - implement apply updater")},
          isValid: { fatalError("Rain: TODO - no isValid") }
        )
        self.rain = rain
      } else {
        fatalError("[xxx] rain is nil \(optional: self.rain)")
      }
    }
  }

  override func apply(style : Style) throws {
    if let rain = rain {
      try style.setRain(rain)
    }
  }
}
