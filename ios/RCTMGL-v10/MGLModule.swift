import Foundation
import MapboxMaps


let DEFAULT_SOURCE_ID = "composite";

@objc(MGLModule)
class MGLModule : NSObject {
  static var accessToken : String?
    
  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    return [
      "MapboxV10":true,
      "StyleURL":
        [
          "Street": StyleURI.streets.rawValue,
          "Outdoors": StyleURI.outdoors.rawValue,
          "Light": StyleURI.light.rawValue,
          "Dark": StyleURI.dark.rawValue,
          "Satellite": StyleURI.satellite.rawValue,
          "SatelliteStreets": StyleURI.satelliteStreets.rawValue,
        ],
      "OfflinePackDownloadState":
        [
          "Inactive": RCTMGLOfflineModule.State.inactive.rawValue,
          "Active": RCTMGLOfflineModule.State.active.rawValue,
          "Complete": RCTMGLOfflineModule.State.complete.rawValue
        ],
      "StyleSource":
        ["DefaultSourceID": DEFAULT_SOURCE_ID],
      "LineJoin":
        ["Round": LineJoin.round],
      "LocationCallbackName":
        ["Update": RCT_MAPBOX_USER_LOCATION_UPDATE],
      "CameraModes":
        [
          "Flight": CameraMode.flight.rawValue,
          "Ease": CameraMode.ease.rawValue,
          "Linear": CameraMode.linear.rawValue,
          "Move": CameraMode.none.rawValue
        ],
      "EventTypes":
        [
          "RegionIsChanging" : RCTMGLEvent.EventType.regionIsChanging.rawValue,
          "RegionDidChange" : RCTMGLEvent.EventType.regionDidChange.rawValue,
          "CameraChanged" : RCTMGLEvent.EventType.cameraChanged.rawValue,
          "MapIdle" : RCTMGLEvent.EventType.mapIdle.rawValue,
          "DidFinishLoadingStyle": RCTMGLEvent.EventType.didFinishLoadingStyle.rawValue,
          "DidFinishLoadingMap": RCTMGLEvent.EventType.didFinishLoadingMap.rawValue,
          "DidFinishRenderingFrameFully":  RCTMGLEvent.EventType.didFinishRenderingFully.rawValue,
          "DidFinishRenderingFrame": RCTMGLEvent.EventType.didFinishRendering.rawValue,
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
