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
      if let token = accessToken {
        MapboxOptions.accessToken = token
      }
    }
  }

    
  @objc
  func constantsToExport() -> [AnyHashable: Any]! {
    return [
      // Deprecated: means v10 or later, always true. Will be removed in next major version.
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
  
  @objc func addCustomHeader(_ headerName: String, forHeaderValue headerValue: String) {
    addCustomHeaderWithOptions(headerName, forHeaderValue: headerValue, forOptions: nil)
  }

  @objc func addCustomHeaderWithOptions(_ headerName: String, forHeaderValue headerValue: String, forOptions options: NSDictionary?) {
    var urlRegexp: NSRegularExpression? = nil
    if let pattern = options?.value(forKey: "urlRegexp") as? String {
      do {
        urlRegexp = try NSRegularExpression(pattern: pattern)
      }
      catch {
        Logger.log(level: .error, message: "Invalid regex pattern: \(error.localizedDescription)")
      }
    }
    
    CustomHttpHeaders.shared.addCustomHeader(headerName, value: CustomHttpHeadersMapValue(headerValue: headerValue, options: CustomHttpHeadersOptions(urlRegexp: urlRegexp)))
    RNMBXHttpInterceptor.shared.install()
  }

  @objc func removeCustomHeader(_ headerName: String) {
    CustomHttpHeaders.shared.removeCustomHeader(headerName)
  }
  
  @objc func setTelemetryEnabled(_ telemetryEnabled: Bool) {
    UserDefaults.standard.set(telemetryEnabled, forKey: "MGLMapboxMetricsEnabled")
  }

  @objc func setWellKnownTileServer(_ tileServer: String) {
    if tileServer != "mapbox" {
      Logger.error("setWellKnownTileServer: \(tileServer) should be mapbox")
    }
  }

  /// Sets `MapboxCommonSettings.language` in the persistent settings storage, see https://docs.mapbox.com/help/dive-deeper/maps-internationalization/
  @objc func setLanguage(_ language: Any?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
    let settings = SettingsServiceFactory.getInstance(storageType: .persistent)
    let result: Result<Void, SettingsServiceError>
    switch language {
    case let tag as String:
      result = settings.set(key: MapboxCommonSettings.language, value: tag)
    case let tags as [String]:
      result = settings.set(key: MapboxCommonSettings.language, value: tags)
    case nil, is NSNull:
      result = settings.erase(key: MapboxCommonSettings.language)
    default:
      rejecter("error", "setLanguage: language must be a string, an array of strings or null, got \(language ?? "nil")", nil)
      return
    }
    switch result {
    case .success:
      resolver(nil)
    case .failure(let error):
      rejecter("error", "setLanguage: \(error.localizedDescription)", error)
    }
  }

  @objc func clearData(_ resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {

    DispatchQueue.main.async {
      MapboxMap.clearData { error in
        if let error = error {
          rejecter("error", error.localizedDescription, error)
        } else {
          resolver(nil)
        }
      }
    }
  }
}
