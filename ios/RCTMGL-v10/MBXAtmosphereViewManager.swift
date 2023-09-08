@objc(MBXAtmosphereViewManager)
class MBXAtmosphereViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let atmosphere = MBXAtmosphere()
      //atmosphere.bridge = self.bridge
      return atmosphere
    }
}
