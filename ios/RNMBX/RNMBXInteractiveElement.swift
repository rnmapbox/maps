import MapboxMaps

@objc
public class RNMBXInteractiveElement : UIView, RNMBXMapComponent {
  weak var map : RNMBXMapView? = nil

  static let hitboxDefault = 44.0

  @objc public var draggable: Bool = false
  
  @objc public var hasPressListener: Bool = false
  
  @objc public var hitbox : [String:NSNumber] = [
    "width": NSNumber(value: hitboxDefault),
    "height": NSNumber(value: hitboxDefault)
  ]
  
  @objc public var id: String! = nil {
    willSet {
      if id != nil && newValue != id {
        Logger.log(level:.warn, message: "Changing id from: \(optional: id) to \(optional: newValue), changing of id is not supported")
        if let map = map { removeFromMap(map, reason: .ComponentChange) }
      }
    }
    didSet {
      if oldValue != nil && oldValue != id {
        if let map = map { addToMap(map, style: map.mapboxMap.style) }
      }
    }
  }
  
  @objc public var onDragStart: RCTBubblingEventBlock? = nil
  
  @objc public var onPress: RCTBubblingEventBlock? = nil
  
  func getLayerIDs() -> [String] {
    return []
  }

  func isDraggable() -> Bool {
    return draggable
  }
  
  func isTouchable() -> Bool {
    return hasPressListener
  }
  
  // MARK: - RNMBXMapComponent
  public func addToMap(_ map: RNMBXMapView, style: Style) {
    if (self.id == nil) {
      Logger.log(level: .error, message: "id is required on \(self) but not specified")
    }
    self.map = map
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    self.map = nil
    return true
  }
  
  public func waitForStyleLoad() -> Bool {
    return true
  }
}
