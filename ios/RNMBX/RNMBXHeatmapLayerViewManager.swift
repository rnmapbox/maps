@objc(RNMBXHeatmapLayerViewManager)
class RNMBXHeatmapLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let layer = RNMBXHeatmapLayer()
      layer.bridge = self.bridge
      return layer
    }
}
