import MapboxMaps

@objc(RNMBXFillLayer)
public class RNMBXFillLayer: RNMBXVectorLayer {
  typealias LayerType = FillLayer

  override func makeLayer(style: Style) throws -> Layer {
    let _ : VectorSource = try self.layerWithSourceID(in: style)
    #if RNMBX_11
    var layer: Layer = FillLayer(id: self.id!, source: sourceID!)
    #else
    var layer: Layer = FillLayer(id: self.id!)
    #endif
    
    setOptions(&layer)
    
    return layer
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }
  
  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout FillLayer) in
      if let styleLayer = self.styleLayer as? LayerType {
        layer = styleLayer
      }
    }
  }

  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = reactStyle {
      let styler = RNMBXStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? FillLayer {
        styler.fillLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXFillLayer.updateLayer") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout FillLayer) in updater(&layer) }
          }},
          isValid: { return self.isAddedToMap() }
        )
        self.styleLayer = styleLayer
      } else {
        fatalError("[xxx] layer is not fill layer?!!! \(optional: self.styleLayer)")
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
}
