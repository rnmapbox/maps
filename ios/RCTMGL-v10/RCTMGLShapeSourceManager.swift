@objc(RCTMGLShapeSourceManager)
class RCTMGLShapeSourceManager: RCTViewManager {
  
  @objc override func view() -> UIView {
    return RCTMGLShapeSource()
  }
}
