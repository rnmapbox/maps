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

// @{codepart-replace-start(LayerPropsCommon.codepart-swift.ejs,{layerType:"Fill"})}
  func setCommonOptions(_ layer: inout FillLayer) -> Bool {
    var changed = false

    #if RNMBX_11
    if let sourceLayerID = sourceLayerID {
      layer.sourceLayer = sourceLayerID
      changed = true
    }

    if let sourceID = sourceID {
      if !(existingLayer && sourceID == DEFAULT_SOURCE_ID) && hasSource() {
        layer.source = sourceID
        changed = true
      }
    }

    if let filter = filter, filter.count > 0 {
      do {
        let data = try JSONSerialization.data(withJSONObject: filter, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        layer.filter = decodedExpression
        changed = true
      } catch {
        Logger.log(level: .error, message: "parsing filters failed for layer \(optional: id): \(error.localizedDescription)")
      }
    }
    #endif

    return changed
  }

  override func setOptions(_ layer: inout Layer) {
    super.setOptions(&layer)
    if var actualLayer = layer as? LayerType {
      if self.setCommonOptions(&actualLayer) {
        layer = actualLayer
      }
    } else {
      Logger.log(level: .error, message: "Expected layer type to be Fill but was \(type(of: layer))")
    }
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout FillLayer) in
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
