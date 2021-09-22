import MapboxMaps

protocol RCTMGLSourceConsumer {
  func addToMap(_ map: RCTMGLMapView, style: Style)
}

@objc(RCTMGLLayer)
class RCTMGLLayer : UIView, RCTMGLMapComponent, RCTMGLSourceConsumer {
  var bridge : RCTBridge? = nil

  @objc var sourceLayerID : String? = nil
  @objc var reactStyle : Dictionary<String, Any>? = nil {
    didSet {
      DispatchQueue.main.async {
        self.addStyles()
      }
    }
  }
  
  var style: Style? = nil

  @objc var filter : Array<Any>? = nil
  @objc var id: String! = nil
  @objc var sourceID: String? = nil
  
  @objc var minZoomLevel : NSNumber? = nil
  @objc var maxZoomLevel : NSNumber? = nil

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
  
  func removeAndReaddLayer() {
    if let style = style {
      self.removeFromMap(style)
      self.insert(style, layerPosition: position())
    }
  }
    
  func addStyles() {
    fatalError("Subclasses need to implement the `addStyles()` method.")
  }
  
  func makeLayer(style: Style) throws -> Layer {
    fatalError("Subclasses need to implement the `makeLayer(style:)` method.")
  }
  
  func findLayer(style: Style, id: String) throws -> Layer {
    return try style._layer(withId: id, type: layerType())
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
    print("=> sourceID: \(self.sourceID ?? "n/a")")
    let result = try style._source(withId: self.sourceID!, type: T.self)
    return result as! T
  }

  func sourceWithSourceID<T : Source>(in style: Style) throws -> T  {
    print("=> sourceID: \(self.sourceID ?? "n/a")")
    let result = try style._source(withId: self.sourceID!, type: T.self)
    return result as! T
  }
  
  func addToMap(_ map: RCTMGLMapView) {
    //
    print("::addToMap[]")
    self.map = map
  }
  
  func addedToMap() {
    
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    self.style = style
    guard let id = id else {
      RCTLogError("Cannot add layer without id to the map: \(map)")
      return
    }

    var add = false
    if (style.styleManager.styleLayerExists(forLayerId: id)) {
      self.styleLayer = try? self.findLayer(style: style, id: id)
    } else {
      self.styleLayer = try? self.makeLayer(style: style)
      add = true
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
  
  func setOptions(_ layer: inout Layer) {
    if let sourceLayerID = sourceLayerID {
      layer.sourceLayer = sourceLayerID
    }
    
    if let sourceID = sourceID {
      layer.source = sourceID
    }
    
    if let filter = filter, filter.count > 0 {
      let data = try! JSONSerialization.data(withJSONObject: filter, options: .prettyPrinted)
      let decodedExpression = try! JSONDecoder().decode(Expression.self, from: data)
      layer.filter = decodedExpression
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
  
  func removeFromMap(_ style: Style) {
    if (self.styleLayer != nil) {
      try! style.removeLayer(withId: self.id)
    }
    self.styleLayer = nil
  }
  
  
  func insert(_ style: Style, layerPosition: LayerPosition, inserted: (() -> Void)? = nil) {
    var idToWaitFor : String? = nil
    switch layerPosition {
    case .above(let aboveId):
      idToWaitFor = aboveId
    case .below(let belowId):
      idToWaitFor = belowId
    case .at(_):
      idToWaitFor = nil
    case .default:
      idToWaitFor = nil
    }
    
    if let idToWaitFor = idToWaitFor {
      map!.waitForLayerWithID(idToWaitFor) { _ in
        try! style.addLayer(self.styleLayer!, layerPosition: layerPosition)
        if let inserted = inserted {
          inserted()
        }
      }
    } else {
      try! style.addLayer(styleLayer!, layerPosition: layerPosition)
      if let inserted = inserted {
        inserted()
      }
    }
  }

  /*
  layerWithSourceIDInStyle:(nonnull MGLStyle*) style
  {
      MGLSource* result = [style sourceWithIdentifier: self.sourceID];
      if (result == NULL) {
          RCTLogError(@"Cannot find layer with id: %@ referenced by layer:%@", self.sourceID, _id);
      }
      return result;
  }*/
}
