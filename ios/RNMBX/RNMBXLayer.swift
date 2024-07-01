@_spi(Experimental) import MapboxMaps

protocol RNMBXSourceConsumer : class {
  func addToMap(_ map: RNMBXMapView, style: Style)
  func removeFromMap(_ map: RNMBXMapView, style: Style)
}

func styleLayerExists(_ style: Style, id: String) -> Bool {
  #if RNMBX_11
  return style.layerExists(withId: id)
  #else
  return style.styleManager.styleLayerExists(forLayerId: id)
  #endif
}

@objc(RNMBXLayer)
public class RNMBXLayer : UIView, RNMBXMapComponent, RNMBXSourceConsumer {
  @objc public weak var bridge : RCTBridge? = nil

  var waitingForID: String? = nil

  @objc public var sourceLayerID : String? = nil {
    didSet { self.optionsChanged() }
  }

  var oldReatStyle: Dictionary<String, Any>? = nil
  @objc public var reactStyle : Dictionary<String, Any>? = nil {
    willSet {
      oldReatStyle = reactStyle
    }
    didSet {
      DispatchQueue.main.async {
        self.addStylesAndUpdate()
      }
    }
  }

  var style: Style? = nil

  @objc public var filter : Array<Any>? = nil {
    didSet { optionsChanged() }
  }

  @objc public var id: String! = nil {
    willSet {
      if id != nil && newValue != id {
        Logger.log(level:.warn, message: "Changing id from: \(optional: id) to \(optional: newValue), changing of id is supported")
        if let style = style { self.removeFromMap(style) }
      }
    }
    didSet {
      if oldValue != nil && oldValue != id {
        if let map = map, let style = style { self.addToMap(map, style: style) }
      }
    }
  }

  @objc public var sourceID: String? = nil {
    didSet { optionsChanged() }
  }

  @objc public var minZoomLevel : NSNumber? = nil {
    didSet { optionsChanged() }
  }
  @objc public var maxZoomLevel : NSNumber? = nil {
    didSet { optionsChanged() }
  }

  @objc public var aboveLayerID : String? = nil {
    didSet {
      if let aboveLayerID = aboveLayerID {
        if aboveLayerID != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }

  @objc public var belowLayerID : String? = nil {
    didSet {
      if let belowLayerID = belowLayerID {
        if belowLayerID != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }

  @objc public var layerIndex : NSNumber? = nil {
    didSet {
      if let layerIndex = layerIndex {
        if layerIndex != oldValue {
          self.removeAndReaddLayer()
        }
      }
    }
  }

  @objc public var slot: String? = nil {
    didSet {
      optionsChanged()
    }
  }

  @objc weak var map: RNMBXMapView? = nil

  deinit {
    if let waitingForID = waitingForID {
      Logger.log(level:.warn, message: "RNMBXLayer.removeFromMap - unmetPositionDependency: layer: \(optional: id) was waiting for layer: \(optional: waitingForID) but it hasn't added to map")
      self.waitingForID = nil
    }
  }

  var styleLayer: Layer? = nil

  /// wearther we inserted the layer or we're referring to an existing layer
  var existingLayer = false

  // MARK: - RNMBXMapComponent
  public func waitForStyleLoad() -> Bool {
    return true
  }

  func removeAndReaddLayer() {
    if let map = map, let style = style {
      self.removeFromMap(style)
      self.addToMap(map, style:style)
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
      if styleLayerExists(style, id: id) {
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
    fatalError("Subclasses need to implement the `layerType` method. \(self)")
  }

  func apply(style : Style) throws {
    fatalError("Subclasses need to implement the `apply` method.")
  }

  final func loggedApply(style: Style) {
    logged("updateLayer", info: { "\(self.layerType()).\(optional: self.id)" }) {
      try apply(style: style)
    }
  }

  func position() -> LayerPosition {
    if let belowLayerID = belowLayerID {
      if aboveLayerID != nil {
        Logger.log(level: .warn, message: "Both below layer and above layer is specified => above layer id is ingored")
      }
      if layerIndex != nil {
        Logger.log(level: .warn, message: "Both below layer and layer index is specified => layer index is ignored")
      }
      return .below(belowLayerID)
    } else if let aboveLayerID = aboveLayerID {
      return .above(aboveLayerID)
    } else if let layerIndex = layerIndex {
      return .at(layerIndex.intValue)
    } else {
      return .default
    }
  }

  func inserLayer(_ map: RNMBXMapView) {
    if self.style == nil {
      print("inserLayer but style is nil")
    }
    if let style = style, let styleLayer = styleLayer {
      insert(style, layerPosition: position()) {
        map.layerAdded(styleLayer)
      }
    }
  }

  func updateLayer(_ map: RNMBXMapView) {
    if let style = style, let _ = styleLayer {
      loggedApply(style: style)
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

  func addedToMap() {

  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    self.style = style
    guard let id = id else {
      Logger.log(level: .error, message: "Cannot add layer without id to the map: \(map)")
      return
    }

    do {
      if (styleLayerExists(style,id: id)) {
        styleLayer = try findLayer(style: style, id: id)
        existingLayer = true
      } else {
        styleLayer = try makeLayer(style: style)
        existingLayer = false
      }
    } catch {
      Logger.log(level: .error, message: "find/makeLayer failed for layer id=\(id)", error: error)
    }

    guard self.styleLayer != nil else {
      Logger.log(level: .error, message: "find/makeLayer retuned nil for layer id=\(id)")
      return
    }
    setOptions(&self.styleLayer!)
    addStyles()
    if !existingLayer {
      inserLayer(map)
    } else {
      updateLayer(map)
    }
    addedToMap()
  }

  func removeFromMap(_ map: RNMBXMapView, style: Style) {
    removeFromMap(style)
  }

  #if RNMBX_11
  func _toSlot(_ slot: String) -> Slot? {
    switch slot {
    case "top":
      return Slot.top;
    case "bottom":
      return Slot.bottom;
    case "middle":
      return Slot.middle;
    default:
      return Slot(rawValue: slot);
    }
  }
  #endif

  func setBaseOptions<T: Layer>(_ layer: inout T) {
    if let minZoom = minZoomLevel {
      layer.minZoom = minZoom.doubleValue
    }

    if let maxZoom = maxZoomLevel {
      layer.maxZoom = maxZoom.doubleValue
    }

    #if RNMBX_11
    if let slot = slot {
      layer.slot = _toSlot(slot)
    }
    #endif
  }

  func setOptions(_ layer: inout Layer) {
    setBaseOptions(&layer)
    #if !RNMBX_11
    if let sourceLayerID = sourceLayerID {
      layer.sourceLayer = sourceLayerID
    }

    if let sourceID = sourceID {
      if !(existingLayer && sourceID == DEFAULT_SOURCE_ID) && hasSource() {
        layer.source = sourceID
      }
    }

    if let filter = filter, filter.count > 0 {
      do {
        let data = try JSONSerialization.data(withJSONObject: filter, options: .prettyPrinted)
        let decodedExpression = try JSONDecoder().decode(Expression.self, from: data)
        layer.filter = decodedExpression
      } catch {
        Logger.log(level: .error, message: "parsing filters failed for layer \(optional: id): \(error.localizedDescription)")
      }
    }
    #endif
  }

  private func optionsChanged() {
    if let style = self.style, self.styleLayer != nil {
      self.setOptions(&self.styleLayer!)
      self.loggedApply(style: style)
    }
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    removeFromMap(map.mapboxMap.style)
    return true
  }

  private func removeFromMap(_ style: Style) {
    if let waitingForID = waitingForID {
      Logger.log(level:.warn, message: "RNMBXLayer.removeFromMap - unmetPositionDependency: layer: \(optional: id) was waiting for layer: \(optional: waitingForID) but it hasn't added to map")
    }

    do {
      try style.removeLayer(withId: self.id)
    } catch {
      Logger.log(level: .error, message: "RNMBXLayer.removeFromMap: removing layer failed for layer \(optional: id): \(error.localizedDescription)")
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
      self.waitingForID = idToWaitFor
      map!.waitForLayerWithID(idToWaitFor) { _ in
        self.waitingForID = nil
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

  internal func hasSource() -> Bool {
    return true
  }
}

#if RNMBX_11
protocol LayerWithSource : Layer {
  var source: String? { get set }
  var sourceLayer: String? { get set }
  var filter: MapboxMaps.Expression? { get set}
}
#else
protocol LayerWithSource : Layer {

}
#endif
