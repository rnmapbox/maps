@objc(RNMBXShapeSourceViewManager)
public class RNMBXShapeSourceViewManager: RCTViewManager {
  @objc
  override public static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override public func view() -> UIView {
    return RNMBXShapeSource()
  }
}
// MARK: - react methods

extension RNMBXShapeSourceViewManager {
  @objc public static func getClusterExpansionZoom(
    shapeSource: RNMBXShapeSource,
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void
  {
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
  
  @objc public static func getClusterLeaves(
    shapeSource: RNMBXShapeSource,
    featureJSON: String,
    number: uint,
    offset: uint,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void
  {
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
  
  @objc public static func getClusterChildren(
    shapeSource: RNMBXShapeSource,
    featureJSON: String,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
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

