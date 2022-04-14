import Foundation

protocol RCTMGLEventProtocol {

    func toJSON() -> [String: Any];
}

@objc
class RCTMGLEvent : NSObject, RCTMGLEventProtocol {
    var type: String = ""
    var payload: [String:Any]? = nil
    func toJSON() -> [String: Any]
    {
        if let payload = payload {
            return ["type": type, "payload": payload];
        } else {
            return ["type": type]
        }
    }

    enum EventType : String {
      case tap = "press"
      case regionDidChange = "regiondidchange"
      case imageMissing = "imagesmissingimage"
      case didFinishLoadingMap = "didfinishloadingmap"
      case offlineProgress = "offlinestatus"
      case offlineError = "offlineerror"
      case offlineTileLimit = "offlinetileLimit"
      case vectorSourceLayerPress = "vectorsourcelayerpress"
      case shapeSourceLayerPress = "shapesourcelayerpress"
    }
    
    init(type: EventType, payload: [String:Any]?) {
        self.type = type.rawValue
        self.payload = payload
    }
    
}

