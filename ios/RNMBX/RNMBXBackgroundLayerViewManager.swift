@objc(RNMBXBackgroundLayerViewManager)
class RNMBXBackgroundLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXBackgroundLayer()
      layer.bridge = self.bridge
      return layer
    }
}
