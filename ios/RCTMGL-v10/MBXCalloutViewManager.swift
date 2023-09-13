import Foundation
import MapboxMaps

@objc(MBXCalloutViewManager)
class MBXCalloutViewManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return MBXCallout()
    }
}
