import MapboxMaps
import UIKit

class RCTMGLMarkerView: UIView, RCTMGLMapComponent {
  // MARK: - Instance variables
  
  static let key = "RCTMGLMarkerView"
  let id: String = "marker-\(UUID().uuidString)"
  
  /// `MarkerView` must handle gestures on its own, because Mapbox `ViewAnnotations` do not have a gesture delegate.
  var tap: UIGestureRecognizer!
  
  var map: RCTMGLMapView?
  
  /// The view in the hierarchy matching the first element in the `children` prop in React Native.
  var firstCustomView: UIView?
  
  /// Whether this annotation instance has been added to the map.
  var isAdded = false
  
  var reactOnPress: RCTBubblingEventBlock?
  
  // MARK: - Derived variables
  
  var annotationManager: ViewAnnotationManager? {
    self.map?.viewAnnotations
  }

  @objc var coordinate: String? {
    didSet {
      updateIfPossible()
    }
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
  
  @objc var anchor: [String: NSNumber]? {
    didSet {
      updateIfPossible()
    }
  }
  
  @objc var allowOverlap: Bool = false {
    didSet {
      updateIfPossible()
    }
  }

  // MARK: - UIView methods
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    
    tap = UITapGestureRecognizer(target: self, action: #selector(onTap(_:)))
    self.addGestureRecognizer(tap)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // Set the first grandchild view as a view with a usable frame, skipping the first
    // child, which is a wrapper view defined in the MarkerView component on the React Native
    // side. The method `layoutSubviews` is used instead of a React method because this is
    // the only callback where layout values are always accurate - in `reactSetFrame` etc.,
    // the grandchild view's size is often incorrectly described as (0, 0).
    guard let child = self.subviews.first, let grandchild = child.subviews.first else {
      return
    }
    
    // Make the top-level view adopt the React Native subview's size.
    self.frame.size = grandchild.frame.size
    
    // Reposition all children to fill the resized top-level view.
    child.frame = self.bounds
    grandchild.frame = child.bounds
    
    // Immediately hide the custom content, and wait until the annotation is added to the map
    // before showing it. (See `add()` method.)
    if !isAdded {
      grandchild.layer.opacity = 0
    }
    
    firstCustomView = grandchild
    addIfPossible()
  }
  
  @objc func onTap(_ rec: UITapGestureRecognizer) {
    onSelect()
  }

  // MARK: - RCTMGLMapComponent methods

  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    addIfPossible()
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    removeIfPossible()
  }
  
  // MARK: - React methods
  
  @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnPress = value
  }
  
  override func reactSetFrame(_ frame: CGRect) {
    super.reactSetFrame(frame)
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

  /// Because the necessary data to add an annotation arrives from different sources at unpredictable times, we let the arrival of each value trigger an attempt to add the annotation, which we only do if all of the data exists, and the annotation not been added already.
  private func addIfPossible() {
    if isAdded {
      return
    }
    
    guard let firstCustomView = firstCustomView, let annotationManager = annotationManager, let point = point else {
      return
    }
    
    do {
      try add(
        firstCustomView: firstCustomView,
        annotationManager: annotationManager,
        point: point
      )
      isAdded = true
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error adding annotation", error: error)
    }
  }

  private func add(firstCustomView: UIView, annotationManager: ViewAnnotationManager, point: Point) throws {
    let options = ViewAnnotationOptions(
      geometry: Geometry.point(point),
      width: firstCustomView.frame.width,
      height: firstCustomView.frame.height,
      allowOverlap: allowOverlap,
      anchor: .center
    )
    try annotationManager.add(self, id: id, options: options)
    
    // If the annotation view is made visible the instant it is added to the map, it occasionally
    // appears in the default top-left corner for an instant before moving to the correct location
    // on the map. Waiting for a tiny delay fixes this.
    Timer.scheduledTimer(withTimeInterval: 0.05, repeats: false) { _ in
      self.firstCustomView?.layer.opacity = 1
    }
  }
  
  private func updateIfPossible() {
    if !isAdded {
      return
    }
    
    guard let firstCustomView = firstCustomView, let annotationManager = annotationManager else {
      return
    }
    
    var geometry: GeometryConvertible?
    if let point = point {
      geometry = Geometry.point(point)
    }
    
    var offset: CGVector?
    if let anchor = anchor, let anchorX = anchor["x"]?.CGFloat, let anchorY = anchor["y"]?.CGFloat {
      // Create a modified offset:
      // - Normalize from [(0, 0), (1, 1)] to [(-1, -1), (1, 1)].
      // - Scale to the view size.
      // - Invert `y` so that higher values are lower on the screen.
      offset = CGVector(
        dx: (anchorX * 2 - 1) * (firstCustomView.frame.width / 2),
        dy: (anchorY * 2 - 1) * (firstCustomView.frame.height / 2) * -1
      )
    }
    
    do {
      try update(
        firstCustomView: self,
        annotationManager: annotationManager,
        geometry: geometry,
        offset: offset
      )
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error updating annotation", error: error)
    }
  }
  
  private func update(firstCustomView: UIView, annotationManager: ViewAnnotationManager, geometry: GeometryConvertible?, offset: CGVector?) throws {
    let options = ViewAnnotationOptions(
      geometry: geometry,
      allowOverlap: allowOverlap,
      offsetX: offset?.dx,
      offsetY: offset?.dy
    )
    try annotationManager.update(self, options: options)
  }
  
  /// There seems to be a Mapbox bug where `selected` does not cause the marker to move to the front, so this forces that effect.
  private func onSelect() {
    guard let annotationManager = annotationManager else {
      return
    }
    
    if let options = annotationManager.options(for: self) {
      do {
        annotationManager.remove(self)
        try annotationManager.add(self, id: id, options: options)
      } catch {
        Logger.log(level: .error, message: "[MarkerView] Error selecting annotation", error: error)
      }
    }
    
    reactOnPress?([:])
  }
  
  private func removeIfPossible() {
    annotationManager?.remove(self)
  }
}
