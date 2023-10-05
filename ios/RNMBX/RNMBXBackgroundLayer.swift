import MapboxMaps

@objc(RNMBXBackgroundLayer)
public class RNMBXBackgroundLayer: RNMBXLayer {
  typealias LayerType = BackgroundLayer

  override func makeLayer(style: Style) throws -> Layer {
    var layer = LayerType(id: self.id!)
    #if !RNMBX_11
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    #endif
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }
  
  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout BackgroundLayer) in
      if let styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }

  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RNMBXStyle(style: self.style!)
      styler.bridge = self.bridge
      if var styleLayer = self.styleLayer as? LayerType,
         let reactStyle = self.reactStyle {
        styler.backgroundLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXBackgroundLayer.addStyles") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }
          }},
          isValid: { return self.isAddedToMap() })
        self.styleLayer = styleLayer
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }

}
