@objc(RNMBXLineLayerViewManager)
class RNMBXLineLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
  
    override func view() -> UIView! {
      let layer = RNMBXLineLayer()
      layer.bridge = self.bridge
      return layer
    }
}
