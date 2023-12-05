@objc(RNMBXCustomLocationProviderViewManager)
class RNMBXCustomLocationProviderViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXCustomLocationProvider()
      //layer.bridge = self.bridge
      return layer
    }
}
