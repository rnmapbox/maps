#if RNMBX_11
import MapboxMaps

let RCT_MAPBOX_USER_LOCATION_UPDATE = "MapboxUserLocationUpdate";

@objc(RNMBXLocation)
class RNMBXLocation: NSObject {
  var location : Location? = nil
  
  var heading : Heading? = nil

  var timestamp: Date? = nil

  func toJSON() -> [String:Any?] {
    var coords: [String:Any?] = [:]
    
    if let location = location {
      coords = coords.merging([
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "altitude": location.altitude,
        "accuracy": location.horizontalAccuracy,
        "course": location.bearing,
        "speed": location.speed
      ]) { (_, new ) in new }
    }
    if let heading = heading {
      coords = coords.merging([
        "heading": heading.direction
      ]) { (_, new) in new }
    }
    
    return [
      "coords": coords,
      "timestamp": (timestamp ?? location?.timestamp ?? heading?.timestamp ?? Date()).timeIntervalSince1970 * 1000
    ]
  }
}

/*
class RNMBXAppleLocationProviderProxy : LocationProvider & HeadingProvider {
  var origProvider : AppleLocationProvider
  
  var headingSimulator: Timer? = nil
  var simulatedHeading: Double = 0.0
  var simulatedHeadingIncrement: Double = 1.0
  
  public var options: AppleLocationProvider.Options {
    get {
      origProvider.options
    }
    set {
      origProvider.options = newValue
    }
  }
  
  var onLocationUpdate: Signal<[Location]> {
    get {
      origProvider.onLocationUpdate
    }
  }
  
  var onHeadingUpdate: Signal<Heading> {
    get {
      origProvider.onHeadingUpdate
    }
  }
  
  init(provider: AppleLocationProvider) {
    self.origProvider = provider
  }
  
  func addLocationObserver(for observer: LocationObserver) {
    origProvider.addLocationObserver(for: observer)
  }
  
  func removeLocationObserver(for observer: LocationObserver) {
    origProvider.removeLocationObserver(for: observer)
  }
  
  func getLastObservedLocation() -> Location? {
    origProvider.getLastObservedLocation()
  }
  
  var latestHeading: MapboxMaps.Heading? {
    get {
      return origProvider.latestHeading
    }
  }
  
  var latestLocation: MapboxMaps.Location? {
    get {
      return origProvider.latestLocation
    }
  }
  
  func add(headingObserver: MapboxMaps.HeadingObserver) {
    origProvider.add(headingObserver: headingObserver)
  }
  
  func remove(headingObserver: MapboxMaps.HeadingObserver) {
    origProvider.remove(headingObserver: headingObserver)
  }
}

// MARK: - heading simulation

extension RNMBXAppleLocationProviderProxy {
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
*/

// MARK: - RNMBXLocationModule

@objc(RNMBXLocationModule)
class RNMBXLocationModule: RCTEventEmitter {
  static weak var shared : RNMBXLocationModule? = nil
  
  // var _locationProvider : RNMBXAppleLocationProviderProxy = RNMBXAppleLocationProviderProxy(provider: AppleLocationProvider())
  var _locationProvider : AppleLocationProvider = AppleLocationProvider()
  var locationUpdateObserver : AnyCancelable? = nil
  var locationHeadingObserver : AnyCancelable? = nil
  
  var actLocation : RNMBXLocation = RNMBXLocation()
  
  var hasListener : Bool = false

  var throttler = EventThrottler()

  override init() {
    super.init()
    RNMBXLocationModule.shared = self
  }
  
  func override(for locationManager: LocationManager) {
    locationManager.override(provider: _locationProvider)
  }
  
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc override func supportedEvents() -> [String]
  {
    return [RCT_MAPBOX_USER_LOCATION_UPDATE];
  }
  
  @objc func start(_ minDisplacement: CLLocationDistance) {
    var newOptions = _locationProvider.options
    newOptions.distanceFilter = minDisplacement
    if minDisplacement >= 0.0 { _locationProvider.options = newOptions }
    
    locationUpdateObserver?.cancel()
    locationUpdateObserver = _locationProvider.onLocationUpdate.observe { location in
      guard self.hasListener else { return }
  
      self.actLocation.location = location.last
      self.throttler.perform {
        self.sendEvent(withName: RCT_MAPBOX_USER_LOCATION_UPDATE, body: self.actLocation.toJSON())
      }
    }
    locationHeadingObserver?.cancel()
    locationHeadingObserver = _locationProvider.onHeadingUpdate.observe { heading in
      guard self.hasListener else { return }

      self.actLocation.heading = heading
      self.throttler.perform {
        self.sendEvent(withName: RCT_MAPBOX_USER_LOCATION_UPDATE, body: self.actLocation.toJSON())
      }
    }
  }
  
  @objc func stop() {
    locationUpdateObserver?.cancel()
    locationUpdateObserver = nil
    locationHeadingObserver?.cancel()
    locationHeadingObserver = nil
    throttler.cancel()
  }
  
  @objc func getLastKnownLocation() -> RNMBXLocation? {
    let last = RNMBXLocation()
    last.heading = _locationProvider.latestHeading
    last.location = _locationProvider.latestLocation
    return last
  }
  
  @objc func setMinDisplacement(_ minDisplacement: CLLocationDistance) {
    var newOptions = _locationProvider.options
    newOptions.distanceFilter = minDisplacement
    _locationProvider.options = newOptions
  }
  
  @objc
  func setLocationEventThrottle(_ throttleValue:NSNumber) {
    let throttleValue = throttleValue.doubleValue
    if throttleValue > 0.0 {
      throttler.waitBetweenEvents = throttleValue
    } else {
      throttler.waitBetweenEvents = nil
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
    throttler.cancel()
    hasListener = false
  }

  var locationProvider : LocationProvider & HeadingProvider {
    get {
      return _locationProvider
    }
  }
}

class EventThrottler {
  var waitBetweenEvents: Double? = nil
  var lastSentTimestamp: Double? = nil
  
  func shouldSend() -> Bool {
    guard let waitBetweenEvents = waitBetweenEvents, waitBetweenEvents > 0 else {
      return true
    }
  
    let currentTimestamp: Double = CACurrentMediaTime() * 1000.0
    
    guard let lastSentTimestamp = lastSentTimestamp else {
      self.lastSentTimestamp = currentTimestamp
      return true;
    }
    
    if (currentTimestamp - lastSentTimestamp > waitBetweenEvents) {
      self.lastSentTimestamp = currentTimestamp
      return true;
    }
     
    return false;
  }
  
  func cancel() {}
  
  func shouldTrhottle() -> Bool {
    return !shouldSend()
  }
  
  func perform(action: @escaping () -> Void) {
    if shouldSend() {
      action()
    }
  }
}
#endif
