@objc(MBXSymbolLayerViewManager)
class MBXSymbolLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXSymbolLayer()
      layer.bridge = self.bridge
      return layer
    }
}
