@_spi(Restricted) import MapboxMaps

@objc(RNMBXMapViewImpl)
open class RNMBXMapViewImpl : MapView, RNMBXMapViewImplProtocol {
  init(frame: CGRect) {
    let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
    super.init(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))
  }
  public required init (coder: NSCoder) {
      fatalError("not implemented")
  }
}

@objc(RNMBXMapViewImplFactory)
open class RNMBXMapViewImplFactory : NSObject {
  @objc
  static func create(frame: CGRect) -> RNMBXMapViewImplProtocol {
    
    return RNMBXMapViewImpl(frame: frame)
  }
}
