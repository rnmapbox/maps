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
                    "Street": StyleURL.streets.url.absoluteString,
                    "Outdoors": StyleURL.outdoors.url.absoluteString,
                    "Light": StyleURL.light.url.absoluteString,
                    "Dark": StyleURL.dark.url.absoluteString,
                    "Satellite": StyleURL.satellite.url.absoluteString,
                    "SatelliteStreets": StyleURL.satelliteStreets.url.absoluteString,
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
                    "RegionDidChange" : RCTMGLEvent.EventType.regionDidChange.rawValue
                ],
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
