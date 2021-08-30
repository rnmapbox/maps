import MapboxMaps

@objc(RCTMGLLineLayer)
class RCTMGLLineLayer: RCTMGLVectorLayer {

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    var layer = LineLayer(id: self.id!)
    layer.sourceLayer = self.sourceLayerID
    layer.source = sourceID
    return layer
  }

  override func layerType() -> Layer.Type {
    return LineLayer.self
  }

  override func apply(style : Style) {
    try! style.updateLayer(withId: id) { (layer : inout LineLayer) in
      if let styleLayer = self.styleLayer as? LineLayer {
        layer = styleLayer
      }
    }
  }
  
  override func addStyles() {
    if let style : Style = self.style {
      let style =  RCTMGLStyle(style: self.style!)
      style.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? LineLayer {
        style.lineLayer(layer: &styleLayer, reactStyle: reactStyle!, isValid: {
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
