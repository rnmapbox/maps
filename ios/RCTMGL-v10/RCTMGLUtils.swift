import MapboxMaps

class RCTMGLUtils {
  static func fetchImage(_ bridge: RCTBridge, url: String?, scale:Double, callback: @escaping (_ error: Error?, _ image: UIImage?) -> Void) {
    guard let url = url else {
      fatalError("FetchImage called with nil as url")
    }
    RCTMGLImageQueue.sharedInstance.addImage(url, scale: scale, bridge: bridge, handler: callback)
  }
  
  static func fetchImages(_ bridge: RCTBridge, style: Style, objects: [String:Any], forceUpdate: Bool, loaded: @escaping (_ name:String) -> Void, callback: @escaping ()->Void) {
    guard !objects.isEmpty else {
      callback()
      return
    }
    
    let imageNames = objects.keys
    var imagesToLoad: Int = imageNames.count
    
    let imageLoadedBlock = { () in
      imagesToLoad = imagesToLoad - 1;
      if imagesToLoad == 0 {
        callback()
      }
    }
    
    for imageName in imageNames {
      let foundImage: UIImage? = forceUpdate ? nil : style.image(withId: imageName)
      
      if (forceUpdate || foundImage == nil) {
        let image = objects[imageName]
        if let image = image as? [String:Any] {
          let scale = (image["scale"] as? NSNumber)?.floatValue ?? 1.0
          let sdf = (image["sdf"] as? NSNumber)?.boolValue ?? false
          let imageStretchX = image["stretchX"] as? [[NSNumber]]
          let stretchX: [ImageStretches] = imageStretchX != nil ? RCTMGLImages.convert(stretch: imageStretchX!, scale: CGFloat(scale)) : []
          let imageStretchY = image["stretchY"] as? [[NSNumber]]
          let stretchY: [ImageStretches] = imageStretchY != nil ? RCTMGLImages.convert(stretch: imageStretchY!, scale: CGFloat(scale)) : []
          let content: ImageContent? = RCTMGLImages.convert(content: image["content"] as? [NSNumber], scale: CGFloat(scale))
          
          RCTMGLImageQueue.sharedInstance.addImage(objects[imageName], scale: Double(scale), bridge:bridge) {
            (error,image) in
            if image == nil {
              RCTMGLLogWarn("Failed to fetch image: \(imageName) error:\(error)")
            }
            else {
              DispatchQueue.main.async {
                if let image = image {
                  logged("RCTMGLUtils.fetchImage-\(imageName)") {
                    try style.addImage(image, id: imageName, sdf:sdf, stretchX: stretchX, stretchY: stretchY, content: content)
                    loaded(imageName)
                    imageLoadedBlock()
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
