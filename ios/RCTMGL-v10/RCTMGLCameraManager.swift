import Foundation
import MapboxMaps

@objc(RCTMGLCameraManager)
class RCTMGLCameraManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return RCTMGLCamera()
    }
}
