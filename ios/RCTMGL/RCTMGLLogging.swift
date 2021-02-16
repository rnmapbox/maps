import Foundation
import MapboxMaps

@objc(RCTMGLLogging)
class RCTMGLLogging: RCTEventEmitter {
    @objc
    static override func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    override func constantsToExport() -> [AnyHashable: Any]! {
        return [
            "todo": "implement"
        ];
    }
    
    @objc
    override func supportedEvents() -> [String]
    {
        return ["LogEvent"];
    }
}
