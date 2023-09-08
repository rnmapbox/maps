@objc(MBXBackgroundLayerViewManager)
class MBXBackgroundLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXBackgroundLayer()
      layer.bridge = self.bridge
      return layer
    }
}
