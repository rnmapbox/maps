@objc(MBXImageSourceViewManager)
class MBXImageSourceViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return MBXImageSource()
  }
}
