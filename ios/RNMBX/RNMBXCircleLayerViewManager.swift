@objc(RNMBXCircleLayerViewManager)
class RNMBXCircleLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXCircleLayer()
      layer.bridge = self.bridge
      return layer
    }
}
