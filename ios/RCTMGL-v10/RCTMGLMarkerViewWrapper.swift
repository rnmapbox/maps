import MapboxMaps

class RCTMGLMarkerViewWrapper : UIView {
  var anchorX : CGFloat? = nil
  var anchorY : CGFloat? = nil
  var reactSetFrameExectured = false
  var afterSizedCallback: (() -> Void)? = nil

  override func reactSetFrame(_ frame: CGRect) {
    reactSetFrameExectured = true
    let oldFrame = self.frame
    let newSize = frame.size
    let oldSize = oldFrame.size

    if let anchorX = anchorX, let anchorY = anchorY {
      let oldCenter = CGPoint(x: oldFrame.origin.x + oldSize.width * anchorX,
                              y: oldFrame.origin.y + oldSize.height * anchorY)

      let newFrame = CGRect(origin: CGPoint(x: oldCenter.x-anchorX * newSize.width,y: oldCenter.y-anchorY * newSize.height), size: newSize)
      super.reactSetFrame(frame)
      self.frame = newFrame
    } else {
      super.reactSetFrame(frame)
      let newFrame = CGRect(origin: oldFrame.origin, size: newSize)
      self.frame = newFrame
    }
    if let afterSizedCallback = afterSizedCallback {
      afterSizedCallback()
      self.afterSizedCallback = nil
    }
  }

  func afterSized(callback: @escaping () -> Void) {
    if reactSetFrameExectured {
      callback()
    } else {
      afterSizedCallback = callback
    }
  }
}
