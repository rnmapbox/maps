@objc(RCTMGLSymbolLayerManager)
class RCTMGLSymbolLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLSymbolLayer()
      layer.bridge = self.bridge
      return layer
    }
}
