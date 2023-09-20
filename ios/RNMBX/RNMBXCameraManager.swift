import Foundation
import MapboxMaps

@objc(RNMBXCameraManager)
class RNMBXCameraManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return RNMBXCamera()
    }
}
