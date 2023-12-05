@_spi(Experimental) import MapboxMaps

@objc(RNMBXModelLayer)
public class RNMBXModelLayer: RNMBXVectorLayer {
  typealias LayerType = ModelLayer

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    #if RNMBX_11
    var layer = LayerType(id: self.id!, source: sourceID!)
    #else
    var layer = LayerType(id: self.id!)
    #endif
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout ModelLayer) in
      if self.styleLayer != nil {
        self.setOptions(&self.styleLayer!)
      }
      if let styleLayer = self.styleLayer as? ModelLayer {
        layer = styleLayer
      }
    }
  }
  
  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RNMBXStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LayerType,
         let reactStyle = reactStyle {
        styler.modelLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXModelLayer.updateLayer") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }
          }},
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
