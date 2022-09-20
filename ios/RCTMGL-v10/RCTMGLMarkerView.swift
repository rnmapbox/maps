import MapboxMaps
import CoreGraphics

class RCTMGLMarkerView : UIView, RCTMGLMapComponent {
  static let key = "RCTMGLMarkerView"
  
  var map: RCTMGLMapView?
  
  // MARK: - React views
    
  var reactSubviews : [UIView] = []

  @objc
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if subview is RCTMGLCallout {
      Logger.log(level: .warn, message: "[MarkerView] Callouts are not supported")
    }
      
    reactSubviews.insert(subview, at: atIndex)
    if reactSubviews.count > 1 {
      Logger.log(level: .error, message: "[MarkerView] Maximum of 1 subview allowed")
    }
  }

  @objc
  override func removeReactSubview(_ subview: UIView) {
      reactSubviews.removeAll(where: { $0 == subview })
  }
    
  var firstSubview: UIView? {
      reactSubviews.first
  }
    
  var firstSubviewBounds: CGRect {
      guard let subview = firstSubview else {
          return CGRect(x: 0, y: 0, width: 0, height: 0)
      }
      
      if subview.bounds.width > 0 && subview.bounds.height > 0 {
          return subview.frame
      } else {
          // It's possible for the subview to have an initial width and height of 0, as insertReactSubview
          // is typically called before reactSetFrame. The fallback to 1 x 1 prevents the component from
          // erroring and failing to handle the updated frame.
          return CGRect(x: subview.frame.minX, y: subview.frame.minY, width: 1, height: 1)
      }
  }
    
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return true
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    logged("[MarkerView] addToMap") {
      self.map = map
      let point = try point()

      try point.coordinates.validate()

      guard let view = firstSubview else {
        Logger.log(level: .error, message: "[MarkerView] No subview to render")
        return
      }
        
      view.isHidden = true
      try viewAnnotations()?.add(
        view,
        options: ViewAnnotationOptions.init(
            geometry: Geometry.point(point),
            width: firstSubviewBounds.width,
            height: firstSubviewBounds.height,
            associatedFeatureId: nil,
            allowOverlap: true,
            anchor: .center,
            offsetX: 0,
            offsetY: 0,
            selected: false
        )
      )
    }
  }
  
  func viewAnnotations() -> ViewAnnotationManager? {
    self.map?.viewAnnotations
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    guard let view = firstSubview else {
      Logger.log(level: .error, message: "[MarkerView] No subview to render")
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
  
  func point() throws -> Point {
    guard let coordinate = coordinate else {
      throw RCTMGLError.failed("[MarkerView] No coordinates were set")
    }
     
    guard let data = coordinate.data(using: .utf8) else {
      throw RCTMGLError.failed("[MarkerView] Cannot serialize coordiante")
    }
     
    guard let feature = try? JSONDecoder().decode(Feature.self, from: data) else {
      throw RCTMGLError.failed("[MarkerView] Cannot parse serialized coordinate")
    }
     
    guard let geometry : Geometry = feature.geometry else {
      throw RCTMGLError.failed("[MarkerView] Invalid geometry")
    }

    guard case .point(let point) = geometry else {
      throw RCTMGLError.failed("[MarkerView] Invalid point")
    }

    return point
  }
  
  func _updateCoordinate() {
    guard let view = firstSubview else {
      return
    }

    logged("[MarkerView] updateCoordinate") {
      let point = try point()

      try viewAnnotations()?.update(
        view,
        options: ViewAnnotationOptions(geometry: Geometry.point(point))
      )
    }
  }
  
  func _updateFrameOrAnchor() {
    guard let view = firstSubview else {
      return
    }
      
    var options = ViewAnnotationOptions(
        width: firstSubviewBounds.width,
        height: firstSubviewBounds.height
    )
    let defaultAnchor = CGPoint(x: 0.5, y: 0.5)
    
    if let anchor = anchor {
        if let anchorX = anchor["x"]?.CGFloat {
            options.offsetX = options.width! * (anchorX - defaultAnchor.x)
      }
        
        if let anchorY = anchor["y"]?.CGFloat {
            options.offsetY = options.height! * (anchorY - defaultAnchor.y)
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
      
    logged("[MarkerView] updateFrame") {
      try viewAnnotations()?.update(view, options: options)
    }
  }
}
