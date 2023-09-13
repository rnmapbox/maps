@objc(MBXRasterDemSourceViewManager)
class MBXRasterDemSourceViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return MBXRasterDemSource()
  }
}
