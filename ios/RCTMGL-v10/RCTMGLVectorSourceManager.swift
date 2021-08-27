@objc(RCTMGLVectorSourceManager)
class RCTMGLVectorSourceManager: RCTViewManager {
  
  @objc override func view() -> UIView {
    return RCTMGLVectorSource()
  }
}
