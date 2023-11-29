@_spi(Experimental) import MapboxMaps

@objc(RNMBXModels)
open class RNMBXModels : UIView, RNMBXMapComponent {
  var models: [String: String] = [:]
  
  @objc
  func setModels(_ models: NSDictionary) {
    var newModels: [String: String] = [:]
    models.forEach { (key, value) in
      if let value = value as? NSDictionary, let key = key as? String {
        if let uri = value["uri"] as? String {
          newModels[key] = uri
        } else if let url = value["url"] as? String {
          newModels[key] = url
        } else {
          Logger.log(level: .error, message: "Unexpected value for model key: \(key) \(value) - no uri or url found")
        }
      }
    }
    self.models = newModels
  }
  
  func addToMap(_ map: RNMBXMapView, style: Style) {
    models.forEach { (id, uri) in
      logged("Models.addStyleModel") {
        if let link = URL(string: uri), let scheme = link.scheme, let host = link.host,
            let port = link.port {

          // https://github.com/mapbox/mapbox-maps-ios/issues/2067
          let uriWithoutQuery = "\(scheme)://\(host):\(port)\(link.path)"

          try style.addStyleModel(modelId: id, modelUri: uri)
        } else {
          try style.addStyleModel(modelId: id, modelUri: uri)
        }
      }
    }
  }
  
  func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    models.forEach { (id, _) in
      #if RNMBX_11
      try? map._mapView?.mapboxMap.removeStyleModel(modelId: id)
      #endif
    }
    return true
  }
  
  func waitForStyleLoad() -> Bool {
    true
  }
}
