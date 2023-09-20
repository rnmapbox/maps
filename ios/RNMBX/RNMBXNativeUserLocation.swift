import MapboxMaps

@objc
class RNMBXNativeUserLocation : UIView, RNMBXMapComponent {
  weak var map : RNMBXMapView! = nil
  
  let locationLayerId = "location-layer"

  var locationLayer : LocationIndicatorLayer? = nil

  @objc
  var iosShowsUserHeadingIndicator : Bool = false {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }
  
  func _applySettings(_ map: RNMBXMapView) {
    map.location.options.puckType = .puck2D(.makeDefault(showBearing: iosShowsUserHeadingIndicator))
    if (iosShowsUserHeadingIndicator) {
      #if RNMBX_11
      map.location.options.puckBearing = .heading
      #else
      map.location.options.puckBearingSource = .heading
      #endif
      map.location.options.puckBearingEnabled = true
    } else {
      map.location.options.puckBearingEnabled = false
    }
  }

  func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    _applySettings(map)
  }

  func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    map.location.options.puckType = nil
    guard let mapboxMap = map.mapboxMap else {
      return true
    }
    let style = mapboxMap.style
    map.location.options.puckType = .none
    self.map = nil

    return true
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
}
