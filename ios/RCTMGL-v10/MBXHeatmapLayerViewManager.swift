@objc(MBXHeatmapLayerViewManager)
class MBXHeatmapLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXHeatmapLayer()
      layer.bridge = self.bridge
      return layer
    }
}
