@_spi(Experimental) import MapboxMaps

@objc(RNMBXSnow)
public class RNMBXSnow : RNMBXSingletonLayer, RNMBXMapComponent, RNMBXSourceConsumer {
  var snow : Snow? = nil

  func makeSnow() -> Snow {
    return Snow()
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    self.style = style

    let snow = self.makeSnow()
    self.snow = snow
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
    logged("RNMBXSnow.removeFromMap") {
      try style.removeSnow()
    }
  }

  override func addStylesAndUpdate() {
    guard snow != nil else {
      return
    }

    super.addStylesAndUpdate()
  }

  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = self.reactStyle {
      let styler = RNMBXStyle(style: style)
      styler.bridge = self.bridge

      if var snow = snow {
        styler.snowLayer(
          layer: &snow,
          reactStyle: reactStyle,
          oldReactStyle: oldReactStyle,
          applyUpdater: { (updater) in fatalError("Snow: TODO - implement apply updater")},
          isValid: { fatalError("Snow: TODO - no isValid") }
        )
        self.snow = snow
      } else {
        fatalError("[xxx] snow is nil \(optional: self.snow)")
      }
    }
  }

  override func apply(style : Style) throws {
    if let snow = snow {
      try style.setSnow(snow)
    }
  }
}
