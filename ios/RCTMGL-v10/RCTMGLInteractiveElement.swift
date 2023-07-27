import MapboxMaps

@objc
class RCTMGLInteractiveElement : UIView, RCTMGLMapComponent {
  weak var map : RCTMGLMapView? = nil

  static let hitboxDefault = 44.0

  @objc var draggable: Bool = false
  
  @objc var hasPressListener: Bool = false
  
  @objc var hitbox : [String:NSNumber] = [
    "width": NSNumber(value: hitboxDefault),
    "height": NSNumber(value: hitboxDefault)
  ]
  
  @objc var id: String! = nil {
    willSet {
      if id != nil && newValue != id {
        Logger.log(level:.warn, message: "Changing id from: \(optional: id) to \(optional: newValue), changing of id is supported")
        if let map = map { removeFromMap(map, reason: .ComponentChange) }
      }
    }
    didSet {
      if oldValue != nil && oldValue != id {
        if let map = map { addToMap(map, style: map.mapboxMap.style) }
      }
    }
  }
  
  @objc var onDragStart: RCTBubblingEventBlock? = nil
  
  @objc var onPress: RCTBubblingEventBlock? = nil
  
  func getLayerIDs() -> [String] {
    return []
  }

  func isDraggable() -> Bool {
    return draggable
  }
  
  func isTouchable() -> Bool {
    return hasPressListener
  }
  
  // MARK: - RCTMGLMapComponent
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    if (self.id == nil) {
      Logger.log(level: .error, message: "id is required on \(self) but not specified")
    }
    self.map = map
  }

  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    self.map = nil
    return true
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
}
