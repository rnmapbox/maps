import Foundation
import MapboxMaps
import Turf

protocol RCTMGLMapComponent : AnyObject {
  func addToMap(_ map: RCTMGLMapView, style: Style)
  func removeFromMap(_ map: RCTMGLMapView)
  
  func waitForStyleLoad() -> Bool
}

enum CameraMode: String, CaseIterable {
  case flight, ease, linear, none
}

enum UserTrackingMode: String {
  case none, compass, course, normal
}

struct CameraUpdateItem {
  var camera: CameraOptions
  var mode: CameraMode
  var duration: TimeInterval?
  
  func execute(map: RCTMGLMapView, cameraAnimator: inout BasicCameraAnimator?) {
    logged("CameraUpdateItem.execute") {
      if let center = camera.center {
        try center.validate()
      }
      switch mode {
        case .flight:
          map.camera.fly(to: camera, duration: duration)
        case .ease:
          map.camera.ease(to: camera, duration: duration ?? 0, curve: .easeInOut, completion: nil)
        case .linear:
          map.camera.ease(to: camera, duration: duration ?? 0, curve: .linear, completion: nil)
        default:
          map.mapboxMap.setCamera(to: camera)
      }
    }
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
  private weak var _map: RCTMGLMapView! = nil
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

  // MARK: React properties
  
  @objc var animationDuration: NSNumber?
  @objc var animationMode: NSString?
  @objc var defaultStop: [String: Any]?
  @objc var followHeading: NSNumber? {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  @objc var followPitch: NSNumber? {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  @objc var followUserMode: String? {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  @objc var followUserLocation : Bool = false {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  @objc var followZoomLevel: NSNumber? {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }
  @objc var maxZoomLevel: NSNumber? {
    didSet { _updateMaxBounds() }
  }
  @objc var minZoomLevel: NSNumber? {
    didSet { _updateMaxBounds() }
  }
  @objc var onUserTrackingModeChange: RCTBubblingEventBlock? = nil
  @objc var stop: [String: Any]? {
    didSet {
      _updateCamera()
    }
  }

  @objc var maxBounds: String? {
    didSet {
      if let maxBounds = maxBounds {
        logged("RCTMGLCamera.maxBounds") {
          maxBoundsFeature = try JSONDecoder().decode(FeatureCollection.self, from: maxBounds.data(using: .utf8)!)
        }
      } else {
        maxBoundsFeature = nil
      }
      _updateMaxBounds()
    }
  }
  var maxBoundsFeature : FeatureCollection? = nil
  
  // MARK: Update methods

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
        if let stop = toUpdateItem(stop: $0) {
          cameraUpdateQueue.enqueue(stop: stop)
        }
      }
    } else {
      if let stop = toUpdateItem(stop: stop) {
        cameraUpdateQueue.enqueue(stop: stop)
      }
    }

    if let map = map {
      cameraUpdateQueue.execute(map: map, cameraAnimator: &cameraAnimator)
    }
  }
  
  func _disableUsetTracking(_ map: MapView) {
    map.viewport.idle()
    map.location.removeLocationConsumer(consumer: self)
  }
  
  func _toCoordinateBounds(_ bounds: FeatureCollection) throws -> CoordinateBounds  {
    guard bounds.features.count == 2 else {
      throw RCTMGLError.paramError("Expected two Points in FeatureColletion")
    }
    let swFeature = bounds.features[0]
    let neFeature = bounds.features[1]
    
    guard case let .point(sw) = swFeature.geometry,
          case let .point(ne) = neFeature.geometry else {
      throw RCTMGLError.paramError("Expected two Points in FeatureColletion")
    }

    return CoordinateBounds(southwest: sw.coordinates, northeast: ne.coordinates)
  }
  
  func _updateMaxBounds() {
    withMapView { map in
      var options = CameraBoundsOptions()
      
      if let maxBounds = self.maxBoundsFeature {
        logged("RCTMGLCamera._updateMaxBounds._toCoordinateBounds") {
          options.bounds = try self._toCoordinateBounds(maxBounds)
        }
      }
      if let minZoomLevel = self.minZoomLevel {
        options.minZoom = minZoomLevel.CGFloat
      }
      if let maxZoomLevel = self.maxZoomLevel {
        options.maxZoom = maxZoomLevel.CGFloat
      }

      logged("RCTMGLCamera._updateMaxBounds") {
        try map.mapboxMap.setCameraBounds(with: options)
      }
    }
  }

  func _updateCameraFromTrackingMode() {
    withMapView { map in
      let userTrackingMode = UserTrackingMode(rawValue: self.followUserMode ?? UserTrackingMode.normal.rawValue)
      guard let userTrackingMode = userTrackingMode else {
        Logger.error("RCTMGLCamera: Unexpected followUserMode \(optional: self.followUserMode)")
        self._disableUsetTracking(map)
        return
      }

      guard self.followUserLocation && userTrackingMode != .none else {
        self._disableUsetTracking(map)
        return
      }

      if let locationModule = RCTMGLLocationModule.shared {
        map.location.overrideLocationProvider(with: locationModule.locationProvider)
      }
      map.location.locationProvider.requestWhenInUseAuthorization()
      map.location.addLocationConsumer(newConsumer: self)
      var trackingModeChanged = false
      var followOptions = FollowPuckViewportStateOptions()
      switch userTrackingMode {
      case .none:
        Logger.assert("RCTMGLCamera, userTrackingModes should not be none here")
      case .compass:
        map.location.options.puckBearingEnabled = true
        map.location.options.puckBearingSource = PuckBearingSource.heading
        followOptions.bearing = FollowPuckViewportStateBearing.heading
        trackingModeChanged = true
      case .course:
        map.location.options.puckBearingEnabled = true
        map.location.options.puckBearingSource = PuckBearingSource.course
        followOptions.bearing = FollowPuckViewportStateBearing.course
        trackingModeChanged = true
      case .normal:
        map.location.options.puckBearingEnabled = false
        followOptions.bearing = nil
        trackingModeChanged = true
      }
      if let onUserTrackingModeChange = self.onUserTrackingModeChange {
        if (trackingModeChanged) {
          let event = RCTMGLEvent(type: .onUserTrackingModeChange, payload: ["followUserMode": self.followUserMode ?? "normal", "followUserLocation": self.followUserLocation])
          onUserTrackingModeChange(event.toJSON())
        }
      }
      var _camera = CameraOptions()
      if let followHeading = self.followHeading as? CGFloat {
        if (followHeading >= 0.0) {
          _camera.bearing = followHeading
        }
      } else if let stopHeading = self.stop?["heading"] as? CGFloat {
        if (stopHeading >= 0.0) {
          _camera.bearing = stopHeading
        }
      }
      if let followPitch = self.followPitch as? CGFloat {
        if (followPitch >= 0.0) {
          _camera.pitch = followPitch
          followOptions.pitch = followPitch
        }
      } else if let stopPitch = self.stop?["pitch"] as? CGFloat {
        if (stopPitch >= 0.0) {
          _camera.pitch = stopPitch
          followOptions.pitch = stopPitch
        }
      } else {
        followOptions.pitch = nil
      }

      if let zoom = self.followZoomLevel as? CGFloat {
        if (zoom >= 0.0) {
          _camera.zoom = zoom
          followOptions.zoom = zoom
        }
      }
      let followState = map.viewport.makeFollowPuckViewportState(options: followOptions)
      map.viewport.transition(to: followState)
      map.mapboxMap.setCamera(to: _camera)
    }
  }
  
  private func toUpdateItem(stop: [String: Any]) -> CameraUpdateItem? {
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
      
      let centerFeature : Turf.Feature? = logged("RCTMGLCamera.toUpdateItem.decode.cc") { try
        JSONDecoder().decode(Turf.Feature.self, from: feature.data(using: .utf8)!)
      }
      
      switch centerFeature?.geometry {
      case .point(let centerPoint):
        center = centerPoint.coordinates
      default:
        Logger.log(level: .error, message: "RCTMGLCamera.toUpdateItem: Unexpected geometry: \(String(describing: centerFeature?.geometry))")
        return nil
      }
    } else if let feature: String = stop["bounds"] as? String {
      let collection : Turf.FeatureCollection? = logged("RCTMGLCamera.toUpdateItem.decode.bound") { try
        JSONDecoder().decode(Turf.FeatureCollection.self, from: feature.data(using: .utf8)!) }
      let features = collection?.features
      
      let ne: CLLocationCoordinate2D
      switch features?.first?.geometry {
        case .point(let point):
          ne = point.coordinates
        default:
          Logger.log(level: .error, message: "RCTMGLCamera.toUpdateItem: Unexpected geometry: \(String(describing: features?.first?.geometry))")
          return nil
      }
      
      let sw: CLLocationCoordinate2D
      switch features?.last?.geometry {
        case .point(let point):
          sw = point.coordinates
        default:
          Logger.log(level: .error, message: "RCTMGLCamera.toUpdateItem: Unexpected geometry: \(String(describing: features?.last?.geometry))")
          return nil
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
    
    if let z1 = minZoomLevel, let z2 = CGFloat(exactly: z1), zoom ?? 100 < z2 {
      zoom = z2
    }

    if let z1 = maxZoomLevel, let z2 = CGFloat(exactly: z1), zoom ?? 0 > z2 {
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
    
    if var updateItem = toUpdateItem(stop: stop) {
      updateItem.mode = .none
      updateItem.duration = 0
      updateItem.execute(map: map, cameraAnimator: &cameraAnimator)
    }
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
    // viewport manages following user location
    if false && followUserLocation {
      withMapView { map in
        var animationType = CameraMode.none
        if let m = self.animationMode as? String, let m = CameraMode(rawValue: m) {
          animationType = m
        }
        let _camera = CameraOptions(center: newLocation.coordinate)
        let _duration = self.animationDuration as? Double ?? 0.5
        switch (animationType) {
          case .flight:
            map.camera.fly(to: _camera, duration: _duration)
          case .ease:
            map.camera.ease(to: _camera, duration: _duration, curve: .easeInOut, completion: nil)
          case .linear:
            map.camera.ease(to: _camera, duration: _duration, curve: .linear, completion: nil)
          default:
            map.mapboxMap.setCamera(to: CameraOptions(center: newLocation.coordinate))
        }
      }
    }
  }
}

private func toSeconds(_ ms: Double) -> TimeInterval {
  return ms * 0.001
}
