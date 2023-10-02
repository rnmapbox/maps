@objc(RNMBXFillLayerViewManager)
class RNMBXFillLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXFillLayer()
      layer.bridge = self.bridge
      return layer
    }
}
