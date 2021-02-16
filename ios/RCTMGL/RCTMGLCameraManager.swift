import Foundation
import MapboxMaps

@objc(RCTMGLCameraManager)
class RCTMGLCameraManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    override func constantsToExport() -> [AnyHashable: Any]! {
        return [
            "foo": "bar"
        ];
    }
}
