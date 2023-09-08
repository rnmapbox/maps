@objc(MBXFillExtrusionLayerViewManager)
class MBXFillExtrusionLayerViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    override func view() -> UIView! {
      let layer = MBXFillExtrusionLayer()
      layer.bridge = self.bridge
      return layer
    }
}
