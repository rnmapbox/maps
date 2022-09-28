import MapboxMaps
import UIKit

class RCTMGLMarkerView: UIView, RCTMGLMapComponent {
  // MARK: - Instance variables
  
  static let key = "RCTMGLMarkerView"
  let id: String = "marker-\(UUID().uuidString)"
  
  var map: RCTMGLMapView?
  var reactChildrenView: UIView?
  
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
      let hasBecomeSelected = isSelected && !oldValue
      
      if hasBecomeSelected {
        try? setSelected()
      } else {
        update()
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
  }

  // MARK: - RCTMGLMapComponent methods

  func addToMap(_ map: RCTMGLMapView, style: Style) {
    self.map = map
    add()
  }

  func removeFromMap(_ map: RCTMGLMapView) {
    remove()
  }
  
  // MARK: - React methods
  
  override func reactSetFrame(_ frame: CGRect) {
    let frameDidChange = !self.frame.equalTo(frame)

    // Starting the view offscreen allows it to be invisible until the annotation manager
    // sets it to the correct point on the map.
    if (frameDidChange) {
      super.reactSetFrame(frame.offsetBy(dx: -10000, dy: -10000))
    } else {
      super.reactSetFrame(frame)
    }
    
    guard let child = self.subviews.first else {
      return
    }
    
    reactChildrenView = child
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
    
    guard let annotationManager = annotationManager, let point = point else {
      return
    }
    
    do {
      let options = ViewAnnotationOptions(
        geometry: Geometry.point(point),
        width: self.bounds.width,
        height: self.bounds.height,
        allowOverlap: allowOverlap,
        anchor: .center
      )
      try annotationManager.add(self, id: id, options: options)
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
        dx: (anchorX * 2 - 1) * (self.bounds.width / 2),
        dy: (anchorY * 2 - 1) * (self.bounds.height / 2) * -1
      )
    }
    
    do {
      let options = ViewAnnotationOptions(
        geometry: geometry,
        width: self.bounds.width,
        height: self.bounds.height,
        allowOverlap: allowOverlap,
        offsetX: offset?.dx,
        offsetY: offset?.dy
      )
      try annotationManager.update(self, options: options)
    } catch {
      Logger.log(level: .error, message: "[MarkerView] Error updating annotation", error: error)
    }
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
  
  private func remove() {
    annotationManager?.remove(self)
  }
}
