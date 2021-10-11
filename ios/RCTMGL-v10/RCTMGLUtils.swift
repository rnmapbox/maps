import MapboxMaps

class RCTMGLUtils {
  static func fetchImage(_ bridge: RCTBridge, url: String?, scale:Double, callback: @escaping (_ error: Error?, _ image: UIImage?) -> Void) {
    guard let url = url else {
      fatalError("FetchImage called with nil as url")
    }
    RCTMGLImageQueue.sharedInstance.addImage(url, scale: scale, bridge: bridge, handler: callback)
  }
  
  static func fetchImages(_ bridge: RCTBridge, style: Style, objects: [String:Any], forceUpdate: Bool, callback: @escaping ()->Void) {
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
          let hasScale = image["scale"] != nil
          let scale = hasScale ? (image["scale"] as! NSNumber).doubleValue : 1.0
          RCTMGLImageQueue.sharedInstance.addImage(objects[imageName], scale: scale, bridge:bridge) {
            (error,image) in
            if image == nil {
              RCTLogWarn("Failed to fetch image: \(imageName) error:\(error)")
            }
            else {
              DispatchQueue.main.async {
                if let image = image {
                  try! style.addImage(image, id: imageName, stretchX: [], stretchY: [])
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
