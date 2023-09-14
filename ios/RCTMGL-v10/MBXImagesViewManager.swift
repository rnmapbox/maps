
@objc(MBXImagesViewManager)
class MBXImagesViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = MBXImages()
    layer.bridge = self.bridge
    return layer
  }
}
