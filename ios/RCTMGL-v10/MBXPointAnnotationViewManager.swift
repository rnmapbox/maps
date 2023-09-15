import Foundation
import MapboxMaps

@objc(MBXPointAnnotationViewManager)
class MBXPointAnnotationViewManager  : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return MBXPointAnnotation()
  }
}
