import MapboxMaps
import Turf

protocol RCTMGLMapComponent {
    func addToMap(_ map: RCTMGLMapView)
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
}

class RCTMGLCamera : RCTMGLMapComponentBase {
    func toTimeInterval(_ duration: Double) -> TimeInterval {
        return duration*0.001
    }
    
    @objc func setStop(_ dictionary: [String:Any]?) {
        guard let dictionary = dictionary else {
          return Logger.log(level: .error, message: "stop called with nil")
        }
        print("setStop", dictionary)
        
        var camera = CameraOptions()
        let feature : String = dictionary["centerCoordinate"] as! String
        
        let centerFeature : Turf.Feature? = try!
          GeoJSON.parse(Turf.Feature.self, from: feature.data(using: .utf8)!)
        
        switch centerFeature?.geometry {
        case .point(let centerPoint):
            camera.center = centerPoint.coordinates
        default:
            fatalError("Unexpected geometry: \(String(describing: centerFeature?.geometry))")
        }
        //camera.center = centerFeature
        
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
}
