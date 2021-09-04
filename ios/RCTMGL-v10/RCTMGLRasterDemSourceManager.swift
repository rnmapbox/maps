@objc(RCTMGLRasterDemSourceManager)
class RCTMGLRasterDemSourceManager: RCTViewManager {
  
  @objc override func view() -> UIView {
    return RCTMGLRasterDemSource()
  }
}