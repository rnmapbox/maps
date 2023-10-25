import Foundation
import MapboxMaps

@objc(RNMBXPointAnnotationViewManager)
class RNMBXPointAnnotationViewManager  : RCTViewManager {
  @objc
  override static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  override func view() -> UIView! {
    return RNMBXPointAnnotation()
  }
}
