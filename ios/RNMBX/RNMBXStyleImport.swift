@_spi(Experimental) import MapboxMaps

@objc(RNMBXStyleImport)
open class RNMBXStyleImport: UIView, RNMBXMapComponent {
  var mapView: MapView? = nil

  // MARK: React properties
  @objc
  public var id: String? = nil

  @objc
  public var existing: Bool = false

  @objc
  public var config: [String: Any]? {
    didSet {
      if let mapView = mapView {
        apply(mapView: mapView)
      }
    }
  }

  public func waitForStyleLoad() -> Bool {
    true
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    mapView = map.mapView
    apply(mapView: map.mapView)
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    self.mapView = nil
    return true
  }

  func apply(mapView: MapView) {
    if let config = config, let id = id {
      logged("RNMBXStyleImport.setStyleImportConfigProperties id=\(id)") {
        try mapView.mapboxMap.setStyleImportConfigProperties(for: id, configs: config)
      }
    }
  }

  @objc
  public override func didSetProps(_ props: [String]) {
    if let mapView = mapView {
      apply(mapView: mapView)
    }
  }
}
