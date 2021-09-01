import MapboxMaps

@objc(RCTMGLSymbolLayer)
class RCTMGLSymbolLayer: RCTMGLVectorLayer {
  
  typealias LayerType = SymbolLayer

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    var layer = LayerType(id: self.id!)
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }

  override func apply(style : Style) {
    try! style.updateLayer(withId: id) { (layer : inout SymbolLayer) in
      if self.styleLayer != nil {
        setOptions(&self.styleLayer!)
      }
      if var styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }
  
  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RCTMGLStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LayerType,
         let reactStyle = self.reactStyle {
        styler.symbolLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          applyUpdater: { (updater) in try! style.updateLayer(withId: self.id) { (layer: inout LayerType) in updater(&layer) }},
          isValid: {
            return self.isAddedToMap()
          }
        )
        self.styleLayer = styleLayer
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
}
