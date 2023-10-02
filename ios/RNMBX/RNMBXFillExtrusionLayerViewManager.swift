@objc(RNMBXFillExtrusionLayerViewManager)
class RNMBXFillExtrusionLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = RNMBXFillExtrusionLayer()
      layer.bridge = self.bridge
      return layer
    }
}
