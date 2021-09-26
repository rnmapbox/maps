import Foundation
import MapboxMaps


let DEFAULT_SOURCE_ID = "composite";

@objc(MGLModule)
class MGLModule : NSObject {
  static var accessToken : String?
    
  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "StyleURL":
        [
          "Street": StyleURI.streets.rawValue,
          "Outdoors": StyleURI.outdoors.rawValue,
          "Light": StyleURI.light.rawValue,
          "Dark": StyleURI.dark.rawValue,
          "Satellite": StyleURI.satellite.rawValue,
          "SatelliteStreets": StyleURI.satelliteStreets.rawValue,
        ],
      "StyleSource":
        ["DefaultSourceID": DEFAULT_SOURCE_ID],
      "LineJoin":
        ["Round": LineJoin.round],
      "LocationCallbackName":
        ["Update": RCT_MAPBOX_USER_LOCATION_UPDATE],
      "CameraModes":
        [
          "Ease": "ease",
        ],
      "EventTypes":
        [
          "RegionDidChange" : RCTMGLEvent.EventType.regionDidChange.rawValue,
          "DidFinishLoadingMap": RCTMGLEvent.EventType.didFinishLoadingMap.rawValue
        ],
      "OfflineCallbackName":
        [
          "Error": RCTMGLOfflineModule.Callbacks.error.rawValue,
          "Progress": RCTMGLOfflineModule.Callbacks.progress.rawValue
        ]
    ];
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
      return true
  }

  @objc func setAccessToken(_ token: String) {
      MGLModule.accessToken = token
  }
}
