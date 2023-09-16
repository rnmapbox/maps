import Foundation
import MapboxMaps
#if canImport(MapboxMobileEvents)
import MapboxMobileEvents
#endif


let DEFAULT_SOURCE_ID = "composite";

@objc(MGLModule)
class MGLModule : NSObject {
  #if RNMBX_11
  static var accessToken : String? {
    didSet {
      if let token = accessToken {
        MapboxOptions.accessToken = token
      }
    }
  }
  #else
    static var accessToken : String?
  #endif
    
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
          "SatelliteStreet": StyleURI.satelliteStreets.rawValue,
        ],
      "OfflinePackDownloadState":
        [
          "Inactive": RCTMGLOfflineModule.State.inactive.rawValue,
          "Active": RCTMGLOfflineModule.State.active.rawValue,
          "Complete": RCTMGLOfflineModule.State.complete.rawValue,
          "Unknown": RCTMGLOfflineModule.State.unknown.rawValue,
        ],
      "StyleSource":
        ["DefaultSourceID": DEFAULT_SOURCE_ID],
      "LineJoin":
        [
          "Bevel": LineJoin.bevel.rawValue,
          "Round": LineJoin.round.rawValue,
          "Miter": LineJoin.miter.rawValue,
        ],
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
          "WillStartLoadingMap": RCTMGLEvent.EventType.willStartLoadingMap.rawValue,
          "DidFinishLoadingStyle": RCTMGLEvent.EventType.didFinishLoadingStyle.rawValue,
          "DidFinishLoadingMap": RCTMGLEvent.EventType.didFinishLoadingMap.rawValue,
          "MapLoadingError": RCTMGLEvent.EventType.mapLoadingError.rawValue,
          "DidFinishRenderingFrameFully":  RCTMGLEvent.EventType.didFinishRenderingFully.rawValue,
          "DidFinishRenderingFrame": RCTMGLEvent.EventType.didFinishRendering.rawValue,
        ],
      "OfflineCallbackName":
        [
          "Error": RCTMGLOfflineModule.Callbacks.error.rawValue,
          "Progress": RCTMGLOfflineModule.Callbacks.progress.rawValue
        ],
      "TileServers":
        ["Mapbox": "mapbox"]
    ];
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
      return true
  }

  @objc func setAccessToken(
    _ token: String, 
    resolver: RCTPromiseResolveBlock,
    rejecter: RCTPromiseRejectBlock) {
      MGLModule.accessToken = token
      resolver(token)
  }

  @objc func addCustomHeader(_ headerName: String, forHeaderValue headerValue: String ) {
    CustomHttpHeaders.shared.customHeaders[headerName] = headerValue
  }

  @objc func removeCustomHeader(_ headerName: String) {
    CustomHttpHeaders.shared.customHeaders[headerName] = nil
  }
  
  @objc func setTelemetryEnabled(_ telemetryEnabled: Bool) {
    #if !RNMBX_11 // RNMBX_11_TODO
    UserDefaults.mme_configuration().mme_isCollectionEnabled = telemetryEnabled
    #endif
  }

  @objc func setWellKnownTileServer(_ tileServer: String) {
    if tileServer != "mapbox" {
      Logger.error("setWellKnownTileServer: \(tileServer) should be mapbox")
    }
  }
}
