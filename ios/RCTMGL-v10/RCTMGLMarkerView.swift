import MapboxMaps
import UIKit

class RCTMGLMarkerView: UIView, RCTMGLMapComponent {
  // MARK: - Instance variables
  
  static let key = "RCTMGLMarkerView"
  let id: String = "marker-\(UUID().uuidString)"
  
  var map: RCTMGLMapView?
  var reactChildrenView: UIView?
  var isAdded = false
  
  @objc var coordinate: String? {
    didSet {
      updateIfPossible()
    }
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
  
  @objc var isSelected: Bool = false {
    didSet {
      let hasBecomeSelected = isSelected && !oldValue
      if hasBecomeSelected {
        try? setSelected()
      } else {
        updateIfPossible()
      }
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
  
  // MARK: - UIView methods
  
  override init(frame: CGRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }
  
  override func layoutSubviews() {
    super.layoutSubviews()
    
    // The method `layoutSubviews` is used instead of a React method because this is the
    // only callback where layout values are always accurate - in `reactSetFrame` etc.,
    // the grandchild view's size is often incorrectly described as (0, 0).
    guard let child = self.subviews.first, let grandchild = child.subviews.first else {
      return
    }
    
    // Make the top-level view adopt the React Native subview's size.
    self.frame.size = grandchild.frame.size
    
    // Reposition all children to fill the resized top-level view.
    child.frame = self.bounds
    grandchild.frame = child.bounds
    
    reactChildrenView = grandchild
    addIfPossible()
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
  
  override func reactSetFrame(_ frame: CGRect) {
    // Starting the view offscreen allows it to be invisible until the annotation manager
    // sets it to the correct point on the map.
    let offscreenFrame = frame.offsetBy(dx: -10000, dy: -10000)
    super.reactSetFrame(offscreenFrame)
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
    
    guard let reactChildrenView = reactChildrenView, let annotationManager = annotationManager, let point = point else {
      return
    }
    
    do {
      try add(
        reactChildrenView: reactChildrenView,
        annotationManager: annotationManager,
        point: point
      )
      isAdded = true
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error adding annotation", error: error)
    }
  }

  private func add(reactChildrenView: UIView, annotationManager: ViewAnnotationManager, point: Point) throws {
    let options = ViewAnnotationOptions(
      geometry: Geometry.point(point),
      width: reactChildrenView.frame.width,
      height: reactChildrenView.frame.height,
      allowOverlap: allowOverlap,
      anchor: .center
    )
    try annotationManager.add(self, id: id, options: options)
  }
  
  private func updateIfPossible() {
    if !isAdded {
      return
    }
    
    guard let reactChildrenView = reactChildrenView, let annotationManager = annotationManager else {
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
        dx: (anchorX * 2 - 1) * (reactChildrenView.frame.width / 2),
        dy: (anchorY * 2 - 1) * (reactChildrenView.frame.height / 2) * -1
      )
    }
    
    do {
      try update(
        reactChildrenView: self,
        annotationManager: annotationManager,
        geometry: geometry,
        offset: offset
      )
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error updating annotation", error: error)
    }
  }
  
  private func update(reactChildrenView: UIView, annotationManager: ViewAnnotationManager, geometry: GeometryConvertible?, offset: CGVector?) throws {
    let options = ViewAnnotationOptions(
      geometry: geometry,
      allowOverlap: allowOverlap,
      offsetX: offset?.dx,
      offsetY: offset?.dy
    )
    try annotationManager.update(self, options: options)
  }
  
  /// There is a Mapbox bug where `selected` does not cause the marker to move to the front, so we can't simply update the component.
  /// This forces that effect. See https://github.com/mapbox/mapbox-maps-ios/issues/1599.
  private func setSelected() throws {
    if let options = annotationManager?.options(for: self) {
      do {
        annotationManager?.remove(self)
        try annotationManager?.add(self, id: id, options: options)
      } catch {
        Logger.log(level: .error, message: "[MarkerView] Error selecting annotation", error: error)
      }
    }
  }
  
  private func removeIfPossible() {
    annotationManager?.remove(self)
  }
}
