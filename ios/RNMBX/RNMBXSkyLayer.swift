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

// @{codepart-replace-start(LayerPropsCommon.codepart-swift.ejs,{layerType:"Sky"})}
  func setCommonOptions(_ layer: inout SkyLayer) -> Bool {
    var changed = false

    return changed
  }

  override func setOptions(_ layer: inout Layer) {
    super.setOptions(&layer)
    if var actualLayer = layer as? LayerType {
      if self.setCommonOptions(&actualLayer) {
        layer = actualLayer
      }
    } else {
      Logger.log(level: .error, message: "Expected layer type to be Sky but was \(type(of: layer))")
    }
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout SkyLayer) in
      if self.styleLayer != nil {
        self.setOptions(&self.styleLayer!)
      }
      if let styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }
// @{codepart-replace-end}
  
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
