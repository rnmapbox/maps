import MapboxMaps

 class RCTMGLPointAnnotation : UIView, RCTMGLMapComponent {

  var annotation : PointAnnotation!
  
  @objc var coordinate : String? {
    didSet {
      _updateCoordinate()
    }
  }

  func _updateCoordinate() {
    guard let point = point() else {
      return
    }
    if var annotation = annotation {
      annotation.point = point
    } else {
      annotation = PointAnnotation(point: point)
      setAnnotationImage(inital: true)
    }
  }
   
  func point() -> Point? {
    guard let coordinate = coordinate else {
      return nil
    }
     
    guard let data = coordinate.data(using: .utf8) else {
      return nil
    }
     
    guard let feature = try? JSONDecoder().decode(Feature.self, from: data) else {
      return nil
    }
     
    guard let geometry : Geometry = feature.geometry else {
      return nil
    }

    guard case .point(let point) = geometry else {
      return nil
    }
     
    return point
  }
   
  func changeImage(_ image: UIImage, initial: Bool = false) {
    if initial {
      doChangeImage(image)
    } else {
      let oldAnnotation = annotation
      if let map = self.map, let oldAnnotation = oldAnnotation {
        map.pointAnnotationManager.remove(oldAnnotation)
      }
      guard let point = oldAnnotation?.point ?? point() else {
        return
      }
      self.annotation = PointAnnotation(point: point)
      doChangeImage(image)
    }
  }
  
   func doChangeImage(_ image: UIImage) {
     let name =  "rnview-\(gid())-\(annotation.id)"
     annotation.image = PointAnnotation.Image(image: image , name: name)
     if let map = self.map {
       map.pointAnnotationManager.add(annotation)
     }
   }
   
  func setAnnotationImage(inital: Bool = false) {
    if let image = _createViewSnapshot() {
      changeImage(image, initial: inital)
    }
  }
  
  static var gid = 0;
   
  func gid() -> Int {
    RCTMGLPointAnnotation.gid = RCTMGLPointAnnotation.gid + 1
    return RCTMGLPointAnnotation.gid
  }
   
  @objc
  func refresh() {
    if let image = _createViewSnapshot() {
      changeImage(image)
/*      let oldPoint = annotation.point
      
      annotation = PointAnnotation(point: oldPoint)
      let name =  "r-rnview-\(gid())-\(annotation.id)"
      print("### name \(name)")
      annotation.image = PointAnnotation.Image(image: image , name: name)
      print("image: \(image) S:\(image.size)")
      if let map = self.map {
        
      } */
    }
  }
   
  var reactSubviews : [UIView] = []

  @objc
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let callout = subview as? RCTMGLCallout {
      // TODO
    } else {
      reactSubviews.insert(subview, at: atIndex)
      if annotation.image == nil {
        DispatchQueue.main.asyncAfter(deadline: .now() + .microseconds(10)) {
          self.setAnnotationImage()
        }
      }
    }
  }

  @objc
  override func removeReactSubview(_ subview: UIView!) {
    if let callout = subview as? RCTMGLCallout {
      // TODO
    } else {
      reactSubviews.removeAll(where: { $0 == subview })
    }
  }
   
  func _createViewSnapshot() -> UIImage? {
    guard reactSubviews.count > 0 else {
      return nil
    }
    // UIGraphicsRenderer()
    let view = reactSubviews[0]
    
    guard view.bounds.size.width > 0 && view.bounds.size.height > 0 else {
      return nil
    }
    
    let roundUp = 4
    
    print("Bounds: \(view.bounds)")
    let adjustedSize = CGSize(
      width: ((Int(view.bounds.size.width)+roundUp-1)/roundUp)*roundUp,
      height: ((Int(view.bounds.size.height)+roundUp-1)/roundUp)*roundUp
    )
    print("+++ Adjusted size: \(adjustedSize)")
  
    //let adjustedSize = view.bounds.size
    let renderer = UIGraphicsImageRenderer(size: adjustedSize)
    let image = renderer.image { context in
      // UIGraphicsBeginImageContextWithOptions(view.bounds.size, false, 0.0)
      view.layer.render(in: context.cgContext)
      //view.drawHierarchy(in: view.bounds, afterScreenUpdates: true)
      //let snapshot = UIGraphicsGetImageFromCurrentImageContext()
      //UIGraphicsEndImageContext()
    }
    return image
  }

  var map: RCTMGLMapView? = nil
  
  func addToMap(_ map: RCTMGLMapView) {
    self.map = map
    self.map?.pointAnnotationManager.add(annotation)
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    self.map = map
  }
}
