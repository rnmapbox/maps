@objc(RCTMGLFillLayerManager)
class RCTMGLFillLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLFillLayer()
      layer.bridge = self.bridge
      return layer
    }
}
