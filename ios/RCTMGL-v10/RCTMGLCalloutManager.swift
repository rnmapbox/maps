import Foundation
import MapboxMaps

@objc(RCTMGLCalloutManager)
class RCTMGLCalloutManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return RCTMGLCallout()
    }
}
