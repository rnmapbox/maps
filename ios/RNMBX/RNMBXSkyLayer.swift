import MapboxMaps

@objc(RNMBXSkyLayer)
public class RNMBXSkyLayer: RNMBXLayer {
  typealias LayerType = SkyLayer

  override func makeLayer(style: Style) throws -> Layer {
    let layer = LayerType(id: self.id!)
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout LayerType) in
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
        
        styler.skyLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXSkyLayer.addStyles") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }
          }},
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

  internal override func hasSource() -> Bool {
    return false
  }
}
