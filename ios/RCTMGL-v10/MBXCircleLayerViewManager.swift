@objc(MBXCircleLayerViewManager)
class MBXCircleLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXCircleLayer()
      layer.bridge = self.bridge
      return layer
    }
}
