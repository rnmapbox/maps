#if RNMBX_11
import MapboxMaps

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";

@objc(RCTMGLLocationModule)
class RCTMGLLocationModule: RCTEventEmitter {
  
  static weak var shared : RCTMGLLocationModule? = nil
  
  override init() {
    super.init()
    RCTMGLLocationModule.shared = self
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc override func supportedEvents() -> [String]
  {
    return [RCT_MAPBOX_USER_LOCATION_UPDATE];
  }

  var locationProvider : LocationProvider & HeadingProvider {
    get {
      fatalError("RCTMGLLocationModule.locationProvider not implemented")
    }
  }
}
#endif
