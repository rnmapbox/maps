@objc(RCTMGLHeatmapLayerManager)
class RCTMGLHeatmapLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RCTMGLHeatmapLayer()
      layer.bridge = self.bridge
      return layer
    }
}
