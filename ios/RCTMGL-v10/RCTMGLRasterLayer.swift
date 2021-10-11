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

 
  override func addStyles() {
    if let style : Style = self.style {
      let styler =  RCTMGLStyle(style: self.style!)
      styler.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LayerType {
        styler.rasterLayer(
          layer: &styleLayer,
          reactStyle: reactStyle!,
          applyUpdater:{ (updater) in try! style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }},
          isValid: { return self.isAddedToMap() }
        )
      } else {
       fatalError("[xxx] layer is not raster layer?!!! \(self.styleLayer)")
     }
    }
  }
   
  func isAddedToMap() -> Bool {
    return true
  }
}
