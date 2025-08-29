@objc(RNMBXImageSourceViewManager)
class RNMBXImageSourceViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc override func view() -> UIView {
    return RNMBXImageSource()
  }
}
