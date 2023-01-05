import MapboxMaps


final class WeakRef<T: AnyObject> {
  weak var object: T?
  
  init(_ object: T) {
    self.object = object
  }
}

class RCTMGLPointAnnotation : RCTMGLInteractiveElement {
  static let key = "RCTMGLPointAnnotation"
  static var gid = 0;
  
  var annotation : PointAnnotation! = nil
  weak var callout: RCTMGLCallout? = nil
  var calloutId : String?
  var image : UIImage? = nil
  var reactSubviews : [UIView] = []

  @objc var onDeselected: RCTBubblingEventBlock? = nil
  @objc var onDrag: RCTBubblingEventBlock? = nil
  @objc var onDragEnd: RCTBubblingEventBlock? = nil
  @objc var onSelected: RCTBubblingEventBlock? = nil
  
  @objc var coordinate : String? {
    didSet {
      _updateCoordinate()
    }
  }
  
  func _create(point: Point) -> PointAnnotation {
    var result = PointAnnotation(point: point)
    result.isDraggable = false // we implement our own drag logic
    result.userInfo = [RCTMGLPointAnnotation.key:WeakRef(self)]
    return result
  }

  func _refresh(_ annotation: PointAnnotation) {
    map?.pointAnnotationManager.refresh(annotation)
  }

  func _updateCoordinate() {
    guard let point = point() else {
      return
    }
    if var annotation = annotation {
      annotation.point = point
      _refresh(annotation)
    } else {
      annotation = _create(point: point)
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
    self.image = image
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
      self.annotation = _create(point: point)
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
   
  func gid() -> Int {
    RCTMGLPointAnnotation.gid = RCTMGLPointAnnotation.gid + 1
    return RCTMGLPointAnnotation.gid
  }
   
  @objc
  func refresh() {
    if let image = _createViewSnapshot() {
      changeImage(image)
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
  
  func onSelect() {
    if let callout = callout,
       let calloutImage = _createViewSnapshot(view: callout),
       let point = point() {
      
      var calloutPtAnnotation = PointAnnotation(point: point)
      calloutId = calloutPtAnnotation.id
      let name =  "rnviewcallout-\(gid())-\(calloutPtAnnotation.id)"
      calloutPtAnnotation.image = PointAnnotation.Image(image: calloutImage, name: name)
      if let size = image?.size {
        calloutPtAnnotation.iconOffset = [0, -size.height]
      }
      self.map?.calloutAnnotationManager.annotations.append(
        
        calloutPtAnnotation)
    }
  }
  
  func onDeselect() {
    self.map?.calloutAnnotationManager.annotations.removeAll {
      $0.id == calloutId
    }
  }
  
  @objc
  override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let callout = subview as? RCTMGLCallout {
      self.callout = callout
    } else {
      reactSubviews.insert(subview, at: atIndex)
      if reactSubviews.count > 1 {
        Logger.log(level: .error, message: "PointAnnotation supports max 1 subview other than a callout")
      }
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
      if self.callout == callout {
        self.callout = nil
      }
    } else {
      reactSubviews.removeAll(where: { $0 == subview })
    }
  }
  
  // MARK: - RCTMGLMapComponent
  
  override func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    if (annotation != nil) {
      self.map?.pointAnnotationManager.add(annotation)
    }
  }

  override func removeFromMap(_ map: RCTMGLMapView) {
    self.map = map
    if (annotation != nil) {
      self.map?.pointAnnotationManager.remove(annotation)
    }
  }
  
  // MARK: - RCTMGLInteractiveElement
  
  override func getLayerIDs() -> [String] {
    return []
  }
}

