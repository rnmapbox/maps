import MapboxMaps

@objc
class RCTMGLNativeUserLocation : UIView, RCTMGLMapComponent {
  weak var map : RCTMGLMapView! = nil
  
  let locationLayerId = "location-layer"

  var locationLayer : LocationIndicatorLayer? = nil

  var visible : Bool = false

  @objc
  var iosShowsUserHeadingIndicator : Bool = false {
    didSet {
      if visible {
        if let map = self.map {
          map.location.options.puckType = .puck2D(.makeDefault(showBearing: iosShowsUserHeadingIndicator))
        }
      }
    }
  }

  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    
    visible = true
    
    map.location.options.puckType = .puck2D(.makeDefault(showBearing: iosShowsUserHeadingIndicator))
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    guard let mapboxMap = map.mapboxMap else {
      return
    }
    visible = false
    let style = mapboxMap.style
    map.location.options.puckType = .none
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
}
