import Foundation
import MapboxMaps
import Turf

protocol RCTMGLMapComponent {
  func addToMap(_ map: RCTMGLMapView, style: Style)
  func removeFromMap(_ map: RCTMGLMapView)
  
  func waitForStyleLoad() -> Bool
}

enum CameraMode: String, CaseIterable {
  case flight, ease, linear, none
}

struct CameraUpdateItem {
  var camera: CameraOptions
  var mode: CameraMode
  var duration: TimeInterval?
  
  func execute(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?) {
    switch mode {
      case .flight:
        var _camera = camera
        _camera.padding = nil
        map.camera.fly(to: _camera, duration: duration)
        changePadding(map: map, cameraAnimator: &cameraAnimator, curve: .linear)
      case .ease:
        map.camera.ease(to: camera, duration: duration ?? 0, curve: .easeInOut, completion: nil)
      case .linear:
        map.camera.ease(to: camera, duration: duration ?? 0, curve: .linear, completion: nil)
      case .none:
        map.mapboxMap.setCamera(to: camera)
      default:
        map.mapboxMap.setCamera(to: camera)
    }
  }
  
  /// Padding is not currently animatable on the camera's `fly(to:)` method, so we create a separate animator instead.
  /// If this changes, remove this and call `fly(to:)` with an unmodified `camera`.
  func changePadding(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?, curve: UIView.AnimationCurve) {
    if let cameraAnimator = cameraAnimator {
      cameraAnimator.stopAnimation()
    }
    cameraAnimator = map.camera.makeAnimator(duration: duration ?? 0, curve: curve) { (transition) in
      transition.padding.toValue = camera.padding
    }
    cameraAnimator?.startAnimation()
  }
}

class CameraUpdateQueue {
  var queue: [CameraUpdateItem] = [];
  
  func dequeue() -> CameraUpdateItem? {
    guard !queue.isEmpty else {
      return nil
    }
    return queue.removeFirst()
  }
  
  func enqueue(stop: CameraUpdateItem) {
    queue.append(stop)
  }
  
  func execute(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?) {
    guard let stop = dequeue() else {
      return
    }
    
    stop.execute(map: map, cameraAnimator: &cameraAnimator)
  }
}

open class RCTMGLMapComponentBase : UIView, RCTMGLMapComponent {
  private var _map: RCTMGLMapView! = nil
  private var _mapCallbacks: [(RCTMGLMapView) -> Void] = []
  
  var map : RCTMGLMapView? {
    return _map;
  }

  func withMapView(_ callback: @escaping (_ mapView: MapView) -> Void) {
    withRCTMGLMapView { mapView in
      callback(mapView.mapView)
    }
  }

  func withRCTMGLMapView(_ callback: @escaping (_ map: RCTMGLMapView) -> Void) {
    if let map = _map {
      callback(map)
    } else {
      _mapCallbacks.append(callback)
    }
  }
  
  func waitForStyleLoad() -> Bool {
    return false
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    _mapCallbacks.forEach { callback in
        callback(map)
    }
    _mapCallbacks = []
    _map = map
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    _mapCallbacks = []
    _map = nil
  }
}

class RCTMGLCamera : RCTMGLMapComponentBase, LocationConsumer {
  var cameraAnimator: BasicCameraAnimator?
  let cameraUpdateQueue = CameraUpdateQueue()

  // Properties set on RCTMGLCamera in React Native.
  
  @objc var defaultStop: [String: Any]?
  
  @objc var stop: [String: Any]? {
    didSet {
      _updateCamera()
    }
  }
  
  @objc var minZoomLevel: NSNumber?

  @objc var maxZoomLevel: NSNumber?

  @objc var followUserLocation : Bool = false {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  
  // Update methods.

  func _updateCameraFromJavascript() {
    guard !followUserLocation else {
      return
    }
    
    guard let stop = stop else {
      return
    }
    
    /*
    V10 TODO
    if let map = map, map.userTrackingMode != .none {
      map.userTrackingMode = .none
    }
    */

    if let stops = stop["stops"] as? [[String:Any]] {
      stops.forEach {
        cameraUpdateQueue.enqueue(stop: toUpdateItem(stop: $0))
      }
    } else {
      cameraUpdateQueue.enqueue(stop: toUpdateItem(stop: stop))
    }

    if let map = map {
      cameraUpdateQueue.execute(map: map, cameraAnimator: &cameraAnimator)
    }
  }
  
  func _updateCameraFromTrackingMode() {
    withMapView { map in
      if let locationModule = RCTMGLLocationModule.shared {
        map.location.overrideLocationProvider(with: locationModule.locationProvider)
      }
      map.location.locationProvider.requestWhenInUseAuthorization()
      map.location.addLocationConsumer(newConsumer: self)
    }
  }
  
  private func toUpdateItem(stop: [String: Any]) -> CameraUpdateItem {
    var zoom: CGFloat?
    if let z = stop["zoom"] as? Double {
      zoom = CGFloat(z)
    }
    
    var pitch: CGFloat?
    if let p = stop["pitch"] as? Double {
      pitch = CGFloat(p)
    }
    
    var heading: CLLocationDirection?
    if let h = stop["heading"] as? Double {
      heading = CLLocationDirection(h)
    }
    
    let padding = UIEdgeInsets(
      top: stop["paddingTop"] as? Double ?? 0,
      left: stop["paddingLeft"] as? Double ?? 0,
      bottom: stop["paddingBottom"] as? Double ?? 0,
      right: stop["paddingRight"] as? Double ?? 0
    )

    var center: LocationCoordinate2D?
    if let feature: String = stop["centerCoordinate"] as? String {
      let centerFeature : Turf.Feature? = try!
        JSONDecoder().decode(Turf.Feature.self, from: feature.data(using: .utf8)!)
        
      switch centerFeature?.geometry {
      case .point(let centerPoint):
        center = centerPoint.coordinates
      default:
        fatalError("Unexpected geometry: \(String(describing: centerFeature?.geometry))")
      }
    } else if let feature: String = stop["bounds"] as? String {
      let collection : Turf.FeatureCollection? = try!
        JSONDecoder().decode(Turf.FeatureCollection.self, from: feature.data(using: .utf8)!)
      let features = collection?.features
      
      let ne: CLLocationCoordinate2D
      switch features?.first?.geometry {
        case .point(let point):
          ne = point.coordinates
        default:
          fatalError("Unexpected geometry: \(String(describing: features?.first?.geometry))")
      }
      
      let sw: CLLocationCoordinate2D
      switch features?.last?.geometry {
        case .point(let point):
          sw = point.coordinates
        default:
          fatalError("Unexpected geometry: \(String(describing: features?.last?.geometry))")
      }
      
      withMapView { map in
        let bounds = CoordinateBounds(southwest: sw, northeast: ne)
        let camera = map.mapboxMap.camera(
          for: bounds,
          padding: padding,
          bearing: heading ?? map.cameraState.bearing,
          pitch: pitch ?? map.cameraState.pitch
        )

        if let _center = camera.center, let _zoom = camera.zoom {
          center = _center
          zoom = _zoom
        }
      }
    }

    let duration: TimeInterval? = {
      if let d = stop["duration"] as? Double {
        return toSeconds(d)
      }
      return nil
    }()
    
    let mode: CameraMode = {
      if let m = stop["mode"] as? String, let m = CameraMode(rawValue: m) {
        return m
      }
      return .flight
    }()
    
    if let z1 = minZoomLevel, let z2 = CGFloat(exactly: z1), zoom! < z2 {
      zoom = z2
    }

    if let z1 = maxZoomLevel, let z2 = CGFloat(exactly: z1), zoom! > z2 {
      zoom = z2
    }

    let result = CameraUpdateItem(
      camera: CameraOptions(
        center: center,
        padding: padding,
        anchor: nil,
        zoom: zoom,
        bearing: heading,
        pitch: pitch
      ),
      mode: mode,
      duration: duration
    )
    return result
  }
  
  func _updateCamera() {
    if let _ = map {
      if followUserLocation {
        self._updateCameraFromTrackingMode()
      } else {
        self._updateCameraFromJavascript()
      }
    }
  }
  
  func _setInitialCamera() {
    guard let stop = self.defaultStop, let map = map else {
      return
    }
    
    var updateItem = toUpdateItem(stop: stop)
    updateItem.mode = .none
    updateItem.duration = 0
    updateItem.execute(map: map, cameraAnimator: &cameraAnimator)
  }
  
  func initialLayout() {
    _setInitialCamera()
    _updateCamera()
  }
  
  override func addToMap(_ map: RCTMGLMapView, style: Style) {
    super.addToMap(map, style: style)
    map.reactCamera = self
  }
  
  // MARK: - LocationConsumer
  
  func locationUpdate(newLocation: Location) {
    if followUserLocation {
      withMapView { map in
        map.camera.ease(to: CameraOptions(center: newLocation.coordinate, zoom: 15), duration: 1.3)
      }
    }
  }
}

/// Converts milliseconds to seconds.
private func toSeconds(_ ms: Double) -> TimeInterval {
  return ms * 0.001
}
