@objc(MBXRasterLayerViewManager)
class MBXRasterLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXRasterLayer()
      layer.bridge = self.bridge
      return layer
    }
}
