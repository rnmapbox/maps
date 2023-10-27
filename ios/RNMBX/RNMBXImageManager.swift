
@objc(RNMBXImageManager)
class RNMBXImageManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let layer = RNMBXImage()
    return layer
  }
}
