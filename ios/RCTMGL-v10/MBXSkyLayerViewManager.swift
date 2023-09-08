@objc(MBXSkyLayerViewManager)
class MBXSkyLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXSkyLayer()
      layer.bridge = self.bridge
      return layer
    }
}
