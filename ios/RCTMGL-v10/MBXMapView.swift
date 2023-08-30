import MapboxMaps

@objc(MBXMapView)
open class MBXMapView : RCTMGLMapView, MBXMapViewProtocol {
  required public init(frame: CGRect, eventDispatcher: RCTEventDispatcherProtocol) {
    super.init(frame: frame, eventDispatcher: eventDispatcher)
  }
    
    public required init(coder: NSCoder) {
        super .init(coder: coder)
    }
    
  public func setAttributionEnabled(_ enabled: Bool) {
      self.setReactAttributionEnabled(enabled)
  }
    
  public func setAttributionPosition(_ position: [String : NSNumber]!) {
    self.setReactAttributionPosition(position)
  }
    
    public func setLogoEnabled(_ enabled: Bool) {
        self.setReactLogoEnabled(enabled)
    }
      
    public func setLogoPosition(_ position: [String : NSNumber]!) {
      self.setReactLogoPosition(position)
    }
    
    public func setCompassEnabled(_ enabled: Bool) {
        self.setReactCompassEnabled(enabled)
    }
    
    public func setCompassFadeWhenNorth(_ enabled: Bool) {
        self.setReactCompassFadeWhenNorth(enabled)
    }
    
    public func setCompassPosition(_ position: [String : NSNumber]!) {
      self.setReactCompassPosition(position)
    }
    
    public func setCompassViewPosition(_ position: NSInteger) {
      self.setReactCompassViewPosition(position)
    }
    
    public func setCompassViewMargins(_ margins: CGPoint) {
      self.setReactCompassViewMargins(margins)
    }
    
    public func setCompassImage(_ position: String) {
      self.setReactCompassImage(position)
    }
    
    public func setScaleBarEnabled(_ enabled: Bool) {
        self.setReactScaleBarEnabled(enabled)
    }
      
    public func setScaleBarPosition(_ position: [String : NSNumber]!) {
      self.setReactScaleBarPosition(position)
    }
    
    public func setZoomEnabled(_ enabled: Bool) {
        self.setReactZoomEnabled(enabled)
    }
      
    public func setRotateEnabled(_ enabled: Bool) {
        self.setReactRotateEnabled(enabled)
    }
    
    public func setScrollEnabled(_ enabled: Bool) {
        self.setReactScrollEnabled(enabled)
    }
    
    public func setPitchEnabled(_ enabled: Bool) {
        self.setReactPitchEnabled(enabled)
    }
    
    public func setProjection(_ projection: String) {
      self.setReactProjection(projection)
    }
    
    public func setLocalizeLabels(_ labels: [AnyHashable : Any]) {
      self.setReactLocalizeLabels(labels as NSDictionary)
    }
    
    public func setStyleUrl(_ url: String) {
        self.setReactStyleURL(url)
    }
    
    public func setOnPress(_ callback: @escaping RCTBubblingEventBlock) {
        self.setReactOnPress(callback)
    }
    
    public func setOnLongPress(_ callback: @escaping RCTBubblingEventBlock) {
        self.setReactOnLongPress(callback)
    }
    
    public func setOnMapChange(_ callback: @escaping RCTBubblingEventBlock) {
        self.setReactOnMapChange(callback)
    }
    
    
    private func withMapboxMap(
        name: String,
        rejecter: @escaping RCTPromiseRejectBlock,
        fn: @escaping (_: MapboxMap) -> Void) -> Void
    {
        guard let mapboxMap = self.mapboxMap else {
          RCTMGLLogError("MapboxMap is not yet available");
          rejecter(name, "Map not loaded yet", nil)
          return;
        }
        
        fn(mapboxMap)
    }
    
    public func takeSnap(_ writeToDisk: Bool, resolve: RCTPromiseResolveBlock!) {
        MBXMapViewManager.takeSnap(self, writeToDisk: writeToDisk, resolver: resolve)
    }
    
    public func clearData(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
        MBXMapViewManager.clearData(self, resolver: resolve, rejecter: reject)
    }
    
    public func getCenter(_ resolve: RCTPromiseResolveBlock!, reject: RCTPromiseRejectBlock!) {
        withMapboxMap(name: "getCenter", rejecter: reject) { map in
            MBXMapViewManager.getCenter(map, resolver: resolve)
        }
    }
    
    public func getCoordinateFromView(_ point: CGPoint, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        withMapboxMap(name: "getCoordinateFromView", rejecter: reject) { map in
            MBXMapViewManager.getCoordinateFromView(map, atPoint: point, resolver: resolve)
        }
    }
    
    public func getPointInView(_ coordinate: [NSNumber], resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        withMapboxMap(name: "getPointInView", rejecter: reject) { map in
            MBXMapViewManager.getPointInView(map, atCoordinate: coordinate, resolver: resolve)
        }
    }
    
    public func getVisibleBounds(_ resolve: RCTPromiseResolveBlock!) {
        MBXMapViewManager.getVisibleBounds(self, resolver: resolve)
    }
    
    public func getZoom(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
        withMapboxMap(name: "getZoom", rejecter: reject) { map in
            MBXMapViewManager.getZoom(map, resolver: resolve)
        }
    }
    
    public func queryRenderedFeatures(
        atPoint point: [NSNumber],
        withFilter filter: [Any]?,
        withLayerIDs layerIDs: [String]?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) {
        withMapboxMap(name: "queryRenderedFeaturesAtPoint", rejecter: reject) { map in
            MBXMapViewManager.queryRenderedFeaturesAtPoint(map, atPoint: point, withFilter: filter, withLayerIDs: layerIDs, resolver: resolve, rejecter: reject)
        }
    }
    
    public func queryRenderedFeatures(
        inRect bbox: [NSNumber],
        withFilter filter: [Any]?,
        withLayerIDs layerIDs: [String]?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) {
          MBXMapViewManager.queryRenderedFeaturesInRect(self, withBBox: bbox, withFilter: filter, withLayerIDs: layerIDs, resolver: resolve, rejecter: reject)
    }
    
    public func queryTerrainElevation(
        _ coordinates: [NSNumber],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock
    ) {
        MBXMapViewManager.queryTerrainElevation(self, coordinates: coordinates, resolver: resolve, rejecter: reject)
    }
    
    public func setHandledMapChangedEvents(
        _ events: [String],
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) {
          MBXMapViewManager.setHandledMapChangedEvents(self, events: events, resolver: resolve, rejecter: reject)
    }
    
    public func setSourceVisibility(
        _ visible: Bool,
        sourceId: String,
        sourceLayerId: String?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) {
          MBXMapViewManager.setSourceVisibility(self, visible: visible, sourceId: sourceId, sourceLayerId: sourceLayerId, resolver: resolve, rejecter: reject)
    }

      func querySourceFeatures(
        _ reactTag: NSNumber,
        withSourceId sourceId: String,
        withFilter filter: [Any]?,
        withSourceLayerIds sourceLayerIds: [String]?,
        resolve: @escaping RCTPromiseResolveBlock,
        reject: @escaping RCTPromiseRejectBlock) -> Void {
          MBXMapViewManager.querySourceFeatures(self, withSourceId: sourceId, withFilter: filter, withSourceLayerIds: sourceLayerIds, resolver: resolve, rejecter: reject)
    }
}

@objc(MBXMapViewFactory)
open class MBXMapViewFactory : NSObject {
  @objc
  static func create(frame: CGRect, eventDispatcher: RCTEventDispatcherProtocol) -> MBXMapViewProtocol {
      let view = MBXMapView(frame: frame, eventDispatcher: eventDispatcher)
      
      // just need to pass something, it won't really be used on fabric, but it's used to create events (it won't impact sending them)
      view.reactTag = -1;
      
      return view
  }
}
