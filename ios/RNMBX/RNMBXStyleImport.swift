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

  @objc
  var merge: Bool = false;
  
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
      if merge {
        for (key, value) in config {
          logged("RNMBXStyleImport.setStyleImportConfigProperty for id=\(id), config=\(key), value=\(value)") {
            try mapView.mapboxMap.setStyleImportConfigProperty(for: id, config: key, value: value)
          }
        }
      } else {
        logged("RNMBXStyleImport.setStyleImportConfigProperties id=\(id)") {
          try mapView.mapboxMap.setStyleImportConfigProperties(for: id, configs: config)
        }
      }
      #else
      Logger.error("RNMBXStyleImport.setStyleImportConfigProperties is only implemented on v11")
      #endif
    }
  }
}
