import MapboxMaps

protocol RCTMGLImageSetter : AnyObject {
  func addImage(name: String, image: UIImage, sdf: Bool?, stretchX: [[NSNumber]], stretchY: [[NSNumber]], content: [NSNumber]?, log: String) -> Bool
}

class RCTMGLImages : UIView, RCTMGLMapComponent {
  
  weak var bridge : RCTBridge! = nil
  
  weak var style: Style? = nil

  @objc
  var onImageMissing: RCTBubblingEventBlock? = nil
  
  @objc
  var images : [String:Any] = [:] {
    didSet {
      updateImages(images: images, oldImages: oldValue)
    }
  }
    
  var loadedImages : Set<String> = []
  
  var imageViews: [RCTMGLImage] = []

  @objc
  var nativeImages: [Any] = [] {
    didSet {
      nativeImageInfos = nativeImages.compactMap { decodeImage($0) }
    }
  }

  typealias NativeImageInfo = (name:String, sdf: Bool, stretchX:[(from:Float, to:Float)], stretchY:[(from:Float, to:Float)], content: (left:Float,top:Float,right:Float,bottom:Float)? );
  var nativeImageInfos: [NativeImageInfo] = []
  
  @objc open override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let image = subview as? RCTMGLImage {
      imageViews.insert(image, at: atIndex)
    } else {
      Logger.log(level:.warn, message: "RCTMGLImages children can only be RCTMGLImage, got \(optional: subview)")
    }
    super.insertReactSubview(subview, at: atIndex)
  }
  
  @objc open override func removeReactSubview(_ subview: UIView!) {
    if let image = subview as? RCTMGLImage {
      imageViews.removeAll { $0 == image }
      image.images = nil
    }
    super.removeReactSubview(subview)
  }
  
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return false
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.style = style
    map.images.append(self)
    
    self.addNativeImages(style: style, nativeImages: nativeImageInfos)
    self.addImages(style: style, images: images, oldImages: [:])
    self.addImageViews(style: style, imageViews: imageViews)
  }
  
  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    self.style = nil
    // v10todo
    return true
  }
  
  func sameImage(oldValue: Any?, newValue: Any?) -> Bool {
    if let oldS = oldValue as? String, let newS = newValue as? String {
      return oldS == newS
    } else {
      return false
    }
  }

  func updateImages(images: [String:Any], oldImages: [String:Any]) {
    if let style = self.style {
      addImages(style: style, images: images, oldImages: oldImages)
    }
  }

  func addImages(style: Style, images: [String: Any], oldImages: [String:Any]) {
    var missingImages : [String:Any] = [:]
    
    // Add image placeholder for images that are not yet available in the style. This way
    // we can load the images asynchronously and add the ShapeSource to the map without delay.
    // The same is required when this ShapeSource is updated with new/added images and the
    // data references them. In which case addMissingImageToStyle will take care of loading
    // them in a similar way.
    //
    // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
    
    for name in images.keys {
      let newImage = oldImages[name] == nil
      if oldImages[name] == nil || loadedImages.contains(name) || !sameImage(oldValue: oldImages[name], newValue: images[name]) {
        let addPlaceholder = oldImages[name] == nil
        if !sameImage(oldValue: oldImages[name], newValue: images[name]) {
          missingImages[name] = images[name]
        } else {
          if style.styleManager.getStyleImage(forImageId: name) == nil {
            logged("RCTMGLImages.addImagePlaceholder") {
              try? style.addImage(placeholderImage, id: name, stretchX: [], stretchY: [])
              missingImages[name] = images[name]
            }
          }
        }
      }
    }
    
    if missingImages.count > 0 {
      RCTMGLUtils.fetchImages(bridge, style: style, objects: missingImages, forceUpdate: true, loaded: { name in self.loadedImages.insert(name) } ,callback: { })
    }
  }
  
  private func addImageViews(style: Style, imageViews: [RCTMGLImage]) {
    imageViews.forEach { imageView in
      imageView.images = self
    }
  }
  
  public func addMissingImageToStyle(style: Style, imageName: String) -> Bool {
    if let nativeImage = nativeImageInfos.first(where: { $0.name == imageName }) {
      addNativeImages(style: style, nativeImages: [nativeImage])
      return true
    }
    
    if let image = images[imageName] {
      addImages(style: style, images: [imageName: image], oldImages: [:])
      return true
    }
    return false
  }
  
  public func sendImageMissingEvent(imageName: String, payload: StyleImageMissingPayload) {
    let payload = ["imageKey":imageName]
    let event = RCTMGLEvent(type: .imageMissing, payload: payload)
    if let onImageMissing = onImageMissing {
      onImageMissing(event.toJSON())
    }
  }
  
  static func convert(stretch: [[NSNumber]], scale: CGFloat = 1.0) -> [(from: Float, to: Float)] {
    return stretch.map{ pair in
      return (from: pair[0].floatValue * Float(scale), to: pair[1].floatValue * Float(scale))
    }
  }
  
  static func convert(stretch: [(from: Float, to: Float)], scale: CGFloat = 1.0) -> [ImageStretches] {
    return stretch.map { v in ImageStretches(first: v.from * Float(scale), second: v.to * Float(scale)) }
  }
  
  static func convert(stretch: [[NSNumber]], scale: CGFloat = 1.0) -> [ImageStretches] {
    return convert(stretch: convert(stretch: stretch, scale: scale))
  }
  
  static func convert(stretch: [[NSNumber]], scale: Float = 1.0) -> [ImageStretches] {
    return convert(stretch: stretch, scale: CGFloat(scale))
  }


  static func convert(content: (left:Float, top:Float, right:Float, bottom:Float)?, scale: CGFloat) -> ImageContent? {
    guard let content = content else {
      return nil
    }
    
    return ImageContent(left:content.left*Float(scale), top:content.top*Float(scale), right:content.right*Float(scale), bottom:content.bottom*Float(scale))
  }

  static func convert(content: [NSNumber]?, scale: CGFloat = 1.0) -> (left:Float,top:Float,right:Float,bottom:Float)? {
    guard let content = content else {
      return nil
    }
    guard content.count == 4 else {
      Logger.log(level: .error, message: "Image content should have 4 elements got \(content)")
      return nil
    }
    return (
      left: content[0].floatValue*Float(scale),
      top: content[1].floatValue*Float(scale),
      right: content[2].floatValue*Float(scale),
      bottom: content[3].floatValue*Float(scale)
    )
  }
  
  static func convert(content: [NSNumber]?, scale: CGFloat = 1.0) -> ImageContent? {
    return convert(content: convert(content: content, scale: scale), scale: 1.0)
  }
  
  func decodeImage(_ imageNameOrInfo: Any) -> NativeImageInfo? {
    if let imageName = imageNameOrInfo as? String {
      return (name: imageName, sdf: false, stretchX:[],stretchY:[],content:nil)
    } else if let imageInfo = imageNameOrInfo as? [String:Any] {
      guard let name = imageInfo["name"] as? String else {
        Logger.log(level: .warn, message: "NativeImage: \(imageInfo) has no name key")
        return nil
      }
      var sdf = false
      var stretchX : [(from:Float, to:Float)] = []
      var stretchY : [(from:Float, to:Float)] = []
      if let sdfV = imageInfo["sdf"] as? NSNumber {
        sdf = sdfV.boolValue
      }
      
      if let stretchXV = imageInfo["stretchX"] as? [[NSNumber]] {
        stretchX = RCTMGLImages.convert(stretch: stretchXV)
      }
      
      if let stretchYV = imageInfo["stretchY"] as? [[NSNumber]] {
        stretchY = RCTMGLImages.convert(stretch: stretchYV)
      }
      
      var content : (left:Float, top:Float, right:Float, bottom:Float)? = nil
      if let contentV = imageInfo["content"] as? [NSNumber] {
        content = RCTMGLImages.convert(content: contentV)
      }
      
      return (name: name, sdf: sdf, stretchX: stretchX, stretchY: stretchY, content: content)
    } else {
      Logger.log(level: .warn, message: "RCTMGLImage.nativeImage, unexpected image: \(imageNameOrInfo)")
      return nil
    }
  }
  
  func addNativeImages(style: Style, nativeImages: [NativeImageInfo]) {
    for imageInfo in nativeImages {
      let imageName = imageInfo.name
      if style.styleManager.getStyleImage(forImageId: imageInfo.name) == nil {
        if let image = UIImage(named: imageName) {
          logged("RCTMGLImage.addNativeImage: \(imageName)") {
            try style.addImage(image, id: imageName, sdf: imageInfo.sdf,
                               stretchX: RCTMGLImages.convert(stretch: imageInfo.stretchX, scale: image.scale),
                               stretchY: RCTMGLImages.convert(stretch: imageInfo.stretchY, scale: image.scale),
                               content: RCTMGLImages.convert(content: imageInfo.content, scale: image.scale)
            )
          }
        } else {
          Logger.log(level:.error, message: "Cannot find nativeImage named \(imageName)")
        }
      }
    }
  }
  
  lazy var placeholderImage : UIImage = {
    UIGraphicsBeginImageContextWithOptions(CGSize(width: 1, height: 1), false, 0.0)
    let result = UIGraphicsGetImageFromCurrentImageContext()!
    UIGraphicsEndImageContext()
    return result
  }()
}

extension RCTMGLImages : RCTMGLImageSetter {
  func addImage(name: String, image: UIImage, sdf: Bool?, stretchX: [[NSNumber]], stretchY: [[NSNumber]], content: [NSNumber]?, log: String) -> Bool
  {
     return logged("\(log).addImage") {
       if let style = style {
         try style.addImage(image,
                            id:name,
                            sdf: sdf ?? false,
                            stretchX: RCTMGLImages.convert(stretch: stretchX, scale: image.scale),
                            stretchY: RCTMGLImages.convert(stretch: stretchY, scale: image.scale),
                            content: RCTMGLImages.convert(content: content, scale: image.scale)
         )
         return true
       } else {
         return false
       }
     } ?? false
 }
}
