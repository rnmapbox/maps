import MapboxMaps

class RCTMGLMarkerView : UIView, RCTMGLMapComponent {
  static let key = "RCTMGLMarkerView"
  
  var map: RCTMGLMapView? = nil
  
  
  // MARK: - react view
  var reactSubviews : [UIView] = []

  @objc
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if subview is RCTMGLCallout {
      Logger.log(level: .warn, message: "MarkerView doesn't supports callouts")
    }
    reactSubviews.insert(subview, at: atIndex)
    if reactSubviews.count > 1 {
      Logger.log(level: .error, message: "MarkerView supports max 1 subview")
    }
  }

  @objc
  override func removeReactSubview(_ subview: UIView!) {
    reactSubviews.removeAll(where: { $0 == subview })
  }
  
  func view() -> UIView? {
    return reactSubviews.first
  }
  
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return true
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    logged("RCTMGLMarkerView.addToMap") {
      self.map = map
      let point = point()!

      try point.coordinates.validate()

      guard let view = view() else {
        Logger.log(level: .error, message: "MarkerView: No subview to render")
        return
      }
      let bounds = view.bounds
      try viewAnnotations()?.add(view, options: ViewAnnotationOptions.init(geometry: Geometry.point(point), width: bounds.width, height: bounds.height, associatedFeatureId: nil, allowOverlap: true, visible: true, anchor: .center, offsetX: 0, offsetY: 0, selected: false))
    }
  }
  
  func viewAnnotations() -> ViewAnnotationManager? {
    self.map?.viewAnnotations
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    guard let view = view() else {
      Logger.log(level: .error, message: "MarkerView: No subview to render")
      return
    }
    viewAnnotations()?.remove(view)
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
    guard let view = view() else {
      return
    }
    var options = ViewAnnotationOptions()
    let defaultX : CGFloat = 0.5
    let defaultY : CGFloat = 0.5
    var bounds = view.bounds
    options.width = bounds.width
    options.height = bounds.height
    
    if let anchor = anchor {
      if let anchorX = anchor["x"] {
        options.offsetX = bounds.width * (CGFloat(anchorX.floatValue) - defaultX)
      }
      if let anchorY = anchor["y"] {
        options.offsetY = bounds.height * (CGFloat(anchorY.floatValue) - defaultY)
      }
      if let view = view as? RCTMGLMarkerViewWrapper {
        if let anchorX = anchor["x"] {
          view.anchorX = CGFloat(anchorX.floatValue)
        }
        if let anchorY = anchor["y"] {
          view.anchorY = CGFloat(anchorY.floatValue)
        }
      }
    }
    logged("MarkerView.updateFrame") {
      try viewAnnotations()?.update(view, options: options)
    }
  }
}
