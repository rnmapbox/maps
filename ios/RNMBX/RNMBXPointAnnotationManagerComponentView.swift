import MapboxMaps

@objc(RNMBXPointAnnotationManagerView)
open class RNMBXPointAnnotationManagerView: RNMBXMapComponentBase {
  @objc public var slot: String? = nil {
    didSet {
      applySlot()
    }
  }

  private func applySlot() {
    withRNMBXMapView { map in
      map.pointAnnotationManager.manager.slot = self.slot
    }
  }

  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    applySlot()
  }

  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    map.pointAnnotationManager.manager.slot = nil
    return super.removeFromMap(map, reason: reason)
  }
}
