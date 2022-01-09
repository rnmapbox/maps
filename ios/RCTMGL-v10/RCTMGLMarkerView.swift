import MapboxMaps

class RCTMGLMarkerView : UIView, RCTMGLMapComponent {
  static let key = "RCTMGLMarkerView"
  
  var map: RCTMGLMapView? = nil
  
  func addToMap(_ map: RCTMGLMapView) {
    self.map = map
    let point = point()!
    print("Frame: \(self.bounds)")
    try! viewAnnotations()?.add(self, options: ViewAnnotationOptions.init(geometry: Geometry.point(point), width: self.bounds.width, height: self.bounds.height, associatedFeatureId: nil, allowOverlap: true, visible: true, anchor: .top, offsetX: 0, offsetY: 0, selected: false))
    //self.map?.pointAnnotationManager.add(annotation)
  }
  
  func viewAnnotations() -> ViewAnnotationManager? {
    self.map?.viewAnnotations
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    viewAnnotations()?.remove(self)
    self.map = map
  }
  
  override func reactSetFrame(_ frame: CGRect) {
    super.reactSetFrame(frame)
    var options = ViewAnnotationOptions()
    options.width = frame.size.width
    options.height = frame.size.height
    try? viewAnnotations()?.update(self, options: options)
    print("Frame: \(self.bounds)")
  }
  
  @objc var coordinate : String? {
    didSet {
      _updateCoordinate()
    }
  }
  
  func point() -> Point? {
    guard let coordinate = coordinate else {
      return nil
    }
     
    guard let data = coordinate.data(using: .utf8) else {
      return nil
    }
     
    guard let feature = try? JSONDecoder().decode(Feature.self, from: data) else {
      return nil
    }
     
    guard let geometry : Geometry = feature.geometry else {
      return nil
    }

    guard case .point(let point) = geometry else {
      return nil
    }

    return point
  }
  
  func _updateCoordinate() {
    var options = ViewAnnotationOptions()
    
    options.geometry = Geometry.point(point()!)
    try? viewAnnotations()?.update(self, options: options)
  }
}
