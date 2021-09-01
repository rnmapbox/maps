
@objc(RCTMGLImagesManager)
class RCTMGLImagesManager : RCTViewManager {
  override func view() -> UIView! {
    let layer = RCTMGLImages()
    layer.bridge = self.bridge
    return layer
  }
}
