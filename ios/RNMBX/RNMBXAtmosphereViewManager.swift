@objc(RNMBXAtmosphereViewManager)
class RNMBXAtmosphereViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let atmosphere = RNMBXAtmosphere()
      //atmosphere.bridge = self.bridge
      return atmosphere
    }
}
