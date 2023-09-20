import MapboxMaps

@objc(RNMBXSnapshotModule)
class RNMBXSnapshotModule : NSObject {
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
      logged("takeSnap", rejecter:rejecter) {
        let snapshotterOptions = try self._getSnapshotterOptions(jsOptions)
        let snapshotter = Snapshotter(options: snapshotterOptions)
        let cameraOptions = try self._getCameraOptions(jsOptions, snapshotter)
        
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
                throw RNMBXError.paramError("writeToDisk: is not a number")
              }
              
              let value = writeToDisk.boolValue ? RNMBImageUtils.createTempFile(image) : RNMBImageUtils.createBase64(image)
              _ = snapshotterReference
              snapshotterReference = nil
              resolver(value.absoluteString)
            case .failure(let error):
              _ = snapshotterReference
              snapshotterReference = nil
              Logger.log(level: .error, message: ":: Error - snapshot failed \(error) \(error.localizedDescription)")
              rejecter("RNMBXSnapshotModule.start", error.localizedDescription, error)
            }
          } catch let error {
            rejecter("RNMBXSnapshotModule.start", error.localizedDescription, error)
          }
        })
      }
    }
  }

  func _getCameraOptions(_ jsOptions: [String:Any], _ snaphotter: Snapshotter) throws -> CameraOptions {
    guard let pitch = jsOptions["pitch"] as? NSNumber else {
      throw RNMBXError.paramError("pitch: is not a number")
    }
    
    guard let zoomLevel = jsOptions["zoomLevel"] as? NSNumber else {
      throw RNMBXError.paramError("zoomLevel: is not a number")
    }

    guard let heading = jsOptions["heading"] as? NSNumber else {
      throw RNMBXError.paramError("heading: is not a number")
    }
    
    if let centerCoordinateString = jsOptions["centerCoordinate"] as? String {
      guard let centerCoordinateData = centerCoordinateString.data(using: .utf8),
            let centerCoordinateGeometry = try JSONDecoder().decode(Feature.self, from: centerCoordinateData).geometry,
            case .point(let centerCoordinatePoint) = centerCoordinateGeometry else {
        throw RNMBXError.paramError("centerCoordinate: bad format")
      }
      
      return CameraOptions(center: centerCoordinatePoint.coordinates, padding: nil, anchor: nil, zoom: zoomLevel.doubleValue, bearing: heading.doubleValue, pitch: pitch.doubleValue)
    }
    else if let bounds = jsOptions["bounds"] as? String {
      guard let boundsData = bounds.data(using: .utf8) else {
        throw RNMBXError.paramError("bounds: bad format")
      }
      let boundsFeatures = try JSONDecoder().decode(FeatureCollection.self, from: boundsData).features
      let coords : [CLLocationCoordinate2D] = try boundsFeatures.map {
        guard case .point(let centerCoordinatePoint) = $0.geometry else {
          throw RNMBXError.paramError("Invalid bounds geometry")
        }
        return centerCoordinatePoint.coordinates
      }
      return snaphotter.camera(for: coords, padding: .zero, bearing: heading.doubleValue, pitch: pitch.doubleValue)
    } else {
      throw RNMBXError.paramError("neither centerCoordinate nor bounds provided")
    }
  }
  
  func _getSnapshotterOptions(_ jsOptions: [String:Any]) throws -> MapSnapshotOptions {
    guard let width = jsOptions["width"] as? NSNumber,
          let height = jsOptions["height"] as? NSNumber else {
      throw RNMBXError.paramError("width, height: is not a number")
    }
    #if RNMBX_11
    let mapSnapshotOptions = MapSnapshotOptions(
      size: CGSize(width: width.doubleValue, height: height.doubleValue),
      pixelRatio: 1.0
    )
    #else
    let resourceOptions = ResourceOptions(accessToken: RNMBXModule.accessToken!)
    let mapSnapshotOptions = MapSnapshotOptions(
      size: CGSize(width: width.doubleValue, height: height.doubleValue),
      pixelRatio: 1.0,
      resourceOptions: resourceOptions
    )
    #endif
    
    return mapSnapshotOptions
  }
}
