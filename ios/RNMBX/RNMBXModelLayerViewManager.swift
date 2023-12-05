@objc(RNMBXModelLayerViewManager)
class RNMBXModelLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXModelLayer()
      layer.bridge = self.bridge
      return layer
    }
}
