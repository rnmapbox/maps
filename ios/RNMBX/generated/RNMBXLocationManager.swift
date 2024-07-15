/***
to: ios/rnmbx/generated/RNMBXLocationManager.swift
***/
@objc(RNMBXLocationManager)
open class RNMBXLocationManager: RCTViewManager {
    @objc
    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    public override func view() -> UIView! {
        return RNMBXLocation()
    }
}