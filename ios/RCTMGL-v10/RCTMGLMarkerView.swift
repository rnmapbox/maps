import MapboxMaps

class RCTMGLMarkerView : UIView, RCTMGLMapComponent {
  static let key = "RCTMGLMarkerView"
  
  var map: RCTMGLMapView? = nil
  
  func addToMap(_ map: RCTMGLMapView) {
    self.map = map
    let point = point()!
    try! viewAnnotations()?.add(self, options: ViewAnnotationOptions.init(geometry: Geometry.point(point), width: self.bounds.width, height: self.bounds.height, associatedFeatureId: nil, allowOverlap: true, visible: true, anchor: .center, offsetX: 0, offsetY: 0, selected: false))
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

    _updateFrameOrAnchor()
  }
  
  @objc var coordinate : String? {
    didSet {
      _updateCoordinate()
    }
  }
  
  @objc var anchor : [String:NSNumber]? {
    didSet {
      _updateFrameOrAnchor()
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
  
  func _updateFrameOrAnchor() {
    var options = ViewAnnotationOptions()
    let defaultX : CGFloat = 0.5
    let defaultY : CGFloat = 0.5
    options.width = bounds.width
    options.height = bounds.height
    
    if let anchor = anchor {
      if let anchorX = anchor["x"] {
        options.offsetX = bounds.width * (CGFloat(anchorX.floatValue) - defaultX)
      }
      if let anchorY = anchor["y"] {
        options.offsetY = bounds.height * (CGFloat(anchorY.floatValue) - defaultY)
      }
    }
    try? viewAnnotations()?.update(self, options: options)
  }
}
