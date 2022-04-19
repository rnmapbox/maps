import MapboxMaps

@objc(RCTMGLHeatmapLayer)
class RCTMGLHeatmapLayer: RCTMGLVectorLayer {
  typealias LayerType = HeatmapLayer

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    var layer: Layer = LayerType(id: self.id!)
    
    setOptions(&layer)
    
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }
  
  override func apply(style : Style) {
    try! style.updateLayer(withId: id, type: LayerType.self) { (layer : inout HeatmapLayer) in
      if let styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }

  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RCTMGLStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? HeatmapLayer {
        styler.heatmapLayer(
          layer: &styleLayer,
          reactStyle: reactStyle!,
          applyUpdater: { (updater) in try! style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout HeatmapLayer) in updater(&layer) }},
          isValid: { return self.isAddedToMap() }
        )
        self.styleLayer = styleLayer
      } else {
        fatalError("[xxx] layer is not heatmap layer?!!! \(self.styleLayer)")
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
}
