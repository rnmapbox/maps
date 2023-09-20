@objc(RNMBXShapeSourceManager)
class RNMBXShapeSourceManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RNMBXShapeSource()
  }
}

// MARK: - helpers

extension RNMBXShapeSourceManager {
  func withShapeSource(
      _ reactTag: NSNumber,
      name: String,
      rejecter: @escaping RCTPromiseRejectBlock,
      fn: @escaping (_: RNMBXShapeSource) -> Void) -> Void
  {
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      let view = viewRegistry![reactTag]

      guard let shapeSource = view! as? RNMBXShapeSource else {
        RNMBXLogError("Invalid react tag, could not find RNMBXShapeSource");
        rejecter(name, "Unknown find reactTag: \(reactTag)", nil)
        return;
      }

      fn(shapeSource)
    }
  }
}

// MARK: - react methods

extension RNMBXShapeSourceManager {
  @objc func getClusterExpansionZoom(
    _ reactTag: NSNumber,
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void
  {
    self.withShapeSource(reactTag, name:"getCluster   ExpansionZoom", rejecter: rejecter) { shapeSource in
      shapeSource.getClusterExpansionZoom(featureJSON) { result in
        switch result {
        case .success(let zoom):
          resolver([
            "data": NSNumber(value: zoom)
          ])
        case .failure(let error):
          rejecter(error.localizedDescription, "Error.getClusterExpansionZoom", error)
        }
      }
    }
  }
  
  @objc func getClusterLeaves(
    _ reactTag: NSNumber,
    featureJSON: String,
    number: uint,
    offset: uint,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void
  {
    self.withShapeSource(reactTag, name:"getClusterLeaves", rejecter: rejecter) { shapeSource in
      shapeSource.getClusterLeaves(featureJSON, number: number, offset: offset) { result in
        switch result {
        case .success(let features):
          logged("getClusterLeaves", rejecter: rejecter) {
            let featuresJSON : Any = try features.features.toJSON()
            resolver([
              "data": ["type":"FeatureCollection", "features": featuresJSON]
            ])
          }
        case .failure(let error):
          rejecter(error.localizedDescription, "Error.getClusterLeaves", error)
        }
      }
    }
  }
  
  @objc func getClusterChildren(
    _ reactTag: NSNumber,
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      self.withShapeSource(reactTag, name:"getClusterChildren", rejecter: rejecter) { shapeSource in
      shapeSource.getClusterChildren(featureJSON) { result in
        switch result {
        case .success(let features):
          logged("getClusterChildren", rejecter: rejecter) {
            let featuresJSON : Any = try features.features.toJSON()
            resolver([
              "data": ["type":"FeatureCollection", "features": featuresJSON]
            ])
          }
        case .failure(let error):
          rejecter(error.localizedDescription, "Error.getClusterChildren", error)
        }
      }
    }
  }
}

