@objc(RCTMGLImageSourceManager)
class RCTMGLImageSourceManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RCTMGLImageSource()
  }
}
