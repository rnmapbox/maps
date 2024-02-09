import MapboxMaps

@objc
public class RNMBXNativeUserLocation: UIView, RNMBXMapComponent {
  weak var map : RNMBXMapView! = nil
  var imageManager: ImageManager? = nil
  
  let locationLayerId = "location-layer"

  var locationLayer : LocationIndicatorLayer? = nil

  @objc
  public var iosShowsUserHeadingIndicator : Bool = false {
    didSet { _apply() }
  }
  
  enum PuckImagePart: String {
    case top
    case bearing
    case shadow
  }
  
  var imageNames: [PuckImagePart: String?] = [:]
  var subscriptions: [PuckImagePart: ImageManager.Subscription] = [:]
  var images: [PuckImagePart: UIImage] = [:]
  
  @objc
  public var topImage : String? = nil {
    didSet { imageNameUpdated(.top, topImage) }
  }

  @objc
  public var bearingImage : String? = nil {
    didSet { imageNameUpdated(.bearing, bearingImage) }
  }
    
  @objc
  public var shadowImage : String? = nil {
    didSet { imageNameUpdated(.shadow, shadowImage) }
  }
    
  @objc
  public var scale : Any? = nil
  
  @objc
  public var visible: Bool = false
  
  var _puckBearing: PuckBearing? = nil
  
  @objc
  public var puckBearing: String? {
    get {
      switch (_puckBearing) {
      case .heading:
        return "heading"
      case .course:
        return "course"
      case nil:
        return nil
      }
    }
    set(value) {
      switch(value) {
      case "heading":
        _puckBearing = .heading
      case "course":
        _puckBearing = .course
      case nil:
        _puckBearing = nil
      default:
        Logger.error("RNMBXNativeUserLocation puckBearing is unrecognized: \(optional: value)")
        _puckBearing = nil
      }
    }
  }
  
  @objc
  public var puckBearingEnabled: Bool = false
  
  @objc
  public var pulsing: NSDictionary? = nil

  @objc
  override public func didSetProps(_ props: [String]) {
    _apply()
  }

  func imageNameUpdated(_ image: PuckImagePart, _ name: String?) {
    imageNames[image] = name
    if let map = self.map {
      _fetchImages(map)
    }
  }
  
  func imageUpdated(_ image: PuckImagePart, _ uiImage: UIImage?) {
    if let uiImage = uiImage {
      images[image] = uiImage
    } else {
      images.removeValue(forKey: image)
    }
    _apply()
  }

  func toDoubleValue(value: Any?, name: String) -> Value<Double>? {
    if value == nil {
      return nil
    }
    switch value {
    case let value as NSNumber:
      return .constant(value.doubleValue)
    case let value as Int:
      return .constant(Double(value))
    case let value as Double:
      return .constant(value)
    case let value as Array<Any>:
      do {
        let data = try JSONSerialization.data(withJSONObject: value, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        return Value.expression(decodedExpression)
      } catch {
        Logger.error("toDoubleValue: \(name): unable to parse as expression \(value) with type: \(type(of:value))")
        return Value.constant(0.0)
      }
    default:
      Logger.error("toDoubleValue: \(name): has unknown type: \(type(of:value)) \(optional: value) ")
      return .constant(1.0)
    }
  }

  func _apply() {
    guard let map = self.map else {
      return
    }
    guard let mapView = map.mapView else {
      Logger.error("RNMBXNativeUserLocation mapView was nil")
      return
    }
    guard let location = mapView.location else {
      Logger.error("RNMBXNativeUserLocation location was nil")
      return
    }

    if (!visible) {
      let emptyImage = UIGraphicsImageRenderer(size: CGSize(width: 1, height: 1)).image { _ in }
      location.options.puckType = .puck2D(
        Puck2DConfiguration(
          topImage: emptyImage,
          bearingImage: emptyImage,
          shadowImage: emptyImage,
          scale: Value.constant(1.0)
        )
      )
      return
    } else {
      var configuration : Puck2DConfiguration = images.isEmpty ?
        .makeDefault(showBearing: puckBearingEnabled) : Puck2DConfiguration(
          topImage: self.images[.top],
          bearingImage: self.images[.bearing],
          shadowImage: self.images[.shadow])
      
      if let scale = toDoubleValue(value: scale, name: "scale") {
        configuration.scale = scale
      }
      
      if let pulsing = pulsing {
        if let kind = pulsing["kind"] as? String, kind == "default" {
          configuration.pulsing = .default
        } else {
          var pulsingConfig = Puck2DConfiguration.Pulsing()
          if let isEnabled = pulsing["isEnabled"] as? Bool {
            pulsingConfig.isEnabled = isEnabled
          }
          
          if let radius = pulsing["radius"] as? String {
            if radius == "accuracy" {
              pulsingConfig.radius = .accuracy
            } else {
              Logger.log(level: .error, message: "expected pulsing/radius to be either a number or accuracy but was \(radius)")
            }
          } else if let radius = pulsing["radius"] as? NSNumber {
            pulsingConfig.radius = .constant(radius.doubleValue)
          }
          
          if let color = pulsing["color"] {
            if let uicolor = RCTConvert.uiColor(color) {
              pulsingConfig.color = uicolor
            } else {
              Logger.log(level: .error, message: "expected color to be a color but was \(color)")
            }
          }
          
          configuration.pulsing = pulsingConfig
        }
      }
      location.options.puckType = .puck2D(configuration)
    }
    location.options.puckBearingEnabled = puckBearingEnabled
    if let puckBearing = _puckBearing {
      location.options.puckBearing = puckBearing
    }
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
 
    _fetchImages(map)
    _apply()
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    if let location = map.mapView.location {
      location.options.puckType = nil
      location.options.puckType = .none
    } else {
      Logger.error("RNMBXNativeUserLocation.removeFromMap: location is nil")
    }
    removeSubscriptions()
    self.map = nil

    return true
  }
  
  public func waitForStyleLoad() -> Bool {
    return true
  }
}

// MARK: fetch images and subscribe on updates

extension RNMBXNativeUserLocation {
  func subscribe(_ imageManager: ImageManager, _ image: PuckImagePart, _ name: String) {
    if let subscription = subscriptions[image] {
      subscription.cancel()
      subscriptions[image] = nil
      Logger.error("RNMBXNativeUserLocation.subscribe: there is already a subscription for image: \(image)")
    }

    subscriptions[image] = imageManager.subscribe(name: name) { name, uiImage in
      self.imageUpdated(image, uiImage)
    }
  }

  func removeSubscriptions() {
    self.subscriptions.forEach { (part,subscription) in
      subscription.cancel()
    }
    self.subscriptions.removeAll()
  }

  func _fetchImages(_ map: RNMBXMapView) {
    if let style = map.mapView?.mapboxMap?.style {
      imageNames.forEach { (part, name) in
        if let name = name {
          if style.imageExists(withId: name), let image = style.image(withId: name) {
            images[part] = image
          } else {
            images.removeValue(forKey: part)
          }
        } else {
          images.removeValue(forKey: part)
        }
      }
    }

    let imageManager = map.imageManager
    removeSubscriptions()
    self.imageManager = imageManager
    imageNames.forEach { (part,name) in
      if let name = name {
        subscribe(imageManager, part, name)
      }
    }
  }

}
