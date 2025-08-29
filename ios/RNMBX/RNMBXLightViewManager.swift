@objc(RNMBXLightViewManager)
class RNMBXLightViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let light = RNMBXLight()
      light.bridge = self.bridge
      return light
    }
}
