/***
to: ios/rnmbx/RNMBXLocation.swift
userEditable: true
***/

import MapboxMaps

@objc(RNMBXLocation)
open class RNMBXLocation : RNMBXMapComponentBase {
  let changes : PropertyChanges<RNMBXLocation> = PropertyChanges()
  
  var hasOnHeadingChange: Bool = false {
    didSet { changed(.onHeadingChange) }
  }
  var onHeadingChange: RCTBubblingEventBlock?
  var onHeadingChangeSubscription: AnyCancelable?
  
  var hasOnLocationChange: Bool = false {
    didSet { changed(.onLocationChange) }
  }
  var onLocationChange: RCTBubblingEventBlock?
  var onLocationChangeSubscription: AnyCancelable?

  
  enum Property : String {
    case onHeadingChange
    case onLocationChange
    
    func apply(_ location: RNMBXLocation) -> Void {
      switch self {
      case .onHeadingChange:
        location.applyOnHeadingChange()
      case .onLocationChange:
        location.applyOnLocationChange()
      }
    }
  }
  
  func changed(_ property: Property) {
    changes.add(name: property.rawValue, update: property.apply)
  }
  
  func applyOnLocationChange() {
    self.onLocationChangeSubscription?.cancel()
    self.onLocationChangeSubscription = nil
    
    withLocation { location in
      if let locationChange = self.onLocationChange {
        self.onLocationChangeSubscription = location.onLocationChange.observe { locations in
          let event = RNMBXEvent(
            type: .locationChange,
            payload: [
              "locations": locations.map {
                [
                  "altitude": $0.altitude,
                  "longitude": $0.coordinate.longitude,
                  "latitude": $0.coordinate.latitude,
                  "horizontalAccuracy": $0.horizontalAccuracy,
                  "verticalAccuracy": $0.verticalAccuracy,
                  "source": $0.source,
                  "bearing": $0.bearing,
                  "bearingAccuracy": $0.bearingAccuracy,
                  "floor": $0.floor,
                  "speed": $0.speed,
                  "speedAccuracy": $0.speedAccuracy,
                  "extra": $0.extra,
                  "timestamp": $0.timestamp.timeIntervalSince1970
                ]
              }
            ]
          )
          self.fireEvent(event: event, callback: locationChange)
        }
      }
    }
  }
  
  func applyOnHeadingChange() {
    self.onHeadingChangeSubscription?.cancel()
    self.onHeadingChangeSubscription = nil

    withLocation { location in
      if let headingChange = self.onHeadingChange {
        self.onHeadingChangeSubscription = location.onHeadingChange.observe { heading in
          let event = RNMBXEvent(
            type: .headingChange,
            payload: [
              "direction": heading.direction,
              "accuracy": heading.accuracy,
              "timestamp": heading.timestamp.timeIntervalSince1970
            ]
          )
          self.fireEvent(event: event, callback: headingChange)
        }
      }
    }
  }
  
  private func fireEvent(event: RNMBXEvent, callback: @escaping RCTBubblingEventBlock) {
    callback(event.toJSON())
  }
  
  func withLocation(_ callback: @escaping (_ location: LocationManager) -> Void) {
    withMapView { mapView in callback(mapView.location) }
  }
  
  override public func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    changes.apply(self)
  }
}

@objc extension RNMBXLocation: RNMBXLocationProtocol {
  public func setHasOnHeadingChange(_ value: Bool) {
    self.hasOnHeadingChange = value
  }
  
  public func setHasOnLocationChange(_ value: Bool) {
    self.hasOnLocationChange = value
  }
  
  public func setOnLocationChange(_ callback: RCTBubblingEventBlock?) {
    self.onLocationChange = callback
  }
  
  public func setOnHeadingChange(_ callback: RCTBubblingEventBlock?) {
    self.onHeadingChange = callback
  }

  @objc public static func someMethod(_ view: RNMBXLocation, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    // TODO implement
  }
}
