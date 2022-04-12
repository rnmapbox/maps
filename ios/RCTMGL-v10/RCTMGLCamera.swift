import Foundation
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
  // See MGLModule.swift:constantsToExport:CameraModes.
  enum Mode: String, CaseIterable {
    case flight, move, ease, linear
  }
  
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
      map.location.locationProvider.requestWhenInUseAuthorization()
      map.location.addLocationConsumer(newConsumer: self)
    }
  }
  
  @objc func setStop(_ dictionary: [String:Any]?) {
    guard let dictionary = dictionary else {
      // Seems to be normal when followUserLocation is set
      // return Logger.log(level: .error, message: "stop called with nil")
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
    }
    
    if let feature : String = dictionary["bounds"] as? String {
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
        let c = map.mapboxMap.camera(for: bounds, padding: .zero, bearing: 0, pitch: 0)
        camera.center = c.center
        camera.zoom = c.zoom
      }
    }
        
    if let zoom = dictionary["zoom"] as? Double {
      camera.zoom = CGFloat(zoom)
    }
  
    if let pitch = dictionary["pitch"] as? Double {
      camera.pitch = CGFloat(pitch)
    }
  
    if let heading = dictionary["heading"] as? Double {
      camera.bearing = CLLocationDirection(heading)
    }

    if let bearing = dictionary["bearing"] as? Double {
      camera.bearing = CLLocationDirection(bearing)
    }
    
    let duration: TimeInterval? = {
      if let d = dictionary["duration"] as? Double {
        return self.toTimeInterval(d)
      }
      return nil
    }()
    
    let mode: Mode = {
      if let m = dictionary["mode"] as? String, let m = Mode(rawValue: m) {
        return m
      }
      return .flight
    }()

    withMapView { map in
      switch mode {
        case .flight:
          if let duration = duration {
            map.camera.fly(to: camera, duration: duration)
          } else {
            map.camera.fly(to: camera)
          }
        case .move:
          map.camera.ease(to: camera, duration: duration ?? 0, curve: .easeInOut, completion: nil)
        case .ease:
          map.camera.ease(to: camera, duration: duration ?? 0, curve: .easeInOut, completion: nil)
        case .linear:
          map.camera.ease(to: camera, duration: duration ?? 0, curve: .linear, completion: nil)
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
