import MapboxMaps
import Turf

protocol RCTMGLMapComponent {
  func addToMap(_ map: RCTMGLMapView)
  func removeFromMap(_ map: RCTMGLMapView)
}

open class RCTMGLMapComponentBase : UIView, RCTMGLMapComponent {
  private var _map: RCTMGLMapView! = nil
  private var _mapCallbacks: [(RCTMGLMapView) -> Void] = []

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
  @objc
  var followUserLocation : Bool = false {
    didSet {
      _updateCameraFromTrackingMode()
    }
  }

  func toTimeInterval(_ duration: Double) -> TimeInterval {
    return duration*0.001
  }
  
  func _updateCameraFromTrackingMode() {
    withMapView { map in
      if let locationModule = RCTMGLLocationModule.shared {
        map.location.overrideLocationProvider(with: locationModule.locationProvider)
      }
      map.location
      map.location.locationProvider.requestWhenInUseAuthorization()
      map.location.addLocationConsumer(newConsumer: self)
    }
  }
  
  @objc func setStop(_ dictionary: [String:Any]?) {
    guard let dictionary = dictionary else {
      // Seems to be normal when followUserLocation is set
      //return Logger.log(level: .error, message: "stop called with nil")
      return
    }
    
    var camera = CameraOptions()
    
    if let feature : String = dictionary["centerCoordinate"] as? String {
      let centerFeature : Turf.Feature? = try!
        JSONDecoder().decode(Turf.Feature.self, from: feature.data(using: .utf8)!)
        
      switch centerFeature?.geometry {
      case .point(let centerPoint):
        camera.center = centerPoint.coordinates
      default:
        fatalError("Unexpected geometry: \(String(describing: centerFeature?.geometry))")
      }
      //camera.center = centerFeature
    }
    
    var duration : Double? = nil
    var zoom : Double? = nil
    var pitch : Double? = nil
    var bearing : Double? = nil
    
    if let durationParam = dictionary["duration"] as? Double {
      duration = durationParam
    }
    
    if let zoomParam = dictionary["zoom"] as? Double {
      zoom = zoomParam;
      camera.zoom = CGFloat(zoomParam)
    }
  
    if let pitchParam = dictionary["pitch"] as? Double {
      pitch = pitchParam
      camera.pitch = CGFloat(pitchParam)
    }
  
    if let bearingParam = dictionary["bearing"] as? Double {
      bearing = bearingParam
      camera.bearing = CLLocationDirection(bearingParam)
    }
    
    withMapView { map in
      if let duration = duration {
        map.camera.fly(to: camera, duration: self.toTimeInterval(duration))
      } else {
        map.camera.fly(to: camera)
      }
    }
  }
  
  @objc func setDefaultStop(_ dictionary: [String:Any]?) {
    print("setDefaultStop", dictionary!)
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
