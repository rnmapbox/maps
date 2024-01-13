import Foundation
import MapboxMaps
#if canImport(MapboxMobileEvents)
import MapboxMobileEvents
#endif


let DEFAULT_SOURCE_ID = "composite";

@objc(RNMBXModule)
public
class RNMBXModule : NSObject {
  
  public static var accessToken : String? {
    didSet {
#if RNMBX_11
      if let token = accessToken {
        MapboxOptions.accessToken = token
      }
#else
      if let token = accessToken {
        ResourceOptionsManager.default.resourceOptions.accessToken = token
      }
#endif
    }
  }

    
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
          "Inactive": RNMBXOfflineModule.State.inactive.rawValue,
          "Active": RNMBXOfflineModule.State.active.rawValue,
          "Complete": RNMBXOfflineModule.State.complete.rawValue,
          "Unknown": RNMBXOfflineModule.State.unknown.rawValue,
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
          "RegionIsChanging" : RNMBXEvent.EventType.regionIsChanging.rawValue,
          "RegionDidChange" : RNMBXEvent.EventType.regionDidChange.rawValue,
          "CameraChanged" : RNMBXEvent.EventType.cameraChanged.rawValue,
          "MapIdle" : RNMBXEvent.EventType.mapIdle.rawValue,
          "WillStartLoadingMap": RNMBXEvent.EventType.willStartLoadingMap.rawValue,
          "DidFinishLoadingStyle": RNMBXEvent.EventType.didFinishLoadingStyle.rawValue,
          "DidFinishLoadingMap": RNMBXEvent.EventType.didFinishLoadingMap.rawValue,
          "MapLoadingError": RNMBXEvent.EventType.mapLoadingError.rawValue,
          "DidFinishRenderingFrameFully":  RNMBXEvent.EventType.didFinishRenderingFully.rawValue,
          "DidFinishRenderingFrame": RNMBXEvent.EventType.didFinishRendering.rawValue,
        ],
      "OfflineCallbackName":
        [
          "Error": RNMBXOfflineModule.Callbacks.error.rawValue,
          "Progress": RNMBXOfflineModule.Callbacks.progress.rawValue
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
      RNMBXModule.accessToken = token
      resolver(token)
  }

  @objc func addCustomHeader(_ headerName: String, forHeaderValue headerValue: String ) {
    CustomHttpHeaders.shared.customHeaders[headerName] = headerValue
  }

  @objc func removeCustomHeader(_ headerName: String) {
    CustomHttpHeaders.shared.customHeaders[headerName] = nil
  }
  
  @objc func setTelemetryEnabled(_ telemetryEnabled: Bool) {
    UserDefaults.standard.set(telemetryEnabled, forKey: "MGLMapboxMetricsEnabled")
  }

  @objc func setWellKnownTileServer(_ tileServer: String) {
    if tileServer != "mapbox" {
      Logger.error("setWellKnownTileServer: \(tileServer) should be mapbox")
    }
  }

  @objc func clearData(_ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
    
    DispatchQueue.main.async {
      #if RNMBX_11
      MapboxMap.clearData { error in
        if let error = error {
          rejecter("error", error.localizedDescription, error)
        } else {
          resolver(nil)
        }
      }
      #else
      MapboxMap.clearData(for: ResourceOptions(accessToken: RNMBXModule.accessToken ?? "")) { error in
        if let error = error {
          rejecter("error", error.localizedDescription, error)
        } else {
          resolver(nil)
        }
      }
      #endif
    }
  }
}
