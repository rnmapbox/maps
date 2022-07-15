import MapboxMaps

/// RCTMGLSingletonLayer is absract superclass for Light, Atmosphere, Terrain
@objc
class RCTMGLSingletonLayer : UIView {
  var bridge : RCTBridge? = nil
  var map : RCTMGLMapView? = nil
  var style: Style? = nil
  
  @objc var reactStyle : Dictionary<String, Any>? = nil {
    didSet {
      DispatchQueue.main.async {
        self.addStylesAndUpdate()
      }
    }
  }

  func addStylesAndUpdate() {
    addStyles()
    if let style = style,
      let map = map {
      self.update(map, style)
    }
  }
  
  func update(_ map: RCTMGLMapView, _ style: Style) {
    logged("LayerLike \(self)") {
      try apply(style: style)
    }
  }
  
  /// add reactStyle to the layer like component
  func addStyles() {
    fatalError("Subclasses should overrride")
  }
  
  /// apply changes in layer like component to the map
  func apply(style: Style) throws {
    fatalError("Subclasses should overrride")
  }
}