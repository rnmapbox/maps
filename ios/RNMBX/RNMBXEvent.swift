import Foundation

protocol RNMBXEventProtocol {
    func toJSON() -> [String: Any?];
}

@objc
class RNMBXEvent : NSObject, RNMBXEventProtocol {
    var type: String = ""
    var payload: [String:Any?]? = nil
    func toJSON() -> [String: Any?]
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
      case mapLoadingError
      case didFinishRenderingFully
      case didFinishRendering
      case didFinishLoadingStyle
      case willStartLoadingMap
      case offlineProgress
      case offlineError
      case offlineTileLimit
      case onUserTrackingModeChange
      case vectorSourceLayerPress
      case shapeSourceLayerPress
      case annotationSelected = "annotationselected"
      case annotationDeselected = "annotationdeselected"
    }
    
    init(type: EventType, payload: [String:Any?]?) {
        self.type = type.rawValue
        self.payload = payload
    }
}
