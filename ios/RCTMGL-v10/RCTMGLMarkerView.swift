import MapboxMaps
import UIKit

/// dummy parent of RCTMGLMarkerView, so react-native changes visibility on RCTMGLMarkerView,
/// and Mapbox changes visibility on RCTMGLMarkerViewParentViewAnnotation
class RCTMGLMarkerViewParentViewAnnotation : UIView {
  required init(marker: RCTMGLMarkerView) {
    super.init(frame: marker.bounds)
    insertSubview(marker, at: 0)
  }
  
  required init?(coder: NSCoder) {
    fatalError("not implented")
  }

  func remove(marker: RCTMGLMarkerView) {
    marker.removeFromSuperview()
  }

  func updateSize(_ size: CGSize, oldOffset: CGVector, newOffset: CGVector) {
    let actSize = self.frame.size
    if actSize.width != size.width || actSize.height != size.height {
      let dx = ((size.width/2.0) - newOffset.dx) - ((actSize.width/2.0) - oldOffset.dx)
      let dy = ((size.height/2.0) + newOffset.dy) - ((actSize.height/2.0) + oldOffset.dy)
      print(" => size=\(size) actSize=\(actSize) newOffset=\(newOffset) oldOffset=\(oldOffset)  dx=\(dx) dy=\(dy)")
      var frame = self.frame
      frame = frame.offsetBy(dx: -dx, dy: -dy)
      frame.size = size
      self.frame = frame
    }
  }
}

class RCTMGLMarkerView: UIView, RCTMGLMapComponent {
  // MARK: - Instance variables
  
  static let key = "RCTMGLMarkerView"
  let id: String = "marker-\(UUID().uuidString)"
  
  weak var map: RCTMGLMapView?
  weak var _annotationView: RCTMGLMarkerViewParentViewAnnotation?
  
  var didAddToMap = false
  
  @objc var coordinate: String? {
    didSet {
      update()
    }
  }
  
  @objc var anchor: [String: NSNumber]? {
    didSet {
      update()
    }
  }
  
  @objc var allowOverlap: Bool = false {
    didSet {
      update()
    }
  }
  
  @objc var isSelected: Bool = false {
    didSet {
      update()
    }
  }

  // MARK: - Derived variables
  
  var annotationManager: ViewAnnotationManager? {
    self.map?.viewAnnotations
  }

  var point: Point? {
    guard let _coordinate = coordinate else {
      Logger.log(level: .error, message: "[getPoint] No coordinates were set")
      return nil
    }
     
    guard let _data = _coordinate.data(using: .utf8) else {
      Logger.log(level: .error, message: "[getPoint] Cannot serialize coordinate")
      return nil
    }
     
    guard let _feature = try? JSONDecoder().decode(Feature.self, from: _data) else {
      Logger.log(level: .error, message: "[getPoint] Cannot parse serialized coordinate")
      return nil
    }
     
    guard let _geometry = _feature.geometry else {
      Logger.log(level: .error, message: "[getPoint] Invalid geometry")
      return nil
    }

    guard case .point(let _point) = _geometry else {
      Logger.log(level: .error, message: "[getPoint] Invalid point")
      return nil
    }

    return _point
  }

  // MARK: - RCTMGLMapComponent methods

  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    add()
  }

  func removeFromMap(_ map: RCTMGLMapView, reason: RemovalReason) -> Bool {
    remove()
    return true
  }
  
  // MARK: - React methods
  
  override var isHidden: Bool {
    get {
      return super.isHidden
    }
    set {
      super.isHidden = newValue
    }
  }
  
  override func reactSetFrame(_ frame: CGRect) {
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
      annotationView.updateSize(next.size, oldOffset:calcOffset(size: prev.size), newOffset: calcOffset(size: next.size))
    }
    addOrUpdate()
  }
  
  override func insertReactSubview(_ subview: UIView, at atIndex: Int) {
    super.insertReactSubview(subview, at: atIndex)
  }
  
  override func removeReactSubview(_ subview: UIView) {
    super.removeReactSubview(subview)
  }
  
  func waitForStyleLoad() -> Bool {
    true
  }

  // MARK: - Create, update, and remove methods

    private func addOrUpdate() {
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
  
    let options = ViewAnnotationOptions(
      geometry: geometry,
      width: size.width,
      height: size.height,
      allowOverlap: allowOverlap,
      offsetX: offset.dx,
      offsetY: offset.dy,
      selected: isSelected
    )
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
  
  var annotationView : RCTMGLMarkerViewParentViewAnnotation {
    if let result = _annotationView {
      return result
    }
    let result = RCTMGLMarkerViewParentViewAnnotation(marker: self)
    _annotationView = result
    return result
  }

  @objc override func didMoveToSuperview() {
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
