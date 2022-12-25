import Foundation
import MapboxMaps

@objc(RCTMGLLocation)
class RCTMGLLocation: NSObject {
  var location : CLLocation = CLLocation(latitude: 0.0, longitude: 0.0)
  
  var heading : CLHeading? = nil

  var timestamp: Date? = nil

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
      "timestamp": (timestamp ?? location.timestamp).timeIntervalSince1970 * 1000
    ]
  }
}

typealias RCTMGLLocationBlock = (RCTMGLLocation?) -> Void

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";

/// This implementation of LocationProviderDelegate is used by `LocationManager` to work around
/// the fact that the `LocationProvider` API does not allow the delegate to be set to `nil`.
internal class EmptyLocationProviderDelegate: LocationProviderDelegate {
    func locationProvider(_ provider: LocationProvider, didFailWithError error: Error) {}
    func locationProvider(_ provider: LocationProvider, didUpdateHeading newHeading: CLHeading) {}
    func locationProvider(_ provider: LocationProvider, didUpdateLocations locations: [CLLocation]) {}
    func locationProviderDidChangeAuthorization(_ provider: LocationProvider) {}
}

protocol RCTMGLLocationManagerDelegate : AnyObject {
  func locationManager(_ locationManager: RCTMGLLocationManager, didUpdateLocation: RCTMGLLocation)
}

class RCTMGLLocationManager : LocationProviderDelegate {
  enum LocationUpdateType {
    case heading
    case location
  }

  var provider: LocationProvider
  
  var lastKnownLocation : CLLocation?
  var lastKnownHeading : CLHeading?
  
  weak var delegate: RCTMGLLocationManagerDelegate?
  weak var locationProviderDelage: LocationProviderDelegate?
  
  init() {
    provider = AppleLocationProvider()
    provider.setDelegate(self)
  }
  
  func setDistanceFilter(_ distanceFilter: CLLocationDistance) {
    var options = provider.locationProviderOptions
    options.distanceFilter = distanceFilter
    provider.locationProviderOptions = options
  }
  
  func start() {
    provider.requestAlwaysAuthorization()
    provider.requestWhenInUseAuthorization()
    provider.setDelegate(self)
    provider.startUpdatingHeading()
    provider.startUpdatingLocation()
  }
  
  func stop() {
    provider.stopUpdatingHeading()
    provider.stopUpdatingLocation()
    provider.setDelegate(EmptyLocationProviderDelegate())
  }
  
  func _convertToMapboxLocation(_ location: CLLocation?, type: LocationUpdateType) -> RCTMGLLocation {
    guard let location = location else {
      return RCTMGLLocation()
    }

    let userLocation = RCTMGLLocation()
    userLocation.location = location;
    userLocation.heading = lastKnownHeading
    switch type {
    case .location:
      userLocation.timestamp = location.timestamp
    case .heading:
      userLocation.timestamp = lastKnownHeading!.timestamp
    }
    return userLocation;
  }
  
  func _updateDelegate(type: LocationUpdateType) {
    if delegate == nil {
      return;
    }

    let userLocation = _convertToMapboxLocation(lastKnownLocation, type: type)

    delegate?.locationManager(self, didUpdateLocation: userLocation)
  }
  
    // MARK: - LocationProviderDelegate
  
  func locationProvider(_ provider: LocationProvider, didUpdateLocations locations: [CLLocation]) {
    lastKnownLocation = locations.last
    self._updateDelegate(type: .location)
    
    locationProviderDelage?.locationProvider(provider, didUpdateLocations: locations)
  }
  
  func locationProvider(_ provider: LocationProvider, didUpdateHeading newHeading: CLHeading) {
    lastKnownHeading = newHeading
    self._updateDelegate(type: .heading)
    
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

  static weak var shared : RCTMGLLocationModule? = nil
  
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
    return [:];
  }

  @objc override func supportedEvents() -> [String]
  {
    return [RCT_MAPBOX_USER_LOCATION_UPDATE];
  }
  
  @objc func start(_ minDisplacement: CLLocationDistance) {
    if minDisplacement >= 0.0 { locationManager.setDistanceFilter(minDisplacement) }
    locationManager.start()
  }
  
  @objc func stop() {
    locationManager.stop()
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
