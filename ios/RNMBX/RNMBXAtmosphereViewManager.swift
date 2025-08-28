@objc(RNMBXAtmosphereViewManager)
class RNMBXAtmosphereViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let atmosphere = RNMBXAtmosphere()
      //atmosphere.bridge = self.bridge
      return atmosphere
    }
}
