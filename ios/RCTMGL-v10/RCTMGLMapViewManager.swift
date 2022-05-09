@objc(RCTMGLMapViewManager)
class RCTMGLMapViewManager: RCTViewManager {
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
    
    func defaultFrame() -> CGRect {
        return UIScreen.main.bounds
    }
    
    override func view() -> UIView! {
        let result = RCTMGLMapView(frame: self.defaultFrame())
        return result
    }

    @objc
    func takeSnap(_ reactTag: NSNumber,
                  writeToDisk: Bool,
                  resolver: @escaping RCTPromiseResolveBlock,
                  rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
      self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
        let view = viewRegistry![reactTag]
        
        guard let view = view! as? RCTMGLMapView else {
          RCTLogError("Invalid react tag, could not find RCTMGLMapView");
          return;
        }
        
        let uri = view.takeSnap(writeToDisk: writeToDisk)
        resolver(["uri": uri.absoluteString])
      }
    }
  
    @objc
    func queryTerrainElevation(_ reactTag: NSNumber,
                               coordinates: [NSNumber],
                               resolver: @escaping RCTPromiseResolveBlock,
                               rejecter: @escaping RCTPromiseRejectBlock
    ) -> Void {
      self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
        let view = viewRegistry![reactTag]
        
        guard let view = view! as? RCTMGLMapView else {
          RCTLogError("Invalid react tag, could not find RCTMGLMapView");
          rejecter("queryTerrainElevation", "Unknown find reactTag: \(reactTag)", nil)
          return;
        }
        
        let result = view.queryTerrainElevation(coordinates: coordinates)
        if let result = result {
          resolver(["data": NSNumber(value: result)])
        } else {
          resolver(nil)
        }
      }
    }
  
  @objc
  func setSourceVisibility(_ reactTag: NSNumber,
                      visible: Bool,
                      sourceId: String,
                      sourceLayerId: String?,
                      resolver: @escaping RCTPromiseResolveBlock,
                      rejecter: @escaping RCTPromiseRejectBlock) -> Void {
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      let view = viewRegistry![reactTag]
      
      guard let view = view! as? RCTMGLMapView else {
        RCTLogError("Invalid react tag, could not find RCTMGLMapView");
        rejecter("setSourceVisibility", "Unknown find reactTag: \(reactTag)", nil)
        return;
      }
      
      view.setSourceVisibility(visible, sourceId: sourceId, sourceLayerId:sourceLayerId)
      resolver(nil)
    }
  }

  @objc
  func getCenter(_ reactTag: NSNumber,
                 resolver: @escaping RCTPromiseResolveBlock,
                 rejecter: @escaping RCTPromiseRejectBlock) -> Void {
    self.bridge.uiManager.addUIBlock { (manager, viewRegistry) in
      let view = viewRegistry![reactTag]

      guard let view = view! as? RCTMGLMapView else {
        RCTLogError("Invalid react tag, could not find RCTMGLMapView");
        rejecter("getCenter", "Unknown find reactTag: \(reactTag)", nil)
        return;
      }

      guard let mapboxMap = view.mapboxMap else {
        RCTLogError("MapboxMap is not yet available");
        rejecter("getCenter", "Map not loaded yet", nil)
        return;
      }

      resolver(["center": [
        mapboxMap.cameraState.center.longitude,
        mapboxMap.cameraState.center.latitude
      ]])
    }
  }
}
