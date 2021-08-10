import Foundation
import MapboxMaps

@objc(RCTMGLOfflineModule)
class RCTMGLOfflineModule: NSObject {
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    @objc
    func constantsToExport() -> [AnyHashable: Any]! {
        return [
            "foo": "bar"
        ];
    }
}
