import MapboxMaps

/// RCTMGLSingletonLayer is absract superclass for Light, Atmosphere, Terrain
@objc
class RCTMGLSingletonLayer : UIView {
  weak var bridge : RCTBridge? = nil
  weak var map : RCTMGLMapView? = nil
  var style: Style? = nil
  
  @objc var reactStyle : Dictionary<String, Any>? = nil {
    didSet {
      DispatchQueue.main.async {
        self.addStylesAndUpdate()
      }
    }
  }

  /// apply style updates to our copy and copy the changes to the map style
  func addStylesAndUpdate() {
    addStyles()
    update()
  }
  
  /// apply the changes made to our copy to the map style
  func update() {
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
