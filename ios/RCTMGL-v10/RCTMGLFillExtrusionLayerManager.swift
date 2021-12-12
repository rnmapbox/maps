@objc(RCTMGLFillExtrusionLayerManager)
class RCTMGLFillExtrusionLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLFillExtrusionLayer()
      layer.bridge = self.bridge
      return layer
    }
}
