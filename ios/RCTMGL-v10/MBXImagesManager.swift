
@objc(MBXImagesManager)
class MBXImagesManager : RCTViewManager {
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
