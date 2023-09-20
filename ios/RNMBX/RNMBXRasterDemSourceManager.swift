@objc(RNMBXRasterDemSourceManager)
class RNMBXRasterDemSourceManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RNMBXRasterDemSource()
  }
}
