import MapboxMaps

#if RNMBX_11
extension QueriedSourceFeature {
  var feature: Feature { return self.queriedFeature.feature }
}
#endif

@objc(RNMBXMapViewManager)
open class RNMBXMapViewManager: RCTViewManager {
    @objc
    override public static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    func defaultFrame() -> CGRect {
        return UIScreen.main.bounds
    }
  
    override open func view() -> UIView! {
        let result = RNMBXMapView(frame: self.defaultFrame(), eventDispatcher: self.bridge.eventDispatcher())
        return result
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
      view.withMapboxMap { map in
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
          view.withMapboxMap { map in
            let coordinates = map.coordinate(for: point)
            resolver(["coordinateFromView": [coordinates.longitude, coordinates.latitude]])
          }
            
    }

    @objc public static func getPointInView(
        _ view: RNMBXMapView,
        atCoordinate coordinate: [NSNumber],
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
          view.withMapboxMap { map in
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
          view.withMapboxMap { map in
              resolver(["zoom": map.cameraState.zoom])
          }
    }

    @objc public static func getVisibleBounds(
        _ view: RNMBXMapView,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
          view.withMapboxMap { map in
            resolver(["visibleBounds": map.coordinateBounds(for: view.bounds).toArray()])
          }
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
          view.withMapboxMap { map in
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
}
