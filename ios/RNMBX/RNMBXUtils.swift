import MapboxMaps

class RNMBXUtils {
  static func fetchImage(_ bridge: RCTBridge, url: String?, scale:Double, callback: @escaping (_ error: Error?, _ image: UIImage?) -> Void) {
    guard let url = url else {
      fatalError("FetchImage called with nil as url")
    }
    RNMBXImageQueue.sharedInstance.addImage(url, scale: scale, bridge: bridge, handler: callback)
  }
  
  static func fetchImages(_ bridge: RCTBridge, style: Style, objects: [String:Any], forceUpdate: Bool, loaded: @escaping (String, UIImage) -> Void) {
    guard !objects.isEmpty else {
      return
    }
    
    let imageNames = objects.keys
    var imagesToLoad: Int = imageNames.count
    
    let imageLoadedBlock = { () in
      imagesToLoad = imagesToLoad - 1;
    }
    
    for imageName in imageNames {
      let foundImage: UIImage? = forceUpdate ? nil : style.image(withId: imageName)
      
      if (forceUpdate || foundImage == nil) {
        let image = objects[imageName]
        if let image = image as? [String:Any] {
          var scale = (image["scale"] as? NSNumber)?.floatValue ?? 1.0
          let sdf = (image["sdf"] as? NSNumber)?.boolValue ?? false
          let imageStretchX = image["stretchX"] as? [[NSNumber]]
          let stretchX: [ImageStretches] = imageStretchX != nil ? RNMBXImages.convert(stretch: imageStretchX!, scale: CGFloat(scale)) : []
          let imageStretchY = image["stretchY"] as? [[NSNumber]]
          let stretchY: [ImageStretches] = imageStretchY != nil ? RNMBXImages.convert(stretch: imageStretchY!, scale: CGFloat(scale)) : []
          let content: ImageContent? = RNMBXImages.convert(content: image["content"] as? [NSNumber], scale: CGFloat(scale))
          var resolvedImage = image
          if let actResolvedImage = resolvedImage["resolvedImage"] as? [String:Any] {
            resolvedImage = actResolvedImage
            if let scaleInResolvedImage = resolvedImage["scale"] as? NSNumber {
              scale = scale * scaleInResolvedImage.floatValue
            }
          }
          
          RNMBXImageQueue.sharedInstance.addImage(resolvedImage, scale: Double(scale), bridge:bridge) {
            (error,image) in
            if image == nil {
              RNMBXLogWarn("Failed to fetch image: \(imageName) error:\(optional: error)")
            }
            else {
              DispatchQueue.main.async {
                if let image = image {
                  logged("RNMBXUtils.fetchImage-\(imageName)") {
                    try style.addImage(image, id: imageName, sdf:sdf, stretchX: stretchX, stretchY: stretchY, content: content)
                    loaded(imageName, image)
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
