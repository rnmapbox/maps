import MapboxMaps

@objc
public class RNMBXNativeUserLocation : UIView, RNMBXMapComponent {
  weak var map : RNMBXMapView! = nil
  
  let locationLayerId = "location-layer"

  var locationLayer : LocationIndicatorLayer? = nil

  @objc
  public var iosShowsUserHeadingIndicator : Bool = false {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }
  
  @objc
  var topImage : NSString? = nil {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }

  @objc
  var bearingImage : NSString? = nil {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }
    
  @objc
  var shadowImage : NSString? = nil {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }
    
  @objc
  var scale : NSNumber? = nil {
    didSet {
      if let map = self.map { _applySettings(map) }
    }
  }
  
  func _applySettings(_ map: RNMBXMapView) {
    let location = map.mapView.location!
    if (self.topImage != nil || self.bearingImage != nil || self.shadowImage != nil) {
      location.options.puckType = .puck2D(Puck2DConfiguration(
        topImage: self.topImage != nil ? UIImage(named: self.topImage! as String, in: .main, compatibleWith: nil)! : nil,
        bearingImage: self.bearingImage != nil ? UIImage(named: self.bearingImage! as String, in: .main, compatibleWith: nil)! : nil,
        shadowImage: self.shadowImage != nil ? UIImage(named: self.shadowImage! as String, in: .main, compatibleWith: nil)! : nil,
        scale: self.scale != nil ? .constant(scale as! Double) : nil
      ))
    } else {
      location.options.puckType = .puck2D(.makeDefault(showBearing: iosShowsUserHeadingIndicator))
    }
    if (iosShowsUserHeadingIndicator) {
       #if RNMBX_11
      location.options.puckBearing = .heading
      #else
      location.options.puckBearingSource = .heading
      #endif
      location.options.puckBearingEnabled = true
    } else {
      location.options.puckBearingEnabled = false
    }
  }

  func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    _applySettings(map)
  }

  func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    let location = map.mapView.location!
    location.options.puckType = nil
    guard let mapboxMap = map.mapboxMap else {
      return true
    }
    let style = mapboxMap.style
    location.options.puckType = .none
    self.map = nil

    return true
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
}
