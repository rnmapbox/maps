@objc(RCTMGLLightManager)
class RCTMGLLightManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let light = RCTMGLLight()
      light.bridge = self.bridge
      return light
    }
}
