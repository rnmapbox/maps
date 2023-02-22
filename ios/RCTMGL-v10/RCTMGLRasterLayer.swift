import MapboxMaps

@objc(RCTMGLRasterLayer)
class RCTMGLRasterLayer: RCTMGLLayer {
  typealias LayerType = RasterLayer

  override func makeLayer(style: Style) throws -> Layer {
    // let source : ImageSource = try self.sourceWithSourceID(in: style)
    var layer = LayerType(id: self.id!)
    layer.source = sourceID
    return layer
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: RasterLayer.self) { (layer : inout RasterLayer) in
      if let styleLayer = self.styleLayer as? RasterLayer {
        layer = styleLayer
      }
    }
  }
 
  override func addStyles() {
    if let style : Style = self.style,
       let reactStyle = reactStyle {
      let styler =  RCTMGLStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LayerType {
        styler.rasterLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater:{ (updater) in logged("RCTMGLRasterLayer.updateLayer") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }
          }},
          isValid: { return self.isAddedToMap() }
        )
        self.styleLayer = styleLayer
      } else {
        fatalError("[xxx] layer is not raster layer?!!! \(optional: self.styleLayer)")
      }
    }
  }
   
  func isAddedToMap() -> Bool {
    return true
  }

  override func layerType() -> Layer.Type {
    return LayerType.self
  }
}
