@objc(MBXLightViewManager)
class MBXLightViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let light = MBXLight()
      light.bridge = self.bridge
      return light
    }
}
