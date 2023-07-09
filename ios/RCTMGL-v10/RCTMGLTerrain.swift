import MapboxMaps

@objc
class RCTMGLTerrain : RCTMGLSingletonLayer, RCTMGLMapComponent, RCTMGLSourceConsumer {
  var terrain : Terrain? = nil
  
  func makeTerrain() -> Terrain {
    guard let sourceID = sourceID else {
      Logger.log(level: .error, message: "Terrain should have a sourceID")
      return Terrain(sourceId: "n/a")
    }

    return Terrain(sourceId: sourceID)
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    self.style = style
    
    let terrain = self.makeTerrain()
    self.terrain = terrain
    addStylesAndUpdate()
  }
  
  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    self.map = nil
    
    guard let mapboxMap = map.mapboxMap else {
      return true
    }
    
    let style = mapboxMap.style
    removeFromMap(map, style: style)
    return true
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
  
  func removeFromMap(_ map: RCTMGLMapView, style: Style) {
    logged("RCTMGLTerrain.removeFromMap") {
      style.removeTerrain()
    }
  }

  @objc var sourceID: String? = nil {
    didSet {
      guard let sourceID = sourceID else {
        Logger.log(level: .error, message: "RCTMGLTerrain cannot set source to nil")
        return
      }
      
      terrain?.source = sourceID
      self.update()
    }
  }
  
  override func addStylesAndUpdate() {
    guard terrain != nil else {
      return
    }

    super.addStylesAndUpdate()
  }
  
  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = reactStyle {
      let styler = RCTMGLStyle(style: style)
      styler.bridge = self.bridge
      
      if var terrain = terrain {
        styler.terrainLayer(
          layer: &terrain,
          reactStyle: reactStyle,
          oldReactStyle: oldReactStyle,
          applyUpdater: { (updater) in fatalError("Terrain: TODO - implement apply updater")},
          isValid: { fatalError("Terrain: TODO - no isValid") }
        )
        self.terrain = terrain
      } else {
        fatalError("[xxx] terrain is nil \(optional: self.terrain)")
      }
    }
  }
  
  override func apply(style : Style) throws {
    if let terrain = terrain {
      try style.setTerrain(terrain)
    }
  }
}
