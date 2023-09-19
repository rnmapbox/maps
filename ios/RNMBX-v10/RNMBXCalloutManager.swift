import Foundation
import MapboxMaps

@objc(RNMBXCalloutManager)
class RNMBXCalloutManager  : RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    override func view() -> UIView! {
        return RNMBXCallout()
    }
}
