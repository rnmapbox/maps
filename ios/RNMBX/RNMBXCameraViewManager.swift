import Foundation
import MapboxMaps

@objc(RNMBXCameraViewManager)
class RNMBXCameraViewManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return RNMBXCamera()
    }
}
