@objc(RCTMGLAtmosphereManager)
class RCTMGLAtmosphereManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }

  override func view() -> UIView! {
    let atmosphere = RCTMGLAtmosphere()
    // atmosphere.bridge = self.bridge
    return atmosphere
  }
}
