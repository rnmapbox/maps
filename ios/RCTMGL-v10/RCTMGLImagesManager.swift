
@objc(RCTMGLImagesManager)
class RCTMGLImagesManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = RCTMGLImages()
    layer.bridge = self.bridge
    return layer
  }
}
