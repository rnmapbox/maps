import Foundation

@objc(RNMBXRasterParticleLayerViewManager)
class RNMBXRasterParticleLayerViewManager: RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func view() -> UIView! {
    let layer = RNMBXRasterParticleLayer()
    layer.bridge = self.bridge
    return layer
  }
}
