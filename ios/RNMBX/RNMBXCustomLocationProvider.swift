import MapboxMaps

let TAG = "RNMBXCustomLocationProvider"

@objc
public class RNMBXCustomLocationProvider: UIView, RNMBXMapComponent {
  var map: RNMBXMapView? = nil
  
  let changes : PropertyChanges<RNMBXCustomLocationProvider> = PropertyChanges()
  
  enum Property: String {
    case coordinate
    case heading
    
    func apply(locationProvider: RNMBXCustomLocationProvider) {
      switch self {
        case .coordinate: locationProvider.applyCoordinate()
        case .heading: locationProvider.applyHeading()
      }
    }
  }
  
  @objc
  public var coordinate: [Double] = [] {
    didSet { changed(.coordinate) }
  }
    
  @objc
  public var heading: NSNumber = 0.0 {
    didSet { changed(.heading) }
  }
  
  func changed(_ property: Property) {
    changes.add(name: property.rawValue, update: property.apply)
  }
  
  @objc
  override public func didSetProps(_ props: [String]) {
    changes.apply(self)
  }
  
  var customLocationProvider: CustomLocationProvider? = nil
  #if RNMBX_11
  #else
  var defaultLocationProvider: LocationProvider?
  #endif

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    if let mapView = map.mapView {
      installCustomeLocationProviderIfNeeded(mapView: mapView)
    }
  }
  
  private func applyCoordinate() {
    updateCoordinate(latitude: coordinate[1], longitude: coordinate[0])
  }
  
  private func applyHeading() {
    updateHeading(heading: heading.doubleValue)
  }
  
  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    if let mapView = map.mapView {
      removeCustomLocationProvider(mapView: mapView)
    }
    self.map = nil
    return true
  }

  public func waitForStyleLoad() -> Bool {
    false
  }
}

#if RNMBX_11
// MARK: V11 location provider
extension RNMBXCustomLocationProvider {
  func installCustomeLocationProviderIfNeeded(mapView: MapView) {
    if (customLocationProvider == nil) {
      let customLocationProvider = CustomLocationProvider()
      self.customLocationProvider = customLocationProvider
      
      if let locationModule = RNMBXLocationModule.shared {
        locationModule.locationProvider = customLocationProvider
        locationModule.override(for: mapView.location)
        //locationModule.locationProvider = customLocationProvider
        // mapView.location.overrideLocationProvider(with: customLocationProvider!)
      }
      
      // customHeadingProvider = CustomHeadingProvider()
      mapView.location.override(locationProvider: customLocationProvider, headingProvider: customLocationProvider)
    }
  }
  
  func removeCustomLocationProvider(mapView: MapView) {
    mapView.location.override(provider: AppleLocationProvider())
    if let locationModule = RNMBXLocationModule.shared {
      locationModule.locationProvider = AppleLocationProvider()
    }
    customLocationProvider = nil
  }
  
  func updateCoordinate(latitude: Double, longitude: Double) {
    customLocationProvider?.setLocation(latitude: NSNumber(floatLiteral: latitude), longitude: NSNumber(floatLiteral: longitude))
  }
  
  func updateHeading(heading: Double) {
    customLocationProvider?.setHeading(heading: NSNumber(floatLiteral: heading))
  }
}
#else
// MARK: V10 location provider
extension RNMBXCustomLocationProvider {
  func installCustomeLocationProviderIfNeeded(mapView: MapView) {
    if (customLocationProvider == nil) {
      if (defaultLocationProvider == nil) {
        defaultLocationProvider = mapView.location.locationProvider
      }
      let customLocationProvider = CustomLocationProvider()
      self.customLocationProvider = customLocationProvider
      if let locationModule = RNMBXLocationModule.shared {
        locationModule.locationProvider = customLocationProvider
        locationModule.override(for: mapView.location)
      } else {
        Logger.error(TAG, "RNMBXLocationModule.shared is nil")
        mapView.location.overrideLocationProvider(with: customLocationProvider)
      }
      
    }
  }
  
  func removeCustomLocationProvider(mapView: MapView) {
    if let locationModule = RNMBXLocationModule.shared {
      locationModule.resetLocationProvider()
      locationModule.override(for: mapView.location)
    } else if let provider = defaultLocationProvider {
      mapView.location.overrideLocationProvider(with: provider)
    }
    customLocationProvider = nil
  }
  
  func updareCoordinate(latitude: Double, longitude: Double) {
    customLocationProvider?.setLocation(latitude: NSNumber(floatLiteral: latitude), longitude: NSNumber(floatLiteral: longitude))
  }
  
  func updateCoordinate(latitude: Double, longitude: Double) {
    customLocationProvider?.setLocation(latitude: NSNumber(floatLiteral: latitude), longitude: NSNumber(floatLiteral: longitude))
  }
  
  func updateHeading(heading: Double) {
    customLocationProvider?.setHeading(heading: NSNumber(floatLiteral: heading))
  }
}
#endif


#if RNMBX_11
class CustomLocationProvider: LocationProvider & HeadingProvider {
  // MARK: LocationProvider
  private var observers: NSHashTable<AnyObject> = .weakObjects()
  private var location: Location? = nil

  func addLocationObserver(for observer: LocationObserver) {
    observers.add(observer)
  }

  func removeLocationObserver(for observer: LocationObserver) {
    observers.remove(observer)
  }

  func getLastObservedLocation() -> Location? {
    return location
  }

  func setLocation(latitude: NSNumber, longitude: NSNumber) {
    let lat = CLLocationDegrees(truncating: latitude)
    let lon = CLLocationDegrees(truncating: longitude)
    self.location = Location(clLocation: CLLocation(latitude: lat, longitude: lon))
    for observer in observers.allObjects {
      (observer as? LocationObserver)?.onLocationUpdateReceived(for: [self.location!])
    }
  }
  
  // MARK: HeadingProvider
  var latestHeading: Heading?
  private let headingObservers: NSHashTable<AnyObject> = .weakObjects()

  func add(headingObserver: HeadingObserver) {
    headingObservers.add(headingObserver)
  }

  func remove(headingObserver: HeadingObserver) {
    headingObservers.remove(headingObserver)
  }
    
  func setHeading(heading: NSNumber) {
    let latestHeading = Heading(direction: CLLocationDirection(truncating: heading), accuracy: CLLocationDirection(truncating: 1))
    self.latestHeading = latestHeading
    for observer in headingObservers.allObjects {
      (observer as? HeadingObserver)?.onHeadingUpdate(latestHeading)
    }
  }
}
#else
final public class CustomHeading: CLHeading {
    private var _magneticHeading: CLLocationDirection = 0
    
    public override var trueHeading: CLLocationDirection {
        get { -1 }
    }
    
    public override var magneticHeading: CLLocationDirection {
        get { _magneticHeading }
        set { _magneticHeading = newValue }
    }
}

class CustomLocationProvider: LocationProvider {
    var locationProviderOptions: MapboxMaps.LocationOptions = .init()
    
    var authorizationStatus: CLAuthorizationStatus = .authorizedAlways
    
    var accuracyAuthorization: CLAccuracyAuthorization = .fullAccuracy
    
    var heading: CLHeading?
    var location: CLLocation?
    var updateLocation = false
    var updateHeading = false
    
    var locationProviderDelegate: MapboxMaps.LocationProviderDelegate?
    
    func setDelegate(_ delegate: MapboxMaps.LocationProviderDelegate) {
        locationProviderDelegate = delegate
    }
    
    func setLocation(latitude: NSNumber, longitude: NSNumber) {
        let lat = CLLocationDegrees(truncating: latitude)
        let lon = CLLocationDegrees(truncating: longitude)
        self.location = CLLocation(latitude: lat, longitude: lon)
        if (updateLocation) {
          locationProviderDelegate?.locationProvider(self, didUpdateLocations: [self.location!])
        }
    }
    
    func setHeading(heading: NSNumber) {
        let latestHeading = CustomHeading()
        latestHeading.magneticHeading = CLLocationDirection(truncating: heading)
        self.heading = latestHeading
        if (self.updateHeading) {
          locationProviderDelegate?.locationProvider(self, didUpdateHeading: self.heading!)
        }
    }
    
    func requestAlwaysAuthorization() { }
    
    func requestWhenInUseAuthorization() { }
    
    func requestTemporaryFullAccuracyAuthorization(withPurposeKey purposeKey: String) { }
    
    func startUpdatingLocation() {
        self.updateLocation = true
    }
    
    func stopUpdatingLocation() {
        self.updateLocation = false
    }
    
    var headingOrientation: CLDeviceOrientation = .unknown
    
    func startUpdatingHeading() {
        self.updateHeading = true
    }
    
    func stopUpdatingHeading() {
        self.updateHeading = false
    }
    
    func dismissHeadingCalibrationDisplay() { }
}
#endif
