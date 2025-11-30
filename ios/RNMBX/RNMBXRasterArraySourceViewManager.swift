import Foundation
import MapboxMaps

#if RNMBX_11
@objc(RNMBXRasterArraySourceViewManager)
class RNMBXRasterArraySourceViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }

  override func view() -> UIView! {
    return RNMBXRasterArraySource()
  }
}
#endif
