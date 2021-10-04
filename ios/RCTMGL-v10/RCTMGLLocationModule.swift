import Foundation
import MapboxMaps

@objc(RCTMGLLocation)
class RCTMGLLocation: NSObject {
  var location : CLLocation = CLLocation(latitude: 0.0, longitude: 0.0)
  
  var heading : CLHeading? = nil

  func toJSON() -> [String:Any] {
    return [
      "coords": [
        "longitude": location.coordinate.longitude,
        "latitude": location.coordinate.latitude,
        "altitude": location.altitude,
        "accuracy": location.horizontalAccuracy,
        "heading": heading?.trueHeading ?? 0.0,
        "course": location.course,
        "speed": location.speed,
      ],
      "timestamp": location.timestamp.timeIntervalSince1970
    ]
  }
}

typealias RCTMGLLocationBlock = (RCTMGLLocation?) -> Void

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";


protocol RCTMGLLocationManagerDelegate {
  func locationManager(_ locationManager: RCTMGLLocationManager, didUpdateLocation: RCTMGLLocation)
}

class RCTMGLLocationManager : LocationProviderDelegate {
  var provider: LocationProvider
  
  var lastKnownLocation : CLLocation?
  var lastKnownHeading : CLHeading?
  
  var delegate: RCTMGLLocationManagerDelegate?
  var locationProviderDelage: LocationProviderDelegate?
  
  var listeners: [RCTMGLLocationBlock] = []
  
  init() {
    provider = AppleLocationProvider()
    provider.setDelegate(self)
  }
  
  func setDistanceFilter(_ distanceFilter: CLLocationDistance) {
    provider.locationProviderOptions.distanceFilter = distanceFilter
  }
  
  func start() {
    provider.requestAlwaysAuthorization()
    provider.requestWhenInUseAuthorization()
    provider.setDelegate(self)
    provider.startUpdatingHeading()
    provider.startUpdatingLocation()
  }
  
  func _convertToMapboxLocation(_ location: CLLocation?) -> RCTMGLLocation {
    guard let location = location else {
      return RCTMGLLocation()
    }

    let userLocation = RCTMGLLocation()
    userLocation.location = location;
    userLocation.heading = lastKnownHeading
    return userLocation;
  }
  
  func _updateDelegate() {
    if delegate == nil {
      return;
    }

    let userLocation = _convertToMapboxLocation(lastKnownLocation)

    for listener in listeners {
      listener(userLocation)
    }
    delegate?.locationManager(self, didUpdateLocation: userLocation)
  }
  
    // MARK: - LocationProviderDelegate
  
  func locationProvider(_ provider: LocationProvider, didUpdateLocations locations: [CLLocation]) {
    lastKnownLocation = locations.last
    self._updateDelegate()
    
    locationProviderDelage?.locationProvider(provider, didUpdateLocations: locations)
  }
  
  func locationProvider(_ provider: LocationProvider, didUpdateHeading newHeading: CLHeading) {
    lastKnownHeading = newHeading
    self._updateDelegate()
    
    locationProviderDelage?.locationProvider(provider, didUpdateHeading: newHeading)
  }
  
  func locationProvider(_ provider: LocationProvider, didFailWithError error: Error) {
    locationProviderDelage?.locationProvider(provider, didFailWithError: error)
  }
  
  func locationProviderDidChangeAuthorization(_ provider: LocationProvider) {
    locationProviderDelage?.locationProviderDidChangeAuthorization(provider)
  }
}

extension RCTMGLLocationManager: LocationProvider {
  var locationProviderOptions: LocationOptions {
    get {
      provider.locationProviderOptions
    }
    set(newValue) {
      provider.locationProviderOptions = newValue
    }
  }
  
  var authorizationStatus: CLAuthorizationStatus {
    get {
      provider.authorizationStatus
    }
  }
  
  var accuracyAuthorization: CLAccuracyAuthorization {
    get {
      provider.accuracyAuthorization
    }
  }
  
  var heading: CLHeading? {
    get {
      provider.heading
    }
  }
  
  func setDelegate(_ delegate: LocationProviderDelegate) {
    provider.setDelegate(self)
    locationProviderDelage = delegate
  }
  
  func requestAlwaysAuthorization() {
    provider.requestAlwaysAuthorization()
  }
  
  func requestWhenInUseAuthorization() {
    provider.requestWhenInUseAuthorization()
  }
  
  func requestTemporaryFullAccuracyAuthorization(withPurposeKey purposeKey: String) {
    if #available(iOS 14.0, *) {
      provider.requestTemporaryFullAccuracyAuthorization(withPurposeKey: purposeKey)
    } else {
      // Fallback on earlier versions
    }
  }
  
  func startUpdatingLocation() {
    provider.startUpdatingLocation()
  }
  
  func stopUpdatingLocation() {
    provider.stopUpdatingLocation()
  }
  
  var headingOrientation: CLDeviceOrientation {
    get {
      return provider.headingOrientation
    }
    set(newValue) {
      provider.headingOrientation = newValue
    }
  }
  
  func startUpdatingHeading() {
    provider.startUpdatingHeading()
  }
  
  func stopUpdatingHeading() {
    provider.stopUpdatingHeading()
  }
  
  func dismissHeadingCalibrationDisplay() {
    provider.dismissHeadingCalibrationDisplay()
  }
}


@objc(RCTMGLLocationModule)
class RCTMGLLocationModule: RCTEventEmitter, RCTMGLLocationManagerDelegate {

  static var shared : RCTMGLLocationModule? = nil
  
  var locationManager : RCTMGLLocationManager
  var hasListener = false
  
  var locationProvider : LocationProvider {
    get {
      return locationManager
    }
  }
  
  override init() {
    locationManager = RCTMGLLocationManager()
    super.init()
    locationManager.delegate = self
    RCTMGLLocationModule.shared = self
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  override func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "foo": "bar"
    ];
  }

  @objc override func supportedEvents() -> [String]
  {
    return [RCT_MAPBOX_USER_LOCATION_UPDATE];
  }
  
  @objc func start(_ minDisplacement: CLLocationDistance) {
    locationManager.start()
    locationManager.setDistanceFilter(minDisplacement)
  }
  
  @objc func stop() {
    print("TODO implement RCTMGLLocationModule.stop!")
  }
  
  @objc func getLastKnownLocation() -> RCTMGLLocation? {
    return RCTMGLLocation()
  }
  
  @objc func setMinDisplacement(_ minDisplacement: CLLocationDistance) {
    locationManager.setDistanceFilter(minDisplacement)
  }
  
  @objc
  override func startObserving() {
    super.startObserving()
    hasListener = true
  }
  
  @objc
  override func stopObserving() {
    super.stopObserving()
    hasListener = false
  }
  
  
  func locationManager(_ locationManager: RCTMGLLocationManager, didUpdateLocation location: RCTMGLLocation) {
    guard hasListener else {
      return
    }
    
    guard let _ = bridge else {
      return
    }
   
    self.sendEvent(withName: RCT_MAPBOX_USER_LOCATION_UPDATE, body: location.toJSON())
  }

}
