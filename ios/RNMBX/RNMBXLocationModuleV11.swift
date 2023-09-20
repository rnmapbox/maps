#if RNMBX_11
import MapboxMaps

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";

@objc(RNMBXLocationModule)
class RNMBXLocationModule: RCTEventEmitter {
  
  static weak var shared : RNMBXLocationModule? = nil
  
  override init() {
    super.init()
    RNMBXLocationModule.shared = self
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
      fatalError("RNMBXLocationModule.locationProvider not implemented")
    }
  }
}
#endif
