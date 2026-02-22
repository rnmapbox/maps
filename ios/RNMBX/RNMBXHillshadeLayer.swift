import MapboxMaps

@objc(RNMBXHillshadeLayer)
public class RNMBXHillshadeLayer: RNMBXLayer {
  typealias LayerType = HillshadeLayer

  override func makeLayer(style: Style) throws -> Layer {
    var layer = LayerType(id: self.id!, source: sourceID!)
    layer.source = sourceID
    return layer
  }

// @{codepart-replace-start(LayerPropsCommon.codepart-swift.ejs,{layerType:"Hillshade"})}
  func setCommonOptions(_ layer: inout HillshadeLayer) -> Bool {
    var changed = false

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

    return changed
  }

  override func setOptions(_ layer: inout Layer) {
    super.setOptions(&layer)
    if var actualLayer = layer as? LayerType {
      if self.setCommonOptions(&actualLayer) {
        layer = actualLayer
      }
    } else {
      Logger.log(level: .error, message: "Expected layer type to be Hillshade but was \(type(of: layer))")
    }
  }

  override func apply(style : Style) throws {
    try style.updateLayer(withId: id, type: LayerType.self) { (layer : inout HillshadeLayer) in
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
      let styler =  RNMBXStyle(style: self.style!)
      styler.bridge = self.bridge

      if var styleLayer = self.styleLayer as? LayerType {
        styler.hillshadeLayer(
          layer: &styleLayer,
          reactStyle: reactStyle,
          oldReactStyle: oldReactStyle,
          applyUpdater:{ (updater) in logged("RNMBXHillshadeLayer.updateLayer") {
            try style.updateLayer(withId: self.id, type: LayerType.self) { (layer: inout LayerType) in updater(&layer) }
          }},
          isValid: { return self.isAddedToMap() }
        )
        self.styleLayer = styleLayer
      } else {
        fatalError("[xxx] layer is not hillshade layer?!!! \(optional: self.styleLayer)")
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
