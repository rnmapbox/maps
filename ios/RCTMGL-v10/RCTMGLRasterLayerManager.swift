@objc(RCTMGLRasterLayerManager)
class RCTMGLRasterLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLRasterLayer()
      layer.bridge = self.bridge
      return layer
    }
}
