@objc(RNMBXVectorSourceViewManager)
class RNMBXVectorSourceViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
 
  @objc override func view() -> UIView {
    return RNMBXVectorSource()
  }
}
