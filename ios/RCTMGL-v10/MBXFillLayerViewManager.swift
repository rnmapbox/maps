@objc(MBXFillLayerViewManager)
class MBXFillLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXFillLayer()
      layer.bridge = self.bridge
      return layer
    }
}
