import Foundation
import MapboxMaps

@objc(RCTMGLRasterSourceManager)
class RCTMGLRasterSourceManager : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RCTMGLRasterSource()
  }
}
