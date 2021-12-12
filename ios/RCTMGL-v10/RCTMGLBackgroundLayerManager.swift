@objc(RCTMGLBackgroundLayerManager)
class RCTMGLBackgroundLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLBackgroundLayer()
      layer.bridge = self.bridge
      return layer
    }
}
