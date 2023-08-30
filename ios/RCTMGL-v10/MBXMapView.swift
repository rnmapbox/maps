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
    
    public func takeSnap(_ writeToDisk: Bool, resolve: RCTPromiseResolveBlock!) {
        let uri = self.takeSnap(writeToDisk: writeToDisk)
        resolve(["uri": uri.absoluteString])
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
