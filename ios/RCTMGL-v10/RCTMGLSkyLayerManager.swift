@objc(RCTMGLSkyLayerManager)
class RCTMGLSkyLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLSkyLayer()
      layer.bridge = self.bridge
      return layer
    }
}
