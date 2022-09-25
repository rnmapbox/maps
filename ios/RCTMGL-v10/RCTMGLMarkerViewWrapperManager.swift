import Foundation
import MapboxMaps

@objc(RCTMGLMarkerViewWrapperManager)
class RCTMGLMarkerViewWrapperManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    let offscreenLocation = CGPoint(x:-1000, y:-1000)
    return RCTMGLMarkerViewWrapper(frame: CGRect(origin: offscreenLocation, size: CGSize.zero))
  }
}
