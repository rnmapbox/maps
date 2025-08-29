import Foundation
import MapboxMaps

@objc(RNMBXCameraViewManager)
class RNMBXCameraViewManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func view() -> UIView! {
        return RNMBXCamera()
    }
}
