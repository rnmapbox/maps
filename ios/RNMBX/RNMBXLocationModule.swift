import Foundation
import MapboxMaps

#if !RNMBX_11

@objc(RNMBXLocation)
class RNMBXLocation: NSObject {
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

typealias RNMBXLocationBlock = (RNMBXLocation?) -> Void

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";

/// This implementation of LocationProviderDelegate is used by `LocationManager` to work around
/// the fact that the `LocationProvider` API does not allow the delegate to be set to `nil`.
internal class EmptyLocationProviderDelegate: LocationProviderDelegate {
    func locationProvider(_ provider: LocationProvider, didFailWithError error: Error) {}
    func locationProvider(_ provider: LocationProvider, didUpdateHeading newHeading: CLHeading) {}
    func locationProvider(_ provider: LocationProvider, didUpdateLocations locations: [CLLocation]) {}
    func locationProviderDidChangeAuthorization(_ provider: LocationProvider) {}
}

protocol LocationProviderRNMBXDelegate : AnyObject {
  func locationManager(_ locationManager: LocationProviderRNMBX, didUpdateLocation: RNMBXLocation)
}

class RNMBXAppleLocationProvider: NSObject {
    private var locationProvider: CLLocationManager
  
    private var privateLocationProviderOptions: LocationOptions {
        didSet {
            locationProvider.distanceFilter = privateLocationProviderOptions.distanceFilter
            locationProvider.desiredAccuracy = privateLocationProviderOptions.desiredAccuracy
            locationProvider.activityType = privateLocationProviderOptions.activityType
        }
    }
    private weak var delegate: LocationProviderDelegate?

    public var headingOrientation: CLDeviceOrientation {
        didSet { locationProvider.headingOrientation = headingOrientation }
    }

    public override init() {
        locationProvider = CLLocationManager()
        privateLocationProviderOptions = LocationOptions()
        headingOrientation = locationProvider.headingOrientation
        super.init()
        locationProvider.delegate = self
    }
}

extension RNMBXAppleLocationProvider: LocationProvider {
    public var locationProviderOptions: LocationOptions {
        get { privateLocationProviderOptions }
        set { privateLocationProviderOptions = newValue }
    }

    public var authorizationStatus: CLAuthorizationStatus {
        if #available(iOS 14.0, *) {
            return locationProvider.authorizationStatus
        } else {
            return CLLocationManager.authorizationStatus()
        }
    }

    public var accuracyAuthorization: CLAccuracyAuthorization {
        if #available(iOS 14.0, *) {
            return locationProvider.accuracyAuthorization
        } else {
            return .fullAccuracy
        }
    }

    public var heading: CLHeading? {
        return locationProvider.heading
    }

    public func setDelegate(_ delegate: LocationProviderDelegate) {
        self.delegate = delegate
    }

    public func requestAlwaysAuthorization() {
        locationProvider.requestAlwaysAuthorization()
    }

    public func requestWhenInUseAuthorization() {
        locationProvider.requestWhenInUseAuthorization()
    }

    @available(iOS 14.0, *)
    public func requestTemporaryFullAccuracyAuthorization(withPurposeKey purposeKey: String) {
        locationProvider.requestTemporaryFullAccuracyAuthorization(withPurposeKey: purposeKey)
    }

    public func startUpdatingLocation() {
        locationProvider.startUpdatingLocation()
    }

    public func stopUpdatingLocation() {
        locationProvider.stopUpdatingLocation()
    }

    public func startUpdatingHeading() {
        locationProvider.startUpdatingHeading()
    }

    public func stopUpdatingHeading() {
        locationProvider.stopUpdatingHeading()
    }

    public func dismissHeadingCalibrationDisplay() {
        locationProvider.dismissHeadingCalibrationDisplay()
    }
}

extension RNMBXAppleLocationProvider: CLLocationManagerDelegate {
  public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    delegate?.locationProvider(self, didUpdateLocations: locations)
  }

  public func locationManager(_ manager: CLLocationManager, didUpdateHeading heading: CLHeading) {
    delegate?.locationProvider(self, didUpdateHeading: heading)
  }

  public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
      delegate?.locationProvider(self, didFailWithError: error)
  }

  @available(iOS 14.0, *)
  public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
      delegate?.locationProviderDidChangeAuthorization(self)
  }

  public func locationManagerShouldDisplayHeadingCalibration(_ manager: CLLocationManager) -> Bool {
    guard let calibratingDelegate = delegate as? CalibratingLocationProviderDelegate else {
      return false
    }

    return calibratingDelegate.locationProviderShouldDisplayHeadingCalibration(self)
  }
}

internal protocol CalibratingLocationProviderDelegate: LocationProviderDelegate {
    func locationProviderShouldDisplayHeadingCalibration(_ locationProvider: LocationProvider) -> Bool
}

/// LocationProviderRNMBX listens to updates from a locationProvider and implements the LocationProvider interface itself
/// So it can be source of Mapbox locationProduces (which updates location pluck and viewport if configured) as well as source to updates
/// to RNMBXLocationModules.
class LocationProviderRNMBX : LocationProviderDelegate {
  enum LocationUpdateType {
    case heading
    case location
  }
  
  var provider: LocationProvider
  
  var lastKnownLocation : CLLocation?
  var lastKnownHeading : CLHeading?
  var shouldRequestAlwaysAuthorization: Bool?
  
  weak var delegate: LocationProviderRNMBXDelegate?
  weak var locationProviderDelage: LocationProviderDelegate?
  
  var headingSimulator: Timer? = nil
  var simulatedHeading: Double = 0.0
  var simulatedHeadingIncrement: Double = 1.0
  
  
  struct Status {
    var provider = (updatingLocation: false, updatingHeading: false)
    var RNMBXModule = false
    
    var shouldUpdateLocation: Bool {
      return provider.updatingLocation || RNMBXModule
    }
    var shouldUpdateHeading: Bool {
      return provider.updatingHeading || RNMBXModule
    }
  }

  var started = Status(provider: (updatingLocation: false, updatingHeading: false), RNMBXModule: false) {
    didSet {
      _syncStarted(oldValue: oldValue, started: started)
    }
  }

  init() {
    provider = RNMBXAppleLocationProvider()
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
    started.RNMBXModule = true
  }
  
  func stop() {
    started.RNMBXModule = false
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
  
  func _convertToMapboxLocation(_ location: CLLocation?, type: LocationUpdateType) -> RNMBXLocation {
    guard let location = location else {
      return RNMBXLocation()
    }

    let userLocation = RNMBXLocation()
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

extension LocationProviderRNMBX: LocationProvider {
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

    if let lastLocation = lastKnownLocation {
      DispatchQueue.main.async {
        self.locationProviderDelage?.locationProvider(self, didUpdateLocations: [lastLocation])
      }
    }
    if let lastHeading = lastKnownHeading {
      DispatchQueue.main.async { [self] in
        self.locationProviderDelage?.locationProvider(self, didUpdateHeading: lastHeading)
      }
    }
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

extension LocationProviderRNMBX {
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
@objc(RNMBXLocationModule)
class RNMBXLocationModule: RCTEventEmitter, LocationProviderRNMBXDelegate {

  static weak var shared : RNMBXLocationModule? = nil

  var hasListener = false
  
  var locationProvider : LocationProvider
  var defaultLocationProvider : LocationProvider? = nil
  
  var locationEventThrottle : (
    waitBetweenEvents: Double?,
    lastSentTimestamp: Double?
  ) = (
    nil,
    nil
  )

  override init() {
    locationProvider = LocationProviderRNMBX()
    defaultLocationProvider = locationProvider
    super.init()
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.delegate = self
    }
    RNMBXLocationModule.shared = self
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
    if minDisplacement >= 0.0 {
      if let locationProvider = locationProvider as? LocationProviderRNMBX {
        locationProvider.setDistanceFilter(minDisplacement)
      }
    }
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.start()
    }
  }
  
  @objc func stop() {
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.stop()
    }
  }
  
  @objc func getLastKnownLocation() -> RNMBXLocation? {
    return RNMBXLocation()
  }
  
  @objc func setMinDisplacement(_ minDisplacement: CLLocationDistance) {
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.setDistanceFilter(minDisplacement)
    }
  }

  @objc func setRequestsAlwaysUse(_ requestsAlwaysUse: Bool) {
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.setRequestsAlwaysUse(requestsAlwaysUse)
    }
  }

  @objc func simulateHeading(_ changesPerSecond: NSNumber, increment: NSNumber) {
    if let locationProvider = locationProvider as? LocationProviderRNMBX {
      locationProvider.simulateHeading(changesPerSecond: changesPerSecond.intValue, increment: increment.doubleValue)
    }
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
  
  func locationManager(_ locationManager: LocationProviderRNMBX, didUpdateLocation location: RNMBXLocation) {
    guard hasListener, let _ = bridge else {
      return
    }

    if shouldSendLocationEvent() {
      self.sendEvent(withName: RCT_MAPBOX_USER_LOCATION_UPDATE, body: location.toJSON())
    }
  }
  
  func override(for locationManager: LocationManager) {
    if let locationModule = RNMBXLocationModule.shared {
      var isSameProvider = false
      if let currentProvider = locationManager.locationProvider as? AnyObject, let newProvider = locationModule.locationProvider as? AnyObject {
        if currentProvider === newProvider {
          isSameProvider = true
        }
      }
      if !isSameProvider {
        locationManager.overrideLocationProvider(with: locationModule.locationProvider)
      }
    }
  }
  
  func resetLocationProvider() {
    if let defaultLocationProvider = defaultLocationProvider {
      self.locationProvider = defaultLocationProvider
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

#endif

