import MapboxMaps

@objc(RNMBXPointAnnotationManagerView)
open class RNMBXPointAnnotationManagerView: RNMBXMapComponentBase {
  @objc public var id: String? = nil
  @objc public var isDefault: Bool = false

  @objc public var slot: String? = nil { didSet { applyProps() } }
  @objc public var iconAllowOverlap: NSNumber? = nil { didSet { applyProps() } }
  @objc public var iconIgnorePlacement: NSNumber? = nil { didSet { applyProps() } }
  @objc public var iconOptional: NSNumber? = nil { didSet { applyProps() } }
  @objc public var textAllowOverlap: NSNumber? = nil { didSet { applyProps() } }
  @objc public var textIgnorePlacement: NSNumber? = nil { didSet { applyProps() } }
  @objc public var textOptional: NSNumber? = nil { didSet { applyProps() } }

  private var pointAnnotations: [RNMBXPointAnnotation] = []
  private var nativeManager: RNMBXPointAnnotationManager? = nil

  // The Mapbox annotation manager doesn't need to wait for style load itself, but its
  // backing layer does — defer setup until the style is ready.
  public func waitForStyleLoad() -> Bool {
    return true
  }

  // MARK: - children

  @objc public override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    insertReactSubviewInternal(subview, at: atIndex)
  }

  @objc public func insertReactSubviewInternal(_ subview: UIView!, at atIndex: Int) {
    guard let annotation = subview as? RNMBXPointAnnotation else {
      Logger.log(level: .warn, message: "PointAnnotationManager: only PointAnnotation children are supported")
      return
    }
    pointAnnotations.insert(annotation, at: min(atIndex, pointAnnotations.count))
    if let map = map, let mapView = map.mapView {
      ensureManager(map)
      annotation.ownerManager = nativeManager
      annotation.addToMap(map, mapView: mapView, style: mapView.mapboxMap.style)
    }
  }

  @objc public override func removeReactSubview(_ subview: UIView!) {
    removeReactSubviewInternal(subview)
  }

  @objc public func removeReactSubviewInternal(_ subview: UIView!) {
    guard let annotation = subview as? RNMBXPointAnnotation else { return }
    if let map = map, let mapView = map.mapView {
      _ = annotation.removeFromMap(map, mapView: mapView, reason: .ViewRemoval)
    }
    annotation.ownerManager = nil
    pointAnnotations.removeAll { $0 == annotation }
  }

  @objc public override func didUpdateReactSubviews() {
    // Children are managed through the annotation manager, not the UIView hierarchy.
  }

  // MARK: - lifecycle

  private func ensureManager(_ map: RNMBXMapView) {
    if nativeManager != nil { return }
    guard let mapView = map.mapView else { return }
    if isDefault {
      if let existing = map.defaultPointAnnotationManagerView, existing !== self {
        Logger.log(level: .warn, message: "PointAnnotationManager: multiple default managers declared, ignoring extra default")
      } else {
        map.defaultPointAnnotationManagerView = self
      }
      nativeManager = map.pointAnnotationManager
    } else {
      let manager = RNMBXPointAnnotationManager(annotations: mapView.annotations, mapView: mapView, id: id)
      map.registerPointAnnotationManager(manager)
      nativeManager = manager
    }
    applyProps()
  }

  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)
    guard let mapView = map.mapView else { return }
    ensureManager(map)
    for annotation in pointAnnotations {
      annotation.ownerManager = nativeManager
      annotation.addToMap(map, mapView: mapView, style: style)
    }
  }

  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    guard let mapView = map.mapView else { return super.removeFromMap(map, reason: reason) }
    for annotation in pointAnnotations {
      _ = annotation.removeFromMap(map, mapView: mapView, reason: reason)
      annotation.ownerManager = nil
    }
    if let manager = nativeManager {
      if isDefault {
        // The default manager is shared with bare annotations; leave it in place,
        // just clear the configuration this view applied.
        manager.manager.slot = nil
        manager.manager.iconAllowOverlap = nil
        manager.manager.iconIgnorePlacement = nil
        manager.manager.iconOptional = nil
        manager.manager.textAllowOverlap = nil
        manager.manager.textIgnorePlacement = nil
        manager.manager.textOptional = nil
      } else {
        map.unregisterPointAnnotationManager(manager)
        mapView.annotations.removeAnnotationManager(withId: manager.manager.layerId)
      }
    }
    if map.defaultPointAnnotationManagerView === self {
      map.defaultPointAnnotationManagerView = nil
    }
    nativeManager = nil
    return super.removeFromMap(map, reason: reason)
  }

  private func applyProps() {
    guard let manager = nativeManager?.manager else { return }
    manager.slot = slot
    manager.iconAllowOverlap = iconAllowOverlap?.boolValue
    manager.iconIgnorePlacement = iconIgnorePlacement?.boolValue
    manager.iconOptional = iconOptional?.boolValue
    manager.textAllowOverlap = textAllowOverlap?.boolValue
    manager.textIgnorePlacement = textIgnorePlacement?.boolValue
    manager.textOptional = textOptional?.boolValue
  }
}
