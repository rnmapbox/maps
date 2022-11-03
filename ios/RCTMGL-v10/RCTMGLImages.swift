import MapboxMaps

class RCTMGLImages : UIView, RCTMGLMapComponent {
  
  weak var bridge : RCTBridge! = nil
  var remoteImages : [String:String] = [:]
  
  @objc
  var onImageMissing: RCTBubblingEventBlock? = nil
  
  @objc
  var images : [String:Any] = [:]
  
  @objc
  var nativeImages: [String] = []
  
  // MARK: - RCTMGLMapComponent

  func waitForStyleLoad() -> Bool {
    return false
  }
  
  func addToMap(_ map: RCTMGLMapView, style: Style) {
    map.images.append(self)
    map.setupEvents()
    
    self.addNativeImages(style: style, nativeImages: nativeImages)
    self.addRemoteImages(style: style, remoteImages: images)
  }
  
  func removeFromMap(_ map: RCTMGLMapView) {
    // v10todo
  }
  
  func addRemoteImages(style: Style, remoteImages: [String: Any]) {
    var missingImages : [String:Any] = [:]
    
    // Add image placeholder for images that are not yet available in the style. This way
    // we can load the images asynchronously and add the ShapeSource to the map without delay.
    // The same is required when this ShapeSource is updated with new/added images and the
    // data references them. In which case addMissingImageToStyle will take care of loading
    // them in a similar way.
    //
    // See also: https://github.com/mapbox/mapbox-gl-native/pull/14253#issuecomment-478827792
    
    for imageName in remoteImages.keys {
      if style.styleManager.getStyleImage(forImageId: imageName) == nil {
        try! style.addImage(placeholderImage, id: imageName, stretchX: [], stretchY: [])
        missingImages[imageName] = remoteImages[imageName]
      }
    }
    
    if missingImages.count > 0 {
      RCTMGLUtils.fetchImages(bridge, style: style, objects: missingImages, forceUpdate: true, callback: { })
      
    }
  }
  
  public func addMissingImageToStyle(style: Style, imageName: String) -> Bool {
    if nativeImages.contains(imageName) {
      addNativeImages(style: style, nativeImages: [imageName])
      return true
    }
    
    if let remoteImage = images[imageName] {
      addRemoteImages(style: style, remoteImages: [imageName: remoteImage])
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
  
  func addNativeImages(style: Style, nativeImages: [String]) {
    for imageName in nativeImages {
      if style.styleManager.getStyleImage(forImageId: imageName) == nil {
        if let image = UIImage(named: imageName) {
          try! style.addImage(image, id: imageName, stretchX: [], stretchY: [])
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
