import MapboxMaps

class RCTMGLImage : UIView {
  @objc
  var name: String = ""

  var image: UIImage? = nil
  
  var sdf: Bool? = nil
  var stretchX: [[NSNumber]] = []
  var stretchY: [[NSNumber]] = []

  weak var images: RCTMGLImageSetter? = nil {
    didSet {
      DispatchQueue.main.async { self.setImage() }
    }
  }
  weak var bridge : RCTBridge! = nil
  
  var reactSubviews : [UIView] = []
  
  // MARK: - subview management
  
  @objc open override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    reactSubviews.insert(subview, at: atIndex)
    if reactSubviews.count > 1 {
      Logger.log(level: .error, message: "Image supports max 1 subview")
    }
    if image == nil {
      DispatchQueue.main.asyncAfter(deadline: .now() + .microseconds(10)) {
        self.setImage()
      }
    }
  }

  @objc
  open override func removeReactSubview(_ subview: UIView!) {
    reactSubviews.removeAll(where: { $0 == subview })
  }
  
  // MARK: - view shnapshot
  
  func changeImage(_ image: UIImage, name: String) {
    if let images = images {
      let _ = images.addImage(name: name, image: image, sdf: sdf, stretchX:stretchX, stretchY:stretchY, log: "RCTMGLImage.addImage")
    }
  }
  
  func setImage() {
    if let image = _createViewSnapshot() {
      changeImage(image, name: name)
    }
  }

  func _createViewSnapshot() -> UIImage? {
    let useDummyImage = false
    if useDummyImage {
      let size = CGSize(width: 32, height: 32)
      let renderer = UIGraphicsImageRenderer(size: size)
      let image = renderer.image { context in
        UIColor.darkGray.setStroke()
          context.stroke(CGRect(x: 0, y:0, width: 32, height: 32))
          UIColor(red: 158/255, green: 215/255, blue: 245/255, alpha: 1).setFill()
          context.fill(CGRect(x: 2, y: 2, width: 30, height: 30))
      }
      return image
    }
    guard reactSubviews.count > 0 else {
      return nil
    }
    return _createViewSnapshot(view: reactSubviews[0])
  }
   
  func _createViewSnapshot(view: UIView) -> UIImage? {
    guard view.bounds.size.width > 0 && view.bounds.size.height > 0 else {
      return nil
    }
    
    let roundUp = 4
    
    let adjustedSize = CGSize(
      width: ((Int(view.bounds.size.width)+roundUp-1)/roundUp)*roundUp,
      height: ((Int(view.bounds.size.height)+roundUp-1)/roundUp)*roundUp
    )
    
    let renderer = UIGraphicsImageRenderer(size: adjustedSize)
    let image = renderer.image { context in
      view.layer.render(in: context.cgContext)
    }
    return image
  }
}

