@_spi(Experimental) import MapboxMaps

@objc(RNMBXStyleImport)
open class RNMBXStyleImport : UIView, RNMBXMapComponent {
  var mapView: MapView? = nil
  
  // MARK: React properties
  @objc
  var id: String? = nil;
  
  @objc
  var existing: Bool = false;
  
  @objc
  var config: [String: Any]? {
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
      #if RNMBX_11
      logged("RNMBXStyleImport.setStyleImportConfigProperties id=\(id)") {
        try mapView.mapboxMap.setStyleImportConfigProperties(for: id, configs: config)
      }
      #else
      Logger.error("RNMBXStyleImport.setStyleImportConfigProperties is only implemented on v11")
      #endif
    }
  }
}
