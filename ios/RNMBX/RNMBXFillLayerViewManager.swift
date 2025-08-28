@objc(RNMBXFillLayerViewManager)
class RNMBXFillLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let layer = RNMBXFillLayer()
      layer.bridge = self.bridge
      return layer
    }
}
