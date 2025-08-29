import Foundation
import MapboxMaps

@objc(RNMBXRasterSourceViewManager)
class RNMBXRasterSourceViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func view() -> UIView! {
    return RNMBXRasterSource()
  }
}
