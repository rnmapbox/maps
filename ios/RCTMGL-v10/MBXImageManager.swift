
@objc(MBXImageManager)
class MBXImageManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = MBXImage()
    return layer
  }
}
