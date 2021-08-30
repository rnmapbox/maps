@objc(RCTMGLLineLayerManager)
class RCTMGLLineLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLLineLayer()
      layer.bridge = self.bridge
      return layer
    }
}
