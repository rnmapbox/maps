import Foundation
import MapboxMaps

@objc(RNMBXMarkerViewContentManager)
class RNMBXMarkerViewContentManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return UIView()
  }
}
