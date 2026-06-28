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

    warnIfMeasureLightUnavailable(style: style)

    let rain = self.makeRain()
    self.rain = rain
    addStylesAndUpdate()
  }

  private func warnIfMeasureLightUnavailable(style: Style) {
    let hasLights = !style.allLightIdentifiers.isEmpty
    if hasLights { return }

    let affectedProps = ["color", "opacity", "vignetteColor"]
    let missingProps = affectedProps.filter { reactStyle?[$0] == nil }
    if missingProps.isEmpty { return }

    Logger.log(level: .warn, message: "RNMBXRain: The current style has no 3D lights, so " +
      "measure-light(\"brightness\") expressions used in default rain " +
      "\(missingProps.joined(separator: ", ")) will fail. Use a Standard style or set " +
      "explicit values for: \(missingProps.joined(separator: ", "))")
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
