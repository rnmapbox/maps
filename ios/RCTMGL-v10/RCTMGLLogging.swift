import Foundation
import MapboxMaps

@objc(RCTMGLLogging)
class RCTMGLLogging: RCTEventEmitter {
    
    enum ErrorType {
        case argumentError
    }

    static func error(_ errorType : ErrorType, _ message: String) {
        print("RCTMGL error \(message)")
    }
    
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
