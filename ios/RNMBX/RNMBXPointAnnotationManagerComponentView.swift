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
      let oldSlot = map.pointAnnotationManager.manager.slot
      map.pointAnnotationManager.manager.slot = self.slot
      print("[RNMBXPointAnnotationManager] slot changed: \(oldSlot ?? "nil") -> \(self.slot ?? "nil")")
    }
  }

  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    print("[RNMBXPointAnnotationManager] addToMap, slot=\(self.slot ?? "nil")")
    applySlot()
  }
}
