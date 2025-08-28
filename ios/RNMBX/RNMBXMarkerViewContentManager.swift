import Foundation
import MapboxMaps

@objc(RNMBXMarkerViewContentManager)
class RNMBXMarkerViewContentManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  override func view() -> UIView! {
    return UIView()
  }
}
