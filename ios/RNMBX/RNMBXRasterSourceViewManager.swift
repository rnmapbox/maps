import Foundation
import MapboxMaps

@objc(RNMBXRasterSourceViewManager)
class RNMBXRasterSourceViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RNMBXRasterSource()
  }
}
