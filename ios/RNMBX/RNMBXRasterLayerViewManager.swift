@objc(RNMBXRasterLayerViewManager)
class RNMBXRasterLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let layer = RNMBXRasterLayer()
      layer.bridge = self.bridge
      return layer
    }
}
