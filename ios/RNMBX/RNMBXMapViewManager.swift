import MapboxMaps

#if RNMBX_11
extension QueriedSourceFeature {
  var feature: Feature { return self.queriedFeature.feature }
}
#endif

@objc(RNMBXMapViewManager)
public class RNMBXMapViewManager: RCTViewManager {
    @objc
    override public static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    func defaultFrame() -> CGRect {
        return UIScreen.main.bounds
    }
  
    override public func view() -> UIView! {
        let result = RNMBXMapView(frame: self.defaultFrame(), eventDispatcher: self.bridge.eventDispatcher())
        return result
    }
    
    static var customLocationProvider: CustomLocationProvider? = nil
    static var customHeadingProvider: CustomHeadingProvider? = nil

    @objc public static func setCustomLocation(
        _ map: RNMBXMapView,
        latitude: NSNumber,
        longitude: NSNumber,
        heading: NSNumber,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock

    ) -> Void {
        if (customLocationProvider == nil && customHeadingProvider == nil) {
            customLocationProvider = CustomLocationProvider()
            customHeadingProvider = CustomHeadingProvider()
            map.mapView.location.override(locationProvider: customLocationProvider!, headingProvider: customHeadingProvider)
        }
        
        customLocationProvider?.setLocation(latitude: latitude, longitude: longitude, heading: heading)
        customHeadingProvider?.setHeading(heading: heading)
        
        resolver(nil)
    }
    
    @objc public static func removeCustomLocationProvider(
        _ map: RNMBXMapView,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
        map.mapView.location.override(locationProvider: AppleLocationProvider())
        customLocationProvider = nil
        customHeadingProvider = nil
        
        resolver(nil)
    }
}

// MARK: helpers

extension RNMBXMapViewManager {
    static func withMapboxMap(
        _ view: RNMBXMapView,
        name: String,
        rejecter: @escaping RCTPromiseRejectBlock,
        fn: @escaping (_: MapboxMap) -> Void) -> Void
    {
        guard let mapboxMap = view.mapboxMap else {
          RNMBXLogError("MapboxMap is not yet available");
          rejecter(name, "Map not loaded yet", nil)
          return;
        }
        
        fn(mapboxMap)
    }
}

// MARK: - react methods

extension RNMBXMapViewManager {
    @objc public static func takeSnap(_ view: RNMBXMapView,
                         writeToDisk: Bool,
                         resolver: @escaping RCTPromiseResolveBlock) {
        let uri = view.takeSnap(writeToDisk: writeToDisk)
        resolver(["uri": uri.absoluteString])
    }
  
    @objc public static func queryTerrainElevation(_ view: RNMBXMapView,
                                  coordinates: [NSNumber],
                                  resolver: @escaping RCTPromiseResolveBlock,
                                  rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
       let result = view.queryTerrainElevation(coordinates: coordinates)
       if let result = result {
         resolver(["data": NSNumber(value: result)])
       } else {
         resolver(nil)
       }
    }

    @objc public static func setSourceVisibility(_ view: RNMBXMapView,
                                      visible: Bool,
                                      sourceId: String,
                                      sourceLayerId: String?,
                                      resolver: @escaping RCTPromiseResolveBlock,
                                      rejecter: @escaping RCTPromiseRejectBlock) -> Void {
          view.setSourceVisibility(visible, sourceId: sourceId, sourceLayerId:sourceLayerId)
          resolver(nil)
    }
    
    @objc public static func getCenter(_ view: RNMBXMapView, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
        withMapboxMap(view, name: "getCenter", rejecter:rejecter) { map in
            resolver(["center": [
                map.cameraState.center.longitude,
                map.cameraState.center.latitude
            ]])
        }
    }

    @objc public static func getCoordinateFromView(
        _ view: RNMBXMapView,
        atPoint point: CGPoint,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
            withMapboxMap(view, name: "getCoordinateFromView", rejecter:rejecter) { map in
                let coordinates = map.coordinate(for: point)
                resolver(["coordinateFromView": [coordinates.longitude, coordinates.latitude]])
            }
            
    }

    @objc public static func getPointInView(
        _ view: RNMBXMapView,
        atCoordinate coordinate: [NSNumber],
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
            withMapboxMap(view, name: "getPointInView", rejecter:rejecter) { map in
                let coordinate = CLLocationCoordinate2DMake(coordinate[1].doubleValue, coordinate[0].doubleValue)
                let point = map.point(for: coordinate)
                resolver(["pointInView": [(point.x), (point.y)]])
            }
            
      }

    @objc public static func setHandledMapChangedEvents(
        _ view: RNMBXMapView,
        events: [String],
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
          view.handleMapChangedEvents = Set(events.compactMap {
            RNMBXEvent.EventType(rawValue: $0)
          })
          resolver(nil);
      }

    @objc public static func getZoom(
        _ view: RNMBXMapView,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
            withMapboxMap(view, name: "getZoom", rejecter:rejecter) { map in
                resolver(["zoom": map.cameraState.zoom])
            }
            
    }

    @objc public static func getVisibleBounds(
        _ view: RNMBXMapView,
        resolver: @escaping RCTPromiseResolveBlock) {
            resolver(["visibleBounds":  view.mapboxMap.coordinateBounds(for: view.bounds).toArray()])
    }

}

// MARK: - queryRenderedFeatures

extension RNMBXMapViewManager {
    @objc public static func queryRenderedFeaturesAtPoint(
        _ view: RNMBXMapView,
        atPoint point: [NSNumber],
        withFilter filter: [Any]?,
        withLayerIDs layerIDs: [String]?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) -> Void {
            withMapboxMap(view, name: "queryRenderedFeaturesAtPoint", rejecter:rejecter) { map in
                let point = CGPoint(x: CGFloat(point[0].floatValue), y: CGFloat(point[1].floatValue))

                logged("queryRenderedFeaturesAtPoint.option", rejecter: rejecter) {
                  let options = try RenderedQueryOptions(layerIds: (layerIDs ?? []).isEmpty ? nil : layerIDs, filter: filter?.asExpression())
                  
                  map.queryRenderedFeatures(with: point, options: options) { result in
                    switch result {
                    case .success(let features):
                      resolver([
                        "data": ["type": "FeatureCollection", "features": features.compactMap { queriedFeature in
                          logged("queryRenderedFeaturesAtPoint.feature.toJSON") { try queriedFeature.feature.toJSON() }
                        }]
                      ])
                    case .failure(let error):
                      rejecter("queryRenderedFeaturesAtPoint","failed to query features", error)
                    }
                  }
                }
            }
        
      }

    @objc public static func queryRenderedFeaturesInRect(
        _ map: RNMBXMapView,
        withBBox bbox: [NSNumber],
        withFilter filter: [Any]?,
        withLayerIDs layerIDs: [String]?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) -> Void {
            let top = bbox.isEmpty ? 0.0 : CGFloat(bbox[0].floatValue)
            let right = bbox.isEmpty ? 0.0 : CGFloat(bbox[1].floatValue)
            let bottom = bbox.isEmpty ? 0.0 : CGFloat(bbox[2].floatValue)
            let left = bbox.isEmpty ? 0.0 : CGFloat(bbox[3].floatValue)
            let rect = bbox.isEmpty ? CGRect(x: 0.0, y: 0.0, width: map.bounds.size.width, height: map.bounds.size.height) : CGRect(x: [left,right].min()!, y: [top,bottom].min()!, width: abs(right-left), height: abs(bottom-top))
            logged("queryRenderedFeaturesInRect.option", rejecter: rejecter) {
              let options = try RenderedQueryOptions(layerIds: layerIDs?.isEmpty ?? true ? nil : layerIDs, filter: filter?.asExpression())
              map.mapboxMap.queryRenderedFeatures(with: rect, options: options) { result in
                switch result {
                case .success(let features):
                  resolver([
                    "data": ["type": "FeatureCollection", "features": features.compactMap { queriedFeature in
                      logged("queryRenderedFeaturesInRect.queriedfeature.map") { try queriedFeature.feature.toJSON() }
                    }]
                  ])
                case .failure(let error):
                  rejecter("queryRenderedFeaturesInRect","failed to query features", error)
                }
              }
            }
        }

    @objc public static func querySourceFeatures(
    _ map: RNMBXMapView,
    withSourceId sourceId: String,
    withFilter filter: [Any]?,
    withSourceLayerIds sourceLayerIds: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      let sourceLayerIds = sourceLayerIds?.isEmpty ?? true ? nil : sourceLayerIds
      logged("querySourceFeatures.option", rejecter: rejecter) {
        let options = SourceQueryOptions(sourceLayerIds: sourceLayerIds, filter: filter ?? Exp(arguments: []))
        map.mapboxMap.querySourceFeatures(for: sourceId, options: options) { result in
          switch result {
          case .success(let features):
            resolver([
              "data": ["type": "FeatureCollection", "features": features.compactMap { queriedFeature in
                logged("querySourceFeatures.queriedfeature.map") { try queriedFeature.feature.toJSON() }
              }] as [String : Any]
            ])
          case .failure(let error):
            rejecter("querySourceFeatures", "failed to query source features: \(error.localizedDescription)", error)
          }
        }
      }
    }

    static func clearData(_ view: RNMBXMapView, completion: @escaping (Error?) -> Void) {
      #if RNMBX_11
      MapboxMap.clearData(completion: completion)
      #else
      view.mapboxMap.clearData(completion: completion)
      #endif
    }
  
    @objc public static func clearData(
        _ mapView: RNMBXMapView,
        resolver:@escaping RCTPromiseResolveBlock,
        rejecter:@escaping RCTPromiseRejectBlock
    ) {
        self.clearData(mapView) { error in
          if let error = error {
            rejecter("clearData","failed to clearData: \(error.localizedDescription)", error)
          } else {
            resolver(nil)
          }
        }
    }
    
    final class CustomHeadingProvider: HeadingProvider {
        var latestHeading: Heading?
        private let observers: NSHashTable<AnyObject> = .weakObjects()
        
        func add(headingObserver: HeadingObserver) {
            observers.add(headingObserver)
        }
        
        func remove(headingObserver: HeadingObserver) {
            observers.remove(headingObserver)
        }
        
        func setHeading(heading: NSNumber) {
            let latestHeading = Heading(direction: CLLocationDirection(truncating: heading), accuracy: CLLocationDirection(truncating: 1))
            self.latestHeading = latestHeading
            for observer in observers.allObjects {
                (observer as? HeadingObserver)?.onHeadingUpdate(latestHeading)
            }
        }
    }
    
    final class CustomLocationProvider: LocationProvider {
        private var observers: NSHashTable<AnyObject> = .weakObjects()
        private var location: Location? = nil
        
        func addLocationObserver(for observer: LocationObserver) {
            observers.add(observer)
        }
        
        func removeLocationObserver(for observer: LocationObserver) {
            observers.remove(observer)
        }
        
        func getLastObservedLocation() -> Location? {
            return location
        }
        
        func setLocation(latitude: NSNumber, longitude: NSNumber, heading: NSNumber) {
            let lat = CLLocationDegrees(truncating: latitude)
            let lon = CLLocationDegrees(truncating: longitude)
            self.location = Location(clLocation: CLLocation(latitude: lat, longitude: lon))
            for observer in observers.allObjects {
                (observer as? LocationObserver)?.onLocationUpdateReceived(for: [self.location!])
            }
        }
    }
}
