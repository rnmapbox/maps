import MapboxMaps
import UIKit

/// dummy parent of RNMBXMarkerView, so react-native changes visibility on RNMBXMarkerView,
/// and Mapbox changes visibility on RNMBXMarkerViewParentViewAnnotation
class RNMBXMarkerViewParentViewAnnotation : UIView {
  required init(marker: RNMBXMarkerView) {
    super.init(frame: marker.bounds)
    insertSubview(marker, at: 0)
  }
  
  required init?(coder: NSCoder) {
    fatalError("not implented")
  }

  func remove(marker: RNMBXMarkerView) {
    marker.removeFromSuperview()
  }

  func updateSize(_ size: CGSize, oldOffset: CGVector, newOffset: CGVector) {
    let actSize = self.frame.size
    if actSize.width != size.width || actSize.height != size.height {
      let dx = ((size.width/2.0) - newOffset.dx) - ((actSize.width/2.0) - oldOffset.dx)
      let dy = ((size.height/2.0) + newOffset.dy) - ((actSize.height/2.0) + oldOffset.dy)
      var frame = self.frame
      frame = frame.offsetBy(dx: -dx, dy: -dy)
      frame.size = size
      self.frame = frame
    }
  }
}

@objc(RNMBXMarkerView)
public class RNMBXMarkerView: UIView, RNMBXMapComponent {
  // MARK: - Instance variables
  
  static let key = "RNMBXMarkerView"
  let id: String = "marker-\(UUID().uuidString)"
  
  weak var map: RNMBXMapView?
  weak var _annotationView: RNMBXMarkerViewParentViewAnnotation?
  
  var didAddToMap = false
  
  @objc public var coordinate: Array<NSNumber>? {
    didSet {
      update()
    }
  }
  
  @objc public var anchor: [String: NSNumber]? {
    didSet {
      update()
    }
  }
  
  @objc public var allowOverlap: Bool = false {
    didSet {
      update()
    }
  }
  
  @objc public var allowOverlapWithPuck: Bool = false {
    didSet {
      update()
    }
  }
  
  @objc public var isSelected: Bool = false {
    didSet {
      update()
    }
  }

  // MARK: - Derived variables
  
  var annotationManager: ViewAnnotationManager? {
    self.map?.mapView?.viewAnnotations
  }

  var point: Point? {
    guard let _lat = coordinate?[1] else {
        Logger.log(level: .error, message: "[getPoint] No latitude were set")
        return nil
    }
    guard let _lon = coordinate?[0] else {
        Logger.log(level: .error, message: "[getPoint] No Longitude were set")
        return nil
    }
    
    let coord = CLLocationCoordinate2D(
        latitude: Double(_lat) as CLLocationDegrees, longitude: Double(_lon) as CLLocationDegrees);
     
    return Point(coord)
  }

  // MARK: - RNMBXMapComponent methods

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    self.map = map
    add()
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    remove()
    return true
  }
  
  // MARK: - React methods
  
    public override var isHidden: Bool {
    get {
      return super.isHidden
    }
    set {
      super.isHidden = newValue
    }
  }
  
    public override func reactSetFrame(_ frame: CGRect) {
    let prev = self.frame
    var next = frame
    
    let frameDidChange = !next.equalTo(prev)
    if frameDidChange {
      next = CGRect(
        x: 0,
        y: 0,
        width: next.width,
        height: next.height
      )
    }

    super.reactSetFrame(next)
    if frameDidChange {
        updateAnnotationViewSize(next, prev)
    }
    addOrUpdate()
  }
    
    public override func insertReactSubview(_ subview: UIView, at atIndex: Int) {
      super.insertReactSubview(subview, at: atIndex)
    }
    
    public override func removeReactSubview(_ subview: UIView) {
      super.removeReactSubview(subview)
    }

  @objc public func updateAnnotationViewSize(_ next: CGRect, _ prev: CGRect) {
    annotationView.updateSize(next.size, oldOffset:calcOffset(size: prev.size), newOffset: calcOffset(size: next.size))
  }

  public func waitForStyleLoad() -> Bool {
    true
  }

  // MARK: - Create, update, and remove methods

   @objc public func addOrUpdate() {
      if didAddToMap {
        update()
      } else {
        add()
      }
    }
  
  /// Because the necessary data to add an annotation arrives from different sources at unpredictable times, we let the arrival of each value trigger an attempt to add the annotation, which we only do if all of the data exists, and the annotation not been added already.
  private func add() {
    if didAddToMap {
      return
    }
    
    guard let annotationManager = annotationManager, let _ = point else {
      return
    }

    do {
      let options = getOptions()
      try annotationManager.add(annotationView, id: id, options: options)
      didAddToMap = true
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error adding annotation", error: error)
    }
  }

  private func update() {
    if !didAddToMap {
      return
    }
    
    guard let annotationManager = annotationManager else {
      return
    }
    
    do {
      let options = getOptions()
      try annotationManager.update(annotationView, options: options)
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error updating annotation", error: error)
    }
  }
  
  private func remove() {
    annotationManager?.remove(annotationView)
    annotationView.remove(marker: self)
    self._annotationView = nil
    didAddToMap = false
  }
  
  // MARK: - Helper functions
  
  private func getOptions() -> ViewAnnotationOptions {
    var geometry: GeometryConvertible?
    if let point = point {
      geometry = Geometry.point(point)
    }
    
    let size = self.bounds.size
    let offset = calcOffset(size: size)
  
    var options = ViewAnnotationOptions(
      geometry: geometry,
      width: size.width,
      height: size.height,
      allowOverlap: allowOverlap,
      offsetX: offset.dx,
      offsetY: offset.dy,
      selected: isSelected
    )
    #if RNMBX_11
    options.allowOverlapWithPuck = allowOverlapWithPuck
    options.ignoreCameraPadding = true
    #endif
    return options
  }
  
  private func calcOffset(size: CGSize) -> CGVector {
    guard let anchor = anchor, let anchorX = anchor["x"]?.CGFloat, let anchorY = anchor["y"]?.CGFloat else {
      return .zero
    }
          
    let x = (anchorX * 2 - 1) * (size.width / 2) * -1
    let y = (anchorY * 2 - 1) * (size.height / 2)

    return CGVector(dx: x, dy: y)
  }
  
  var annotationView : RNMBXMarkerViewParentViewAnnotation {
    if let result = _annotationView {
      return result
    }
    let result = RNMBXMarkerViewParentViewAnnotation(marker: self)
    _annotationView = result
    return result
  }

    @objc public override func didMoveToSuperview() {
    // React tends to add back us to our original superview,
    // https://github.com/facebook/react-native/blob/11ece22fc6955d169def9ef9f2809c24bc457ba8/React/Views/UIView%2BReact.m#L172-L177
    // fix that if we see that
    if let expectedParent = _annotationView {
      if superview != nil && superview != expectedParent {
        expectedParent.addSubview(self)
      }
    }
  }
}
