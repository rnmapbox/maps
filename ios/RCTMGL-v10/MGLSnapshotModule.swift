import MapboxMaps

@objc(MGLSnapshotModule)
class MGLSnapshotModule : NSObject {
  @objc
  static func requiresMainQueueSetup() -> Bool {
      return true
  }
  
  @objc
  func takeSnap(_ jsOptions: [String: Any],
                resolver:@escaping RCTPromiseResolveBlock,
                rejecter:@escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.main.async {
      let (cameraOptions,snapshotterOptions) = try! self._getOptions(jsOptions)
      let snapshotter = Snapshotter(options: snapshotterOptions)
      snapshotter.setCamera(to: cameraOptions)
      if let styleURL = jsOptions["styleURL"] as? String {
        snapshotter.style.uri = StyleURI(rawValue:styleURL)
      }
      var snapshotterReference : Snapshotter? = snapshotter
      snapshotter.start(overlayHandler: nil, completion: { result in
        do {
          switch (result) {
          case .success(let image):
            guard let writeToDisk = jsOptions["writeToDisk"] as? NSNumber else {
              throw RCTMGLError.paramError("writeToDisk: is not a number")
            }
            
            let value = writeToDisk.boolValue ? RNMBImageUtils.createTempFile(image) : RNMBImageUtils.createBase64(image)
            _ = snapshotterReference
            snapshotterReference = nil
            resolver(value.absoluteString)
          case .failure(let error):
            _ = snapshotterReference
            snapshotterReference = nil
            Logger.log(level: .error, message: ":: Error - snapshot failed \(error) \(error.localizedDescription)")
            rejecter("MGLSnapshotModule.start", error.localizedDescription, error)
          }
        } catch let error {
          rejecter("MGLSnapshotModule.start", error.localizedDescription, error)
        }
      })
    }
  }
  
  func _getOptions(_ jsOptions: [String:Any]) throws -> (CameraOptions, MapSnapshotOptions) {
    guard let pitch = jsOptions["pitch"] as? NSNumber else {
      throw RCTMGLError.paramError("pitch: is not a number")
    }
    
    guard let zoomLevel = jsOptions["zoomLevel"] as? NSNumber else {
      throw RCTMGLError.paramError("zoomLevel: is not a number")
    }

    guard let heading = jsOptions["heading"] as? NSNumber else {
      throw RCTMGLError.paramError("heading: is not a number")
    }
  
    guard let centerCoordinateString = jsOptions["centerCoordinate"] as? String,
          let centerCoordinateData = centerCoordinateString.data(using: .utf8),
          let centerCoordinateGeometry = try JSONDecoder().decode(Feature.self, from: centerCoordinateData).geometry,
          case .point(let centerCoordinatePoint) = centerCoordinateGeometry else {
      throw RCTMGLError.paramError("centerCoordinate: bad format")
    }
    
    let cameraOptions = CameraOptions(center: centerCoordinatePoint.coordinates, padding: nil, anchor: nil, zoom: zoomLevel.doubleValue, bearing: heading.doubleValue, pitch: pitch.doubleValue)
    
    guard let width = jsOptions["width"] as? NSNumber,
          let height = jsOptions["height"] as? NSNumber else {
      throw RCTMGLError.paramError("width, height: is not a number")
    }
    
    let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
    let mapSnapshotOptions = MapSnapshotOptions(
      size: CGSize(width: width.doubleValue, height: height.doubleValue),
      pixelRatio: 1.0,
      resourceOptions: resourceOptions
    )
    
    return (cameraOptions, mapSnapshotOptions)
  }
}
