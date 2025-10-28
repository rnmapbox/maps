#if !RCT_NEW_ARCH_ENABLED
import Foundation
import MapboxMaps

@objc(RNMBXMarkerViewManager)
class RNMBXMarkerViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func view() -> UIView! {
    return RNMBXMarkerView()
  }
}
#endif
