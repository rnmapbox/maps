import MapboxMaps

@objc(RNMBXLineLayer)
public class RNMBXLineLayer: RNMBXVectorLayer {
  typealias LayerType = LineLayer

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

// @{codepart-replace-start(LayerPropsCommon.codepart-swift.ejs,{layerType:"Line"})}
  func setCommonOptions(_ layer: inout LineLayer) -> Bool {
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
      Logger.log(level: .error, message: "Expected layer type to be Line but was \(type(of: layer))")
    }
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout LineLayer) in
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
         let reactStyle = reactStyle {
        styler.lineLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReatStyle,
          applyUpdater: { (updater) in logged("RNMBXLineLayer.updateLayer") {
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
