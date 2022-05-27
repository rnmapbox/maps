@objc(RCTMGLShapeSourceManager)
class RCTMGLShapeSourceManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RCTMGLShapeSource()
  }
  
  @objc func getClusterExpansionZoom(
    _ reactTag: NSNumber,
    clusterId: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void
  {
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      let shapeSource = viewRegistry?[reactTag] as! RCTMGLShapeSource
      let shapes = shapeSource.getClusterExpansionZoom(clusterId) { result in
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
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      let shapeSource = viewRegistry?[reactTag] as! RCTMGLShapeSource
      let shapes = shapeSource.getClusterLeaves(featureJSON, number: number, offset: offset) { result in
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
}
