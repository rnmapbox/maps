@objc(MBXLineLayerViewManager)
class MBXLineLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXLineLayer()
      layer.bridge = self.bridge
      return layer
    }
}
