import Foundation
import MapboxMaps
import Turf

protocol RCTMGLMapComponent {
  func addToMap(_ map: RCTMGLMapView)
  func removeFromMap(_ map: RCTMGLMapView)
}

/// See `MGLModule.swift:constantsToExport:CameraModes.`
enum Mode: String, CaseIterable {
  case flight, ease, linear, none
}

struct CameraUpdateItem {
  var camera: CameraOptions
  var padding: UIEdgeInsets?
  var mode: Mode
  var duration: TimeInterval?

  func execute(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?) {
    switch mode {
      case .flight:
        map.camera.fly(to: camera, duration: duration)
      case .ease:
        map.camera.ease(to: camera, duration: duration ?? 0, curve: .easeInOut, completion: nil)
        changePadding(map: map, cameraAnimator: &cameraAnimator, curve: .easeInOut)
      case .linear:
        map.camera.ease(to: camera, duration: duration ?? 0, curve: .linear, completion: nil)
        changePadding(map: map, cameraAnimator: &cameraAnimator, curve: .linear)
      case .none:
        map.mapboxMap.setCamera(to: camera)
    }
  }
  
  /// Padding is not currently animatable on the camera, so we create a separate animator instead.
  /// If this changes, remove this and set `camera.padding` directly.
  func changePadding(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?, curve: UIView.AnimationCurve) {
    if let cameraAnimator = cameraAnimator {
      cameraAnimator.stopAnimation()
    }
    cameraAnimator = map.camera.makeAnimator(duration: duration ?? 0, curve: curve) { (transition) in
      transition.padding.toValue = padding
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
  
  func addToMap(_ map: RCTMGLMapView) {
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
  var defaultStop : [String:Any]? = nil
    
  @objc var stop : [String:Any]? = nil {
    didSet {
      _updateCamera()
    }
  }
  
  var cameraAnimator: BasicCameraAnimator?
  let cameraUpdateQueue = CameraUpdateQueue()

  @objc
  var followUserLocation : Bool = false {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }

  func toTimeInterval(_ duration: Double) -> TimeInterval {
    return duration*0.001
  }
  
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
  
  func toUpdateItem(stop: [String:Any]) -> CameraUpdateItem {    
    var zoom: CGFloat = 11
    if let z = stop["zoom"] as? Double {
      zoom = CGFloat(z)
    }
    
    var pitch: CGFloat = 0
    if let p = stop["pitch"] as? Double {
      pitch = CGFloat(p)
    }
    
    var heading: CLLocationDirection = 0
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
        let camera = map.mapboxMap.camera(for: bounds, padding: padding, bearing: heading, pitch: pitch)
        if let _center = camera.center, let _zoom = camera.zoom {
          center = _center
          zoom = _zoom
        }
      }
    }

    let duration: TimeInterval? = {
      if let d = stop["duration"] as? Double {
        return self.toTimeInterval(d)
      }
      return nil
    }()
    
    let mode: Mode = {
      if let m = stop["mode"] as? String, let m = Mode(rawValue: m) {
        return m
      }
      return .flight
    }()

    let result = CameraUpdateItem(
      camera: CameraOptions(
        center: center,
        anchor: .zero,
        zoom: zoom,
        bearing: heading,
        pitch: pitch
      ),
      padding: padding,
      mode: mode,
      duration: duration
    )
    return result
  }
  
  @objc func setDefaultStop(_ stop: [String:Any]?) {
    self.defaultStop = stop
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
  
  override func addToMap(_ map: RCTMGLMapView) {
    super.addToMap(map)
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
