@_spi(Experimental) import MapboxMaps

@objc
class RCTMGLInteractiveElement : UIView, RCTMGLMapComponent {

  weak var map : RCTMGLMapView? = nil
  
  var layers: [RCTMGLSourceConsumer] = []
  
  static let hitboxDefault = 44.0

  @objc var draggable: Bool = false
  
  @objc var hasPressListener: Bool = false
  
  @objc var hitbox : [String:NSNumber] = [
    "width": NSNumber(value: hitboxDefault),
    "height": NSNumber(value: hitboxDefault)
  ]
  
  @objc var id: String! = nil
  
  @objc var onDragStart: RCTBubblingEventBlock? = nil
  
  @objc var onPress: RCTBubblingEventBlock? = nil
  
  func getLayerIDs() -> [String] {
    layers.compactMap {
      if let layer = $0 as? RCTMGLLayer {
        return layer.id
      } else {
        return nil
      }
    }
  }

  func isDraggable() -> Bool {
    return draggable
  }
  
  func isTouchable() -> Bool {
    return hasPressListener
  }
  
  // MARK: - RCTMGLMapComponent
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    self.map = nil
  }
  
  func waitForStyleLoad() -> Bool {
    return true
  }
}
