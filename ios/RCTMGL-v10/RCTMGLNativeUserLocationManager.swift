@objc(RCTMGLNativeUserLocationManager)
class RCTMGLNativeUserLocationManager : RCTViewManager {
  @objc override func view() -> UIView {
    return RCTMGLNativeUserLocation()
  }
}
