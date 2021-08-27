@objc(RCTMGLCircleLayerManager)
class RCTMGLCircleLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLCircleLayer()
      layer.bridge = self.bridge
      return layer
    }
}
