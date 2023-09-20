@objc(RNMBXNativeUserLocationManager)
class RNMBXNativeUserLocationManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc override func view() -> UIView {
    return RNMBXNativeUserLocation()
  }
}
