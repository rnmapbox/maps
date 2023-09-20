@objc(RNMBXLineLayerManager)
class RNMBXLineLayerManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXLineLayer()
      layer.bridge = self.bridge
      return layer
    }
}
