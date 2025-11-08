import Foundation
import MapboxMaps

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
