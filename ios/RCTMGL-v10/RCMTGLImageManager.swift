@objc(RCTMGLImageManager)
class RCTMGLImageManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = RCTMGLImage()
    layer.bridge = self.bridge
    return layer
  }
}
