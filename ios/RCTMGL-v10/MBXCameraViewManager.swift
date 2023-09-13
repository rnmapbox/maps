import Foundation
import MapboxMaps

@objc(MBXCameraViewManager)
class MBXCameraViewManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return MBXCamera()
    }
}
