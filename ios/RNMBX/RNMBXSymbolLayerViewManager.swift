@objc(RNMBXSymbolLayerViewManager)
class RNMBXSymbolLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXSymbolLayer()
      layer.bridge = self.bridge
      return layer
    }
}
