import Foundation
import MapboxMaps

@objc(RNMBXCalloutViewManager)
class RNMBXCalloutViewManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return false
    }
    
    override func view() -> UIView! {
        return RNMBXCallout()
    }
}
