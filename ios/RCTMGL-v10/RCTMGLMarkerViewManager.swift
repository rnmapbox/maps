import Foundation
import MapboxMaps

@objc(RCTMGLMarkerViewManager)
class RCTMGLMarkerViewManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RCTMGLMarkerView()
  }
}
