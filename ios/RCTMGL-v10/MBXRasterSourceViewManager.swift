import Foundation
import MapboxMaps

@objc(MBXRasterSourceViewManager)
class MBXRasterSourceViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return MBXRasterSource()
  }
}
