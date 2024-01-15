import MapboxMaps


final class WeakRef<T: AnyObject> {
  weak var object: T?
  
  init(_ object: T) {
    self.object = object
  }
}
@objc
public class RNMBXPointAnnotation : RNMBXInteractiveElement {
  static let key = "RNMBXPointAnnotation"
  static var gid = 0;
  
  lazy var annotation : PointAnnotation = {
    var result = PointAnnotation(coordinate: CLLocationCoordinate2D())
    result.isDraggable = false // we implement our own drag logic
    result.userInfo = [RNMBXPointAnnotation.key:WeakRef(self)]
    return result
  }()
  var added = false

  weak var callout: RNMBXCallout? = nil
  var calloutId : String?
  var image : UIImage? = nil
  var reactSubviews : [UIView] = []
 
    
  @objc public var onDeselected: RCTBubblingEventBlock? = nil
  @objc public var onDrag: RCTBubblingEventBlock? = nil
  @objc public var onDragEnd: RCTBubblingEventBlock? = nil
  @objc public var onSelected: RCTBubblingEventBlock? = nil
  
  @objc public var coordinate : String? {
    didSet {
      _updateCoordinate()
    }
  }
  
  @objc public var anchor: [String:NSNumber] = [:] {
    didSet {
      update { annotation in
        _updateAnchor(&annotation)
      }
    }
  }
  
  func _updateAnchor(_ annotation: inout PointAnnotation) {
    if !anchor.isEmpty {
      if let image = annotation.image {
        let size = image.image.size
        annotation.iconAnchor = .topLeft
        annotation.iconOffset = [size.width * (anchor["x"]?.CGFloat ?? 0.0) * -1.0, size.height * (anchor["y"]?.CGFloat ?? 0.0) * -1.0]
      }
    }
  }

  func _updateCoordinate() {
    guard let point = point() else {
      return
    }
    update { annotation in
      annotation.point = point
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

    update { annotation in
      let name =  "rnview-\(gid())-\(annotation.id)"
      annotation.image = PointAnnotation.Image(image: image , name: name)
      _updateAnchor(&annotation)
    }
  }
   
  func setAnnotationImage(inital: Bool = false) {
    if let image = _createViewSnapshot() {
      changeImage(image, initial: inital)
    }
  }
   
  func gid() -> Int {
      RNMBXPointAnnotation.gid = RNMBXPointAnnotation.gid + 1
    return RNMBXPointAnnotation.gid
  }
   
  @objc
  public func refresh() {
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
  
  func makeEvent(isSelect: Bool, deselectAnnotationOnMapTap: Bool = false) -> RNMBXEvent {
    let position = superview?.convert(layer.position, to: nil)
    let location = map?.mapboxMap.coordinate(for: position!)
    var geojson = Feature(geometry: .point(Point(location!)))
    geojson.identifier = .string(id)
    var properties : [String: JSONValue?] = [
      "screenPointX": .number(Double(position!.x)),
      "screenPointY": .number(Double(position!.y))
    ]
    if deselectAnnotationOnMapTap {
      properties["deselectAnnotationOnMapTap"] = true
    }
    geojson.properties = properties
    let event = RNMBXEvent(type:isSelect ? .annotationSelected : .annotationDeselected, payload: logged("doHandleTap") { try geojson.toJSON() })
    return event
  }
  
  func doSelect() {
    let event = makeEvent(isSelect: true)
    if let onSelected = onSelected {
      onSelected(event.toJSON())
    }
    onSelect()
  }
  
  func doDeselect(deselectAnnotationOnMapTap: Bool = false) {
    let event = makeEvent(isSelect: false, deselectAnnotationOnMapTap: deselectAnnotationOnMapTap)
    if let onDeselected = onDeselected {
      onDeselected(event.toJSON())
    }
    onDeselect()
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
      self.map?.calloutAnnotationManager.annotations.append(calloutPtAnnotation)
    }
  }
  
  func onDeselect() {
    self.map?.calloutAnnotationManager.annotations.removeAll {
      $0.id == calloutId
    }
  }
  
  @objc
  public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    insertReactSubviewInternal(subview, at: atIndex)
  }
    
    @objc
    public func insertReactSubviewInternal(_ subview: UIView!, at atIndex: Int) {
      if let callout = subview as? RNMBXCallout {
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
  public override func removeReactSubview(_ subview: UIView!) {
    removeReactSubviewInternal(subview)
  }
    
    @objc
    public func removeReactSubviewInternal(_ subview: UIView!) {
      if let callout = subview as? RNMBXCallout {
        if self.callout == callout {
          self.callout = nil
        }
      } else {
        reactSubviews.removeAll(where: { $0 == subview })
      }
    }
  
  // MARK: - RNMBXMapComponent
  
  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    self.map = map
    addIfPossible()
  }

  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    removeIfAdded()
    self.map = nil
    return true
  }
  
  // MARK: - RNMBXInteractiveElement
  
  override func getLayerIDs() -> [String] {
    return []
  }
}

// MARK: - add/remove/update of point annotation

extension RNMBXPointAnnotation {
  func removeIfAdded() {
    if added, let pointAnnotationManager = map?.pointAnnotationManager {
      pointAnnotationManager.remove(annotation)
      added = false
    }
  }
  
  @discardableResult
  func addIfPossible() -> Bool {
    if !added
        && annotation.point.coordinates.isValid()
        && (logged("PointAnnotation: missing id attribute") { return id }) != nil,
        let pointAnnotationManager = map?.pointAnnotationManager {
      pointAnnotationManager.add(annotation, self)
      added = true
      return true
    }
    return false
  }
  
  func update(callback: (_ annotation: inout PointAnnotation) -> Void) {
    callback(&annotation)
    if let pointAnnotationManager = map?.pointAnnotationManager {
      if added {
        pointAnnotationManager.update(annotation)
      } else if !added {
        addIfPossible()
      }
    }
  }
}

