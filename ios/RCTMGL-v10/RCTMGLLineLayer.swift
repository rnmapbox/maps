import MapboxMaps

@objc(RCTMGLLineLayer)
class RCTMGLLineLayer: RCTMGLVectorLayer {

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    var layer = LineLayer(id: self.id!)
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    return layer
  }

  override func layerType() -> Layer.Type {
    return LineLayer.self
  }

  override func apply(style : Style) {
    try! style.updateLayer(withId: id) { (layer : inout LineLayer) in
      if let styleLayer = self.styleLayer as? LineLayer {
        layer = styleLayer
      }
    }
  }
  
  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RCTMGLStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LineLayer {
        styler.lineLayer(
          layer: &styleLayer,
          reactStyle: reactStyle!,
          applyUpdater: { (updater) in try! style.updateLayer(withId: self.id) { (layer: inout LineLayer) in updater(&layer) }},
          isValid: {
            return self.isAddedToMap()
          })
        self.styleLayer = styleLayer
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
}
