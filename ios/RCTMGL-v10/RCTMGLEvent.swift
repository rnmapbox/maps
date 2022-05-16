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
      case tap
      case longPress
      //case regionWillChange
      case regionIsChanging
      case regionDidChange
      case cameraChanged
      case mapIdle
      case imageMissing
      case didFinishLoadingMap
      case didFinishRenderingFully
      case didFinishRendering
      case didFinishLoadingStyle
      case offlineProgress
      case offlineError
      case offlineTileLimit
      case vectorSourceLayerPress
      case shapeSourceLayerPress
    }
    
    init(type: EventType, payload: [String:Any]?) {
        self.type = type.rawValue
        self.payload = payload
    }
    
}
