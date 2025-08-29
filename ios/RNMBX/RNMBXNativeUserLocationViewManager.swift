@objc(RNMBXNativeUserLocationViewManager)
class RNMBXNativeUserLocationViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  @objc override func view() -> UIView {
    return RNMBXNativeUserLocation()
  }
}
