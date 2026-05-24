import MapboxMaps

let TAG = "RNMBXCustomLocationProvider"

@objc
public class RNMBXCustomLocationProvider: UIView, RNMBXMapAndMapViewComponent {
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
    if customLocationProvider != nil {
      changes.apply(self)
    }
  }

  var customLocationProvider: CustomLocationProvider? = nil

  public func addToMap(_ map: RNMBXMapView, mapView: MapView, style: Style) {
    self.map = map
    installCustomeLocationProviderIfNeeded(mapView: mapView)
    changes.apply(self)
  }

  private func applyCoordinate() {
    updateCoordinate(latitude: coordinate[1], longitude: coordinate[0])
  }

  private func applyHeading() {
    updateHeading(heading: heading.doubleValue)
  }

  public func removeFromMap(_ map: RNMBXMapView, mapView: MapView, reason: RemovalReason) -> Bool {
    removeCustomLocationProvider(mapView: mapView)
    self.map = nil
    return true
  }

  // Uses default implementation from RNMBXMapComponentProtocol extension (returns false)
}

// MARK: V11 location provider
extension RNMBXCustomLocationProvider {
  func installCustomeLocationProviderIfNeeded(mapView: MapView) {
    if (customLocationProvider == nil) {
      let customLocationProvider = CustomLocationProvider()
      self.customLocationProvider = customLocationProvider
      applyHeading()
      if (!coordinate.isEmpty) {
        applyCoordinate()
      }

      if let locationModule = RNMBXLocationModule.shared {
        locationModule.locationProvider = customLocationProvider
        locationModule.override(for: mapView.location)
      }

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
