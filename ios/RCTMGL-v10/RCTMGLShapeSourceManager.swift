@objc(RCTMGLShapeSourceManager)
class RCTMGLShapeSourceManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RCTMGLShapeSource()
  }
}

// MARK: - helpers

extension RCTMGLShapeSourceManager {
  func withShapeSource(
    _ reactTag: NSNumber,
    name: String,
    rejecter: @escaping RCTPromiseRejectBlock,
    fn: @escaping (_: RCTMGLShapeSource) -> Void) {
    self.bridge.uiManager.addUIBlock { (_, viewRegistry) in
      let view = viewRegistry![reactTag]

      guard let shapeSource = view! as? RCTMGLShapeSource else {
        RCTMGLLogError("Invalid react tag, could not find RCTMGLShapeSource")
        rejecter(name, "Unknown find reactTag: \(reactTag)", nil)
        return
      }

      fn(shapeSource)
    }
  }
}

// MARK: - react methods

extension RCTMGLShapeSourceManager {
  @objc func getClusterExpansionZoom(
    _ reactTag: NSNumber,
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
    self.withShapeSource(reactTag, name: "getCluster   ExpansionZoom", rejecter: rejecter) { shapeSource in
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
    rejecter: @escaping RCTPromiseRejectBlock) {
    self.withShapeSource(reactTag, name: "getClusterLeaves", rejecter: rejecter) { shapeSource in
      shapeSource.getClusterLeaves(featureJSON, number: number, offset: offset) { result in
        switch result {
        case .success(let features):
          logged("getClusterLeaves", rejecter: rejecter) {
            let featuresJSON: Any = try features.features.toJSON()
            resolver([
              "data": ["type": "FeatureCollection", "features": featuresJSON]
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
    rejecter: @escaping RCTPromiseRejectBlock) {
    self.withShapeSource(reactTag, name: "getClusterChildren", rejecter: rejecter) { shapeSource in
      shapeSource.getClusterChildren(featureJSON) { result in
        switch result {
        case .success(let features):
          logged("getClusterChildren", rejecter: rejecter) {
            let featuresJSON: Any = try features.features.toJSON()
            resolver([
              "data": ["type": "FeatureCollection", "features": featuresJSON]
            ])
          }

        case .failure(let error):
          rejecter(error.localizedDescription, "Error.getClusterChildren", error)
        }
      }
    }
  }
}
