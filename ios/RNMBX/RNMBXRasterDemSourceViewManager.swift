@objc(RNMBXRasterDemSourceViewManager)
class RNMBXRasterDemSourceViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RNMBXRasterDemSource()
  }
}
