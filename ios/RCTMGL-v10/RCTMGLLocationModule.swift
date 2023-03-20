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

protocol LocationProviderRCTMGLDelegate : AnyObject {
  func locationManager(_ locationManager: LocationProviderRCTMGL, didUpdateLocation: RCTMGLLocation)
}

/// LocationProviderRCTMGL listens to updates from a locationProvider and implements the LocationProvider interface itself
/// So it can be source of Mapbox locationProduces (which updates location pluck and viewport if configured) as well as source to updates
/// to RCTMGLLocationModules.
class LocationProviderRCTMGL : LocationProviderDelegate {
  enum LocationUpdateType {
    case heading
    case location
  }
  
  var provider: LocationProvider
  
  var lastKnownLocation : CLLocation?
  var lastKnownHeading : CLHeading?
  var shouldRequestAlwaysAuthorization: Bool?
  
  weak var delegate: LocationProviderRCTMGLDelegate?
  weak var locationProviderDelage: LocationProviderDelegate?
  
  var headingSimulator: Timer? = nil
  var simulatedHeading: Double = 0.0
  var simulatedHeadingIncrement: Double = 1.0
  
  
  struct Status {
    var provider = (updatingLocation: false, updatingHeading: false)
    var rctmglModule = false
    
    var shouldUpdateLocation: Bool {
      return provider.updatingLocation || rctmglModule
    }
    var shouldUpdateHeading: Bool {
      return provider.updatingHeading || rctmglModule
    }
  }

  var started = Status(provider: (updatingLocation: false, updatingHeading: false), rctmglModule: false) {
    didSet {
      _syncStarted(oldValue: oldValue, started: started)
    }
  }

  init() {
    provider = AppleLocationProvider()
    provider.setDelegate(self)
  }
  
  func setDistanceFilter(_ distanceFilter: CLLocationDistance) {
    var options = provider.locationProviderOptions
    options.distanceFilter = distanceFilter
    provider.locationProviderOptions = options
  }
  
  func setRequestsAlwaysUse(_ requestsAlwaysUse: Bool) {
    shouldRequestAlwaysAuthorization = requestsAlwaysUse;
  }

  func start() {
    if shouldRequestAlwaysAuthorization == true {
      provider.requestAlwaysAuthorization()
    }
    provider.requestWhenInUseAuthorization()
    started.rctmglModule = true
  }
  
  func stop() {
    started.rctmglModule = false
  }

  func _syncStarted(oldValue: Status, started: Status) {
    var stoppedSomething = false
    if (oldValue.shouldUpdateLocation != started.shouldUpdateLocation) {
      if started.shouldUpdateLocation {
        provider.setDelegate(self)
        provider.startUpdatingLocation()
      } else {
        provider.stopUpdatingLocation()
        stoppedSomething = true
      }
    }
    
    if (oldValue.shouldUpdateHeading != started.shouldUpdateHeading) {
      if started.shouldUpdateHeading {
        provider.setDelegate(self)
        provider.startUpdatingHeading()
      } else {
        provider.stopUpdatingHeading()
        stoppedSomething = true
      }
    }
    
    if stoppedSomething && !started.shouldUpdateLocation && !started.shouldUpdateHeading {
      provider.setDelegate(EmptyLocationProviderDelegate())
    }
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

// MARK: LocationProvider

extension LocationProviderRCTMGL: LocationProvider {
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
    started.provider.updatingLocation = true
  }
  
  func stopUpdatingLocation() {
    started.provider.updatingLocation = false
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
    started.provider.updatingHeading = true
  }
  
  func stopUpdatingHeading() {
    started.provider.updatingHeading = false
  }
  
  func dismissHeadingCalibrationDisplay() {
    provider.dismissHeadingCalibrationDisplay()
  }
}

// MARK: heading simulation

final public class SimulatedHeading: CLHeading {
  init(trueHeading: CLLocationDirection, timestamp: Date) {
    _trueHeading = trueHeading
    _timestamp = timestamp
    super.init()
  }
  
  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
    private var _trueHeading: CLLocationDirection = 0
    private var _timestamp: Date

    public override var trueHeading: CLLocationDirection {
        get {  _trueHeading }
        set { _trueHeading = newValue }
    }

    public override var timestamp: Date{
      get {  _timestamp }
      set { _timestamp = newValue }
    }
}

extension LocationProviderRCTMGL {
  func simulateHeading(changesPerSecond: Int, increment: Double) {
    self.simulatedHeadingIncrement = increment
    DispatchQueue.main.async {
      if let headingSimulator = self.headingSimulator {
        headingSimulator.invalidate()
      }
      self.headingSimulator = nil

      if (changesPerSecond > 0) {
        self.headingSimulator = Timer.scheduledTimer(withTimeInterval: 1.0/Double(changesPerSecond), repeats: true) { [weak self] (_) in
          guard let self = self else { return }

          self.simulatedHeading = (self.simulatedHeading + self.simulatedHeadingIncrement).truncatingRemainder(dividingBy: 360.0)
          self.locationProvider(self.provider, didUpdateHeading: SimulatedHeading(trueHeading: self.simulatedHeading, timestamp: Date()) )
        }
      }
    }
  }
}

// LocationModule is a sigleton class
@objc(RCTMGLLocationModule)
class RCTMGLLocationModule: RCTEventEmitter, LocationProviderRCTMGLDelegate {

  static weak var shared : RCTMGLLocationModule? = nil

  var locationProviderRCTMGL : LocationProviderRCTMGL
  var hasListener = false
  
  var locationProvider : LocationProvider {
    get {
      return locationProviderRCTMGL
    }
  }
  
  var locationEventThrottle : (
    waitBetweenEvents: Double?,
    lastSentTimestamp: Double?
  ) = (
    nil,
    nil
  )

  override init() {
    locationProviderRCTMGL = LocationProviderRCTMGL()
    super.init()
    locationProviderRCTMGL.delegate = self
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
    if minDisplacement >= 0.0 { locationProviderRCTMGL.setDistanceFilter(minDisplacement) }
    locationProviderRCTMGL.start()
  }
  
  @objc func stop() {
    locationProviderRCTMGL.stop()
  }
  
  @objc func getLastKnownLocation() -> RCTMGLLocation? {
    return RCTMGLLocation()
  }
  
  @objc func setMinDisplacement(_ minDisplacement: CLLocationDistance) {
    locationProviderRCTMGL.setDistanceFilter(minDisplacement)
  }
  
  @objc func setRequestsAlwaysUse(_ requestsAlwaysUse: Bool) {
    locationProviderRCTMGL.setRequestsAlwaysUse(requestsAlwaysUse);
  }

  @objc func simulateHeading(_ changesPerSecond: NSNumber, increment: NSNumber) {
    locationProviderRCTMGL.simulateHeading(changesPerSecond: changesPerSecond.intValue, increment: increment.doubleValue)
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
  
  func locationManager(_ locationManager: LocationProviderRCTMGL, didUpdateLocation location: RCTMGLLocation) {
    guard hasListener, let _ = bridge else {
      return
    }

    if shouldSendLocationEvent() {
      self.sendEvent(withName: RCT_MAPBOX_USER_LOCATION_UPDATE, body: location.toJSON())
    }
  }
  
  // MARK: - location event throttle
  @objc
  func setLocationEventThrottle(_ throttleValue:NSNumber) {
    let throttleValue = throttleValue.doubleValue
    if throttleValue > 0.0 {
      locationEventThrottle.waitBetweenEvents = throttleValue
    } else {
      locationEventThrottle.waitBetweenEvents = nil
    }
  }

  func shouldSendLocationEvent() -> Bool {
    guard let waitBetweenEvents = locationEventThrottle.waitBetweenEvents, waitBetweenEvents > 0 else {
      return true
    }
  
    let currentTimestamp: Double = CACurrentMediaTime() * 1000.0
    
    guard let lastSentTimestamp = locationEventThrottle.lastSentTimestamp else {
      locationEventThrottle.lastSentTimestamp = currentTimestamp
      return true;
    }
    
    if (currentTimestamp - lastSentTimestamp > waitBetweenEvents) {
      locationEventThrottle.lastSentTimestamp = currentTimestamp
      return true;
    }
     
    return false;
  }
}


