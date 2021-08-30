import MapboxMaps

@objc(RCTMGLFillLayer)
class RCTMGLFillLayer: RCTMGLVectorLayer {

  override func makeLayer(style: Style) throws -> Layer {
    let vectorSource : VectorSource = try self.layerWithSourceID(in: style)
    print("xxx ??? Found source:\(vectorSource)")
    var layer: Layer = FillLayer(id: self.id!)
    
    setOptions(&layer)
    
    return layer
  }

  override func layerType() -> Layer.Type {
    return FillLayer.self
  }
  
  override func apply(style : Style) {
    try! style.updateLayer(withId: id) { (layer : inout FillLayer) in
      if let styleLayer = self.styleLayer as? FillLayer {
        layer = styleLayer
      }
    }
  }

  override func addStyles() {
    print("::addStyles ")
    if let style : Style = self.style {
      let style =  RCTMGLStyle(style: self.style!)
      style.bridge = self.bridge
      
      if var styleLayer = self.styleLayer as? FillLayer {
        style.fillLayer(layer: &styleLayer, reactStyle: reactStyle!, isValid: {
          return self.isAddedToMap()
        })
        self.styleLayer = styleLayer
      } else {
        fatalError("[xxx] layer is not fill layer?!!! \(self.styleLayer)")
      }
    }
  }
  
  func isAddedToMap() -> Bool {
    return true
  }
}
