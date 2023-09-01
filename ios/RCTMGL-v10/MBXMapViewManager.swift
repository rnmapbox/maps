import MapboxMaps

@objc(MBXMapViewManager)
class MBXMapViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
  
    func defaultFrame() -> CGRect {
        return UIScreen.main.bounds
    }
  
    override func view() -> UIView! {
        let result = MBXMapView(frame: self.defaultFrame(), eventDispatcher: self.bridge.eventDispatcher())
        return result
    }
}

// MARK: helpers

extension MBXMapViewManager {
    func withMapView(
        _ reactTag: NSNumber,
        name: String,
        rejecter: @escaping RCTPromiseRejectBlock,
        fn: @escaping (_: RCTMGLMapView) -> Void) -> Void
    {
      self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
        let view = viewRegistry![reactTag]

        guard let view = view, let view = view as? RCTMGLMapView else {
          RCTMGLLogError("Invalid react tag, could not find RCTMGLMapView");
          rejecter(name, "Unknown find reactTag: \(reactTag)", nil)
          return;
        }
        
        fn(view)
      }
    }

    func withMapboxMap(
        _ reactTag: NSNumber,
        name: String,
        rejecter: @escaping RCTPromiseRejectBlock,
        fn: @escaping (_: MapboxMap) -> Void) -> Void
    {
      withMapView(reactTag, name: name, rejecter: rejecter) { view in
        guard let mapboxMap = view.mapboxMap else {
          RCTMGLLogError("MapboxMap is not yet available");
          rejecter(name, "Map not loaded yet", nil)
          return;
        }
        
        fn(mapboxMap)
      }
    }
}

// MARK: - react methods

extension MBXMapViewManager {
    static func takeSnap(_ view: RCTMGLMapView,
                         writeToDisk: Bool,
                         resolver: @escaping RCTPromiseResolveBlock) {
        let uri = view.takeSnap(writeToDisk: writeToDisk)
        resolver(["uri": uri.absoluteString])
    }
    
    @objc
    func takeSnap(_ reactTag: NSNumber,
                  writeToDisk: Bool,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
      withMapView(reactTag, name:"takeSnap", rejecter: rejecter) { view in
          MBXMapViewManager.takeSnap(view, writeToDisk: writeToDisk, resolver: resolver)
      }
    }
  
    static func queryTerrainElevation(_ view: RCTMGLMapView,
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
    
    @objc
    func queryTerrainElevation(_ reactTag: NSNumber,
                               coordinates: [NSNumber],
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
      withMapView(reactTag, name:"queryTerrainElevation", rejecter: rejecter) { view in
          MBXMapViewManager.queryTerrainElevation(view, coordinates: coordinates, resolver: resolver, rejecter: rejecter)
      }
    }
    
    static func setSourceVisibility(_ view: RCTMGLMapView,
                                      visible: Bool,
                                      sourceId: String,
                                      sourceLayerId: String?,
                                      resolver: @escaping RCTPromiseResolveBlock,
                                      rejecter: @escaping RCTPromiseRejectBlock) -> Void {
          view.setSourceVisibility(visible, sourceId: sourceId, sourceLayerId:sourceLayerId)
          resolver(nil)
    }
  
  @objc
  func setSourceVisibility(_ reactTag: NSNumber,
                      visible: Bool,
                      sourceId: String,
                      sourceLayerId: String?,
                      resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) -> Void {
    withMapView(reactTag, name:"setSourceVisibility", rejecter: rejecter) { view in
        MBXMapViewManager.setSourceVisibility(view, visible: visible, sourceId: sourceId, sourceLayerId: sourceLayerId, resolver: resolver, rejecter: rejecter)
    }
  }

    static func getCenter(_ map: MapboxMap, resolver: @escaping RCTPromiseResolveBlock) {
        resolver(["center": [
            map.cameraState.center.longitude,
            map.cameraState.center.latitude
        ]])
    }
    
  @objc
  func getCenter(_ reactTag: NSNumber,
                 resolver: @escaping RCTPromiseResolveBlock,
                 rejecter: @escaping RCTPromiseRejectBlock) -> Void {
    withMapboxMap(reactTag, name:"getCenter", rejecter: rejecter) { mapboxMap in
        MBXMapViewManager.getCenter(mapboxMap, resolver: resolver)
    }
  }
    
    static func getCoordinateFromView(
        _ map: MapboxMap,
        atPoint point: CGPoint,
        resolver: @escaping RCTPromiseResolveBlock) {
            let coordinates = map.coordinate(for: point)
            resolver(["coordinateFromView": [coordinates.longitude, coordinates.latitude]])
    }

  @objc
  func getCoordinateFromView(
    _ reactTag: NSNumber,
    atPoint point: CGPoint,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
      withMapboxMap(reactTag, name:"getCoordinateFromView", rejecter: rejecter) { mapboxMap in
          MBXMapViewManager.getCoordinateFromView(mapboxMap, atPoint: point, resolver: resolver)
      }
  }
    
    static func getPointInView(
        _ map: MapboxMap,
        atCoordinate coordinate: [NSNumber],
        resolver: @escaping RCTPromiseResolveBlock) {
            let coordinate = CLLocationCoordinate2DMake(coordinate[1].doubleValue, coordinate[0].doubleValue)
            let point = map.point(for: coordinate)
            resolver(["pointInView": [(point.x), (point.y)]])
      }

  @objc
  func getPointInView(
    _ reactTag: NSNumber,
    atCoordinate coordinate: [NSNumber],
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
      withMapboxMap(reactTag, name:"getPointInView", rejecter: rejecter) { mapboxMap in
          MBXMapViewManager.getPointInView(mapboxMap, atCoordinate: coordinate, resolver: resolver)
      }
  }

    static func setHandledMapChangedEvents(
        _ view: RCTMGLMapView,
        events: [String],
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) {
          view.handleMapChangedEvents = Set(events.compactMap {
            RCTMGLEvent.EventType(rawValue: $0)
          })
          resolver(nil);
      }
    
  @objc
  func setHandledMapChangedEvents(
    _ reactTag: NSNumber,
    events: [String],
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
    withMapView(reactTag, name:"setHandledMapChangedEvents", rejecter: rejecter) { mapView in
        MBXMapViewManager.setHandledMapChangedEvents(mapView, events: events, resolver: resolver, rejecter: rejecter)
    }
  }
    
    static func getZoom(
        _ map: MapboxMap,
        resolver: @escaping RCTPromiseResolveBlock) {
            resolver(["zoom": map.cameraState.zoom])
    }

  @objc
  func getZoom(
    _ reactTag: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
      withMapboxMap(reactTag, name:"getZoom", rejecter: rejecter) { mapboxMap in
          MBXMapViewManager.getZoom(mapboxMap, resolver: resolver)
      }
  }

    static func getVisibleBounds(
        _ view: RCTMGLMapView,
        resolver: @escaping RCTPromiseResolveBlock) {
            resolver(["visibleBounds":  view.mapboxMap.coordinateBounds(for: view.bounds).toArray()])
    }
    
  @objc
  func getVisibleBounds(
    _ reactTag: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) {
      withMapView(reactTag, name:"getVisibleBounds", rejecter: rejecter) { mapView in
          MBXMapViewManager.getVisibleBounds(mapView, resolver: resolver)
      }
  }
}

// MARK: - queryRenderedFeatures

extension MBXMapViewManager {
    static func queryRenderedFeaturesAtPoint(
        _ map: MapboxMap,
        atPoint point: [NSNumber],
        withFilter filter: [Any]?,
        withLayerIDs layerIDs: [String]?,
        resolver: @escaping RCTPromiseResolveBlock,
        rejecter: @escaping RCTPromiseRejectBlock) -> Void {
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
    
  @objc
  func queryRenderedFeaturesAtPoint(
    _ reactTag: NSNumber,
    atPoint point: [NSNumber],
    withFilter filter: [Any]?,
    withLayerIDs layerIDs: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      withMapboxMap(reactTag, name:"queryRenderedFeaturesAtPoint", rejecter: rejecter) { mapboxMap in
          MBXMapViewManager.queryRenderedFeaturesAtPoint(mapboxMap, atPoint: point, withFilter: filter, withLayerIDs: layerIDs, resolver: resolver, rejecter: rejecter)
      }
  }

    static func queryRenderedFeaturesInRect(
        _ map: RCTMGLMapView,
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
    
  @objc
  func queryRenderedFeaturesInRect(
    _ reactTag: NSNumber,
    withBBox bbox: [NSNumber],
    withFilter filter: [Any]?,
    withLayerIDs layerIDs: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      withMapView(reactTag, name:"queryRenderedFeaturesInRect", rejecter: rejecter) { mapView in
          MBXMapViewManager.queryRenderedFeaturesInRect(mapView, withBBox: bbox, withFilter: filter, withLayerIDs: layerIDs, resolver: resolver, rejecter: rejecter)
      }
   }

  static func querySourceFeatures(
    _ map: RCTMGLMapView,
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

  @objc
  func querySourceFeatures(
    _ reactTag: NSNumber,
    withSourceId sourceId: String,
    withFilter filter: [Any]?,
    withSourceLayerIds sourceLayerIds: [String]?,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock) -> Void {
      withMapView(reactTag, name:"querySourceFeatures", rejecter: rejecter) { mapView in
        MBXMapViewManager.querySourceFeatures(mapView, withSourceId: sourceId, withFilter: filter, withSourceLayerIds: sourceLayerIds, resolver: resolver, rejecter: rejecter)
      }
    }

  
    static func clearData(
        _ view: RCTMGLMapView,
        resolver:@escaping RCTPromiseResolveBlock,
        rejecter:@escaping RCTPromiseRejectBlock
    ) {
        view.mapboxMap.clearData { error in
          if let error = error {
            rejecter("clearData","failed to clearData: \(error.localizedDescription)", error)
          } else {
            resolver(nil)
          }
        }
    }
    
  @objc
  func clearData(
    _ reactTag: NSNumber,
    resolver: @escaping RCTPromiseResolveBlock,
    rejecter: @escaping RCTPromiseRejectBlock
  ) {
    withMapView(reactTag, name:"clearDataPath", rejecter: rejecter) { mapView in
        MBXMapViewManager.clearData(mapView, resolver: resolver, rejecter: rejecter)
    }
  }
}
