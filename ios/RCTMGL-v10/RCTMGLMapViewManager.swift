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
}
