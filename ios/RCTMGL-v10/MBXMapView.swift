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
}

@objc(MBXMapViewFactory)
open class MBXMapViewFactory : NSObject {
  @objc
  static func create(frame: CGRect, eventDispatcher: RCTEventDispatcherProtocol) -> MBXMapViewProtocol {
    return MBXMapView(frame: frame, eventDispatcher: eventDispatcher)
  }
}
