@objc(RNMBXFillExtrusionLayerManager)
class RNMBXFillExtrusionLayerManager: RCTViewManager {
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
