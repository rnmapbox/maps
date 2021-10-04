import MapboxMaps

@objc
class RCTMGLNativeUserLocation : UIView {
  weak var map : RCTMGLMapView! = nil
  
  let locationLayerId = "location-layer"

  var locationLayer : LocationIndicatorLayer? = nil

  @objc
  var iosShowsUserHeadingIndicator : Bool = false {
    didSet {
      
    }
  }

  func addToMap(map: RCTMGLMapView) {
    self.map = map
    
    let layer = LocationIndicatorLayer(id: locationLayerId)
    self.locationLayer = layer
    try! map.mapboxMap.style.addLayer(layer, layerPosition: .default)
  }

  func removeFromMap(map: RCTMGLMapView) {
    guard let mapboxMap = map.mapboxMap else {
      return
    }
    let style = mapboxMap.style
    if let layer = locationLayer {
      try! style.removeLayer(withId: layer.id)
      self.locationLayer = nil
    }
  }
}
