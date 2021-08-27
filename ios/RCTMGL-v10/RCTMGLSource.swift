import MapboxMaps

@objc
class RCTMGLSource : UIView, RCTMGLMapComponent {
  
  var source : Source? = nil
  var map : RCTMGLMapView? = nil
  
  @objc var id: String? = nil
  
  var layers: [RCTMGLLayer] = []
  
  func makeSource() -> Source {
    fatalError("Subclasses should override makeSource")
  }
  
  @objc override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let layer : RCTMGLLayer = subview as? RCTMGLLayer {
      if let map = map {
        layer.addToMap(map, style: map.mapboxMap.style)
      }
      layers.append(layer)
    }
  }
  
  func addToMap(_ map: RCTMGLMapView) {
    self.map = map
    
    let source = self.makeSource()
    
    map.mapboxMap.onNext(.styleLoaded) {_ in
      print("??? addSource \(source) id=\(self.id)")
      try! map.mapboxMap.style.addSource(source, id: self.id!)
      
      for layer in self.layers {
        layer.addToMap(map, style: map.mapboxMap.style)
      }
    }
  }
}
