/***
to: ios/rnmbx/generated/<%= Name %>Manager.swift
***/
@objc(<%= Name %>Manager)
open class <%= Name %>Manager: RCTViewManager {
    @objc
    public override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    public override func view() -> UIView! {
        return <%= Name %>()
    }
}