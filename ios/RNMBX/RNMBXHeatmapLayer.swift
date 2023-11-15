import MapboxMaps

@objc(RNMBXHeatmapLayer)
public class RNMBXHeatmapLayer: RNMBXVectorLayer {
  typealias LayerType = HeatmapLayer

  override func makeLayer(style: Style) throws -> Layer {
    let _ : VectorSource = try self.layerWithSourceID(in: style)
    #if RNMBX_11
    var layer: Layer = LayerType(id: self.id!, source: self.sourceID!)
    #else
    var layer: Layer = LayerType(id: self.id!)
    #endif
    setOptions(&layer)
    
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }
  
  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout HeatmapLayer) in
      if let styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }

  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = reactStyle {
      let styler =  RNMBXStyle(style: style)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? HeatmapLayer {
        styler.heatmapLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXHeatmapLayer.updateLayer") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout HeatmapLayer) in updater(&layer) }
          }},
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
