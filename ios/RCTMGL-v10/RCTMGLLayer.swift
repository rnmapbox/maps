import MapboxMaps

@objc(RCTMGLLayer)
class RCTMGLLayer : UIView, RCTMGLMapComponent {
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
  @objc var minZoom : NSNumber? = nil
  @objc var maxZoom : NSNumber? = nil
  
  @objc weak var map: RCTMGLMapView? = nil
  
  var styleLayer: Layer? = nil
    
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

  func inserLayer(_ map: RCTMGLMapView) {
    if let style = style, let styleLayer = styleLayer {
      try! style.addLayer(styleLayer)
      map.layerAdded(styleLayer)
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
      print("xxx found layer: \(self.styleLayer)")
    } else {
      self.styleLayer = try? self.makeLayer(style: style)
      print("StyleLayer after?? :\(self.styleLayer)")
      add = true
    }
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
    
    if let filter = filter {
      // v10todo layer.filter
    }
    
    if let minZoom = minZoom {
      layer.minZoom = minZoom.doubleValue
    }
    
    if let maxZoom = maxZoom {
      layer.maxZoom = maxZoom.doubleValue
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
