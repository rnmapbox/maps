import Foundation
import MapboxMaps

@objc(MBXMarkerViewManager)
class MBXMarkerViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return MBXMarkerView()
  }
}
