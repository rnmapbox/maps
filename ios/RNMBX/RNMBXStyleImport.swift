@_spi(Experimental) import MapboxMaps

@objc(RNMBXStyleImport)
open class RNMBXStyleImport: UIView, RNMBXMapComponent {
  var mapView: MapView? = nil
  var styleDataLoadedObserver: AnyCancelable? = nil

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

  /// Config is applied once the style root is parsed (styleDataLoaded `.style`), so the first frame already uses it.
  public func waitForStyleLoad() -> Bool {
    false
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    let mapView: MapView = map.mapView
    self.mapView = mapView
    if styleDataLoadedObserver == nil {
      styleDataLoadedObserver = mapView.mapboxMap.onStyleDataLoaded.observe { [weak self] event in
        if event.type == .style, let mapView = self?.mapView {
          self?.apply(mapView: mapView)
        }
      }
    }
    apply(mapView: mapView)
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    if reason != .StyleChange {
      styleDataLoadedObserver?.cancel()
      styleDataLoadedObserver = nil
      self.mapView = nil
    }
    return true
  }

  func apply(mapView: MapView) {
    if let config = config, let id = id, mapView.mapboxMap.styleImports.contains(where: { $0.id == id }) {
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
