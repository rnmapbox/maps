import Foundation
import MapboxMaps

@objc(RCTMGLMarkerViewWrapperManager)
class RCTMGLMarkerViewWrapperManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RCTMGLMarkerViewWrapper()
  }
}
