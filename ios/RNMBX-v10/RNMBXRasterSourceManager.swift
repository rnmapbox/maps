import Foundation
import MapboxMaps

@objc(RNMBXRasterSourceManager)
class RNMBXRasterSourceManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RNMBXRasterSource()
  }
}
