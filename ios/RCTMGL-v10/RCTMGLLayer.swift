@_spi(Experimental) import MapboxMaps

protocol RCTMGLSourceConsumer {
  func addToMap(_ map: RCTMGLMapView, style: Style)
  func removeFromMap(_ map: RCTMGLMapView, style: Style)
}

@objc(RCTMGLLayer)
class RCTMGLLayer : UIView, RCTMGLMapComponent, RCTMGLSourceConsumer {
  var bridge : RCTBridge? = nil

  @objc var sourceLayerID : String? = nil {
    didSet { self.optionsChanged() }
  }
  @objc var reactStyle : Dictionary<String, Any>? = nil {
    didSet {
      DispatchQueue.main.async {
        self.addStylesAndUpdate()
      }
    }
  }
  
  var style: Style? = nil

  @objc var filter : Array<Any>? = nil {
    didSet { optionsChanged() }
  }
  
  @objc var id: String! = nil
  @objc var sourceID: String? = nil {
    didSet { optionsChanged() }
  }
  
  @objc var minZoomLevel : NSNumber? = nil {
    didSet { optionsChanged() }
  }
  @objc var maxZoomLevel : NSNumber? = nil {
    didSet { optionsChanged() }
  }

  @objc var aboveLayerID : String? = nil {
    didSet {
      if let aboveLayerID = aboveLayerID {
        if aboveLayerID != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }

  @objc var belowLayerID : String? = nil {
    didSet {
      if let belowLayerID = belowLayerID {
        if belowLayerID != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }
  
  @objc var layerIndex : NSNumber? = nil {
    didSet {
      if let layerIndex = layerIndex {
        if layerIndex != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }
  
  @objc weak var map: RCTMGLMapView? = nil
  
  var styleLayer: Layer? = nil
  
  // MARK: - RCTMGLMapComponent
  func waitForStyleLoad() -> Bool {
    return true
  }
  
  func removeAndReaddLayer() {
    if let style = style {
      self.removeFromMap(style)
      self.insert(style, layerPosition: position())
    }
  }
   
  /**
    addStyles - adds the styles defined by reactStyle to the current layer, but does not apply to the style to the map style
   */
  func addStyles() {
    fatalError("Subclasses need to implement the `addStyles()` method.")
  }
  
  func addStylesAndUpdate() {
    guard styleLayer != nil else {
      return
    }

    addStyles()
    if let style = style,
      let map = map {
      if style.styleManager.styleLayerExists(forLayerId: id) {
        self.updateLayer(map)
      }
    }
  }
  
  func makeLayer(style: Style) throws -> Layer {
    fatalError("Subclasses need to implement the `makeLayer(style:)` method.")
  }
  
  func findLayer(style: Style, id: String) throws -> Layer {
    return try style.layer(withId: id)
  }
  
  func layerType() -> Layer.Type {
    fatalError("Subclasses need to implement the `layerType` method.")
  }

  func apply(style : Style) {
    fatalError("Subclasses need to implement the `apply` method.")
  }

  func position() -> LayerPosition {
    if let belowLayerID = belowLayerID {
      return .below(belowLayerID)
    } else if let aboveLayerID = aboveLayerID {
      return .above(aboveLayerID)
    } else if let layerIndex = layerIndex {
      return .at(layerIndex.intValue)
    } else {
      return .default
    }
  }
  
  func inserLayer(_ map: RCTMGLMapView) {
    if let style = style, let styleLayer = styleLayer {
      insert(style, layerPosition: position()) {
        map.layerAdded(styleLayer)
      }
    }
  }

  func updateLayer(_ map: RCTMGLMapView) {
    if let style = style, let _ = styleLayer {
      apply(style: style)
    }
  }
  
  func layerWithSourceID<T : Source>(in style: Style) throws -> T  {
    let result = try style.source(withId: self.sourceID!, type: T.self)
    return result
  }

  func sourceWithSourceID<T : Source>(in style: Style) throws -> T  {
    let result = try style.source(withId: self.sourceID!, type: T.self)
    return result
  }
  
  func addToMap(_ map: RCTMGLMapView) {
    self.style = map.mapboxMap.style
    self.map = map
  }
  
  func addedToMap() {
    
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    self.style = style
    guard let id = id else {
      Logger.log(level: .error, message: "Cannot add layer without id to the map: \(map)")
      return
    }

    var add = false
    do {
      if (style.styleManager.styleLayerExists(forLayerId: id)) {
        self.styleLayer = try self.findLayer(style: style, id: id)
      } else {
        self.styleLayer = try self.makeLayer(style: style)
        add = true
      }
    } catch {
      Logger.log(level: .error, message: "find/makeLayer failed for layer id=\(id)", error: error)
    }
    
    guard self.styleLayer != nil else {
      Logger.log(level: .error, message: "find/makeLayer retuned nil for layer id=\(id)")
      return
    }
    self.setOptions(&self.styleLayer!)
    self.addStyles()
    if add {
      self.inserLayer(map)
    } else {
      self.updateLayer(map)
    }
    self.addedToMap()
  }
  
  func removeFromMap(_ map: RCTMGLMapView, style: Style) {
    removeFromMap(style)
  }
  
  func setOptions(_ layer: inout Layer) {
    if let sourceLayerID = sourceLayerID {
      layer.sourceLayer = sourceLayerID
    }
    
    if let sourceID = sourceID {
      layer.source = sourceID
    }
    
    if let filter = filter, filter.count > 0 {
      do {
        let data = try JSONSerialization.data(withJSONObject: filter, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        layer.filter = decodedExpression
      } catch {
        Logger.log(level: .error, message: "parsing filters failed for layer \(optional: id): \(error.localizedDescription)")
      }
    } else {
      layer.filter = nil
    }
    
    if let minZoom = minZoomLevel {
      layer.minZoom = minZoom.doubleValue
    }
    
    if let maxZoom = maxZoomLevel {
      layer.maxZoom = maxZoom.doubleValue
    }
  }
  
  private func optionsChanged() {
    if let style = self.style {
      self.setOptions(&self.styleLayer!)
      self.apply(style: style)
    }
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    removeFromMap(map.mapboxMap.style)
  }
  
  private func removeFromMap(_ style: Style) {
    do {
      try style.removeLayer(withId: self.id)
    } catch {
      Logger.log(level: .error, message: "removing layer failed for layer \(optional: id): \(error.localizedDescription)")
    }
  }
  
  func insert(_ style: Style, layerPosition: LayerPosition, onInsert: (() -> Void)? = nil) {
    var idToWaitFor: String?
    switch layerPosition {
    case .above(let aboveId):
      idToWaitFor = aboveId
    case .below(let belowId):
      idToWaitFor = belowId
    case .at(_):
      idToWaitFor = nil
    default:
      idToWaitFor = nil
    }
    
    if let idToWaitFor = idToWaitFor {
      map!.waitForLayerWithID(idToWaitFor) { _ in
        self.attemptInsert(style, layerPosition: layerPosition, onInsert: onInsert)
      }
    } else {
      self.attemptInsert(style, layerPosition: layerPosition, onInsert: onInsert)
    }
  }
  
  private func attemptInsert(_ style: Style, layerPosition: LayerPosition, onInsert: (() -> Void)? = nil) {
    guard let styleLayer = self.styleLayer else {
      return
    }
    
    do {
      try style.addLayer(styleLayer, layerPosition: layerPosition)
      onInsert?()
    } catch {
      Logger.log(level: .error, message: "inserting layer failed at position \(layerPosition): \(error.localizedDescription)")
    }
  }
}
