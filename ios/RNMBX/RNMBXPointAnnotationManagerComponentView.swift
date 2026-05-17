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
      if let slot = self.slot {
        map.pointAnnotationManager.manager.slot = Slot(rawValue: slot)
      } else {
        map.pointAnnotationManager.manager.slot = nil
      }
    }
  }

  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    applySlot()
  }
}
