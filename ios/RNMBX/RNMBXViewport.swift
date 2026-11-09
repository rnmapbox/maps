@_spi(Experimental) import MapboxMaps

@objc(RNMBXViewport)
open class RNMBXViewport : UIView, RNMBXMapAndMapViewComponent, ViewportStatusObserver {
  var mapView: MapView? = nil
  weak var map: RNMBXMapView? = nil
  var gestureHandler: RNMBXViewportGestureHandler? = nil
  var gestureIdlePending = false

  // MARK: React properties
  @objc
  public var onStatusChanged: RCTBubblingEventBlock? = nil

  @objc
  public var hasStatusChanged: Bool = false {
    didSet {
      if let mapView = mapView {
        applyHasStatusChanged(mapView: mapView)
      }
    }
  }

  func applyHasStatusChanged(mapView: MapView) {
    if (hasStatusChanged) {
      mapView.viewport.addStatusObserver(self)
    } else {
      mapView.viewport.removeStatusObserver(self)
    }
  }

  public func viewportStatusDidChange(from fromStatus: ViewportStatus,
                               to toStatus: ViewportStatus,
                               reason: ViewportStatusChangeReason)
  {
    var reason = reason
    if gestureIdlePending, case .idle = toStatus, reason == .idleRequested {
      gestureIdlePending = false
      reason = .userInteraction
    }
    onStatusChanged?([
      "type": "statuschanged",
      "payload": [
        "from": statusToMap(fromStatus),
        "to": statusToMap(toStatus),
        "reason": reasonToString(reason)
      ]])
  }

  /// `NSNumber` (boolean) or a dictionary of gesture names to booleans.
  @objc
  public var transitionsToIdleUponUserInteraction: Any? = nil {
    didSet {
      if let mapView = mapView {
        apply(mapView: mapView)
      }
    }
  }

  public func waitForStyleLoad() -> Bool {
    true
  }

  public func addToMap(_ map: RNMBXMapView, mapView: MapView, style: Style) {
    self.mapView = mapView
    self.map = map
    applyHasStatusChanged(mapView: mapView)
    apply(mapView: mapView)
  }

  public func removeFromMap(_ map: RNMBXMapView, mapView: MapView, reason: RemovalReason) -> Bool {
    if (hasStatusChanged) {
      mapView.viewport.removeStatusObserver(self)
    }
    gestureHandler?.detach()
    gestureHandler = nil
    restoreTransitionsToIdleUponUserInteraction(mapView: mapView)
    self.mapView = nil
    self.map = nil
    return true
  }

  /// The map's value before this Viewport changed it, restored on removal so the option doesn't outlive the component.
  private var savedTransitionsToIdleUponUserInteraction: Bool? = nil

  func apply(mapView: MapView) {
    if let value = transitionsToIdleUponUserInteraction as? NSNumber {
      gestureHandler?.detach()
      gestureHandler = nil
      setSdkTransitionsToIdle(mapView: mapView, value.boolValue)
    } else if let value = transitionsToIdleUponUserInteraction as? [String: Any] {
      let gestures = RNMBXViewportGestureHandler.IdleGestures(value)
      if let gestureHandler = gestureHandler {
        gestureHandler.idleGestures = gestures
      } else if let map = map {
        gestureHandler = RNMBXViewportGestureHandler(map: map, mapView: mapView, idleGestures: gestures) { [weak self] in
          guard let self = self else { return }
          self.gestureIdlePending = self.hasStatusChanged
        }
      }
      setSdkTransitionsToIdle(mapView: mapView, false)
    } else if let gestureHandler = gestureHandler {
      gestureHandler.detach()
      self.gestureHandler = nil
      restoreTransitionsToIdleUponUserInteraction(mapView: mapView)
    }
  }

  private func setSdkTransitionsToIdle(mapView: MapView, _ value: Bool) {
    var options = mapView.viewport.options
    if savedTransitionsToIdleUponUserInteraction == nil {
      savedTransitionsToIdleUponUserInteraction = options.transitionsToIdleUponUserInteraction
    }
    options.transitionsToIdleUponUserInteraction = value
    mapView.viewport.options = options
  }

  func restoreTransitionsToIdleUponUserInteraction(mapView: MapView) {
    if let saved = savedTransitionsToIdleUponUserInteraction {
      var options = mapView.viewport.options
      options.transitionsToIdleUponUserInteraction = saved
      mapView.viewport.options = options
      savedTransitionsToIdleUponUserInteraction = nil
    }
  }
  
  func reasonToString(_ reason: ViewportStatusChangeReason) -> String {
    switch (reason) {
    case .idleRequested:
      return "IdleRequested"
    case .transitionFailed:
      return "TransitionFailed"
    case .transitionStarted:
      return "TransitionStarted"
    case .transitionSucceeded:
      return "TransitionSucceeded"
    case .userInteraction:
      return "UserInteraction"
    default:
      return "Unknown:\(reason)"
    }
  }

  func stateToMap(_ state: ViewportState) -> [String: Any] {
    if let state = state as? FollowPuckViewportState {
      return ["kind": "followPuck"]
    } else if let state = state as? OverviewViewportState {
      return ["kind": "overview"]
    } else {
      return ["kind": "custom", "impl": "\(type(of: state))"]
    }
  }
  
  func transitionToMap(_ transition: ViewportTransition) -> [String:Any] {
    if let transition = transition as? DefaultViewportTransition {
      return ["kind": "default", "maxDurationMs": transition.options.maxDuration * 1000.0] as [String:Any]
    } else if let transition = transition as? ImmediateViewportTransition {
      return ["kind": "immediate"]
    } else {
      return ["kind": "unknown", "impl": "\(type(of: transition))"]
    }
  }
  
  func statusToMap(_ status: ViewportStatus) -> [String: Any] {
    switch (status) {
    case .idle:
      return ["kind": "idle"]
    case .state(let state):
      return ["kind": "state",
       "state": stateToMap(state)
      ] as [String : Any]
    case .transition(let transition, let toState):
      return ["kind": "transition",
       "transition": transitionToMap(transition),
       "toState": stateToMap(toState)
      ] as [String:Any]
    }
  }
  
  @objc public func getState() -> [String:Any] {
    guard let mapView = mapView else {
      Logger.log(level:.error, message: "mapView is null in RNMBXViewport.getState")
      return [:]
    }
    return statusToMap(mapView.viewport.status)
  }
  
  @objc public func idle() {
    guard let mapView = mapView else {
      Logger.log(level:.error, message: "mapView is null in RNMBXViewport.idle")
      return
    }
    mapView.viewport.idle()
  }
  
  func toState(_ viewport: ViewportManager?,_ state: [String:Any]) -> ViewportState? {
    guard let viewport = viewport else {
      Logger.log(level:.error, message: "no viewport")
      return nil
    }
    guard let kind = state["kind"] as? String else {
      Logger.log(level:.error, message: "no kind found in state")
      return nil
    }
    
    switch (kind) {
    case "followPuck":
      return viewport.makeFollowPuckViewportState(options:
        parseFollowViewportOptions(state)
      )
    case "overview":
      if let options = parseOverviewViewportOptions(state) {
        return viewport.makeOverviewViewportState(options: options)
      } else {
        Logger.log(level:.error, message: "Cannot parse overview options")
        return nil
      }
    default:
      Logger.log(level:.error, message: "unexpected state kind: \(kind)")
      return nil
    }
  }
  
  func parseFollowViewportOptions(_ state: [String:Any]) -> FollowPuckViewportStateOptions {
    var result = FollowPuckViewportStateOptions()
    if let options = state["options"] as? [String:Any] {
      if let zoom = options["zoom"] as? String, (zoom == "keep") {
        result.zoom = nil
      } else if let zoom = options["zoom"] as? Double {
        result.zoom = zoom
      } else if options["zoom"] != nil {
        Logger.log(level: .error, message: "parseFollowViewportOptions expected zoom to be number or 'keep', but was \(options["zoom"])")
      }
      
      if let pitch = options["pitch"] as? String, (pitch == "keep") {
        result.pitch = nil
      } else if let pitch = options["pitch"] as? Double {
        result.pitch = pitch
      } else if options["pitch"] != nil{
        Logger.log(level: .error, message: "parseFollowViewportOptions expected pitch to be number or 'keep', but was \(options["pitch"])")
      }
      
      if let bearing = options["bearing"] as? String {
        switch (bearing) {
        case "keep":
          result.bearing = nil
        case "course":
          result.bearing = .course
        case "heading":
          result.bearing = .heading
        default:
          Logger.log(level: .error, message: "bearing expected to be a number or 'keep' or 'course' or 'heading', but was \(options["bearing"])")
        }
      } else if let bearing = options["bearing"] as? NSNumber {
        result.bearing = .constant(bearing.doubleValue)
      } else if options["bearing"] != nil {
        Logger.log(level: .error, message: "bearing expected to be a number or 'keep' or 'course' or 'heading', but was \(options["bearing"])")
      }
      
      if let padding = options["padding"] as? String, (padding == "keep") {
        result.padding = nil
      } else if let padding = options["padding"] as? [String: NSNumber] {
        result.padding = toPadding(padding)
      } else if (options["padding"] != nil) {
        Logger.log(level: .error, message: "padding expected to be an object or 'keep' or but was \(options["bearing"])")
      }
    }
    
    return result
  }
  
  func parseOverviewViewportOptions(_ state: [String:Any]) -> OverviewViewportStateOptions? {
    guard let options = state["options"] as? [String:Any] else {
      return nil
    }
    guard let geometry = options["geometry"], let geometry = toGeometry(geometry) else {
      return nil
    }

    var result = OverviewViewportStateOptions(geometry: geometry)

    if let padding = options["padding"] as? [String: NSNumber] {
      result.padding = toPadding(padding)
    } else if (options["padding"] != nil) {
      Logger.log(level: .error, message: "padding expected to be an object or nil or but was \(options["padding"])")
    }

    if options["bearing"] == nil {
      result.bearing = (CLLocationDirection?)(nil)
    } else if let bearing = options["bearing"] as? NSNumber {
      result.bearing = bearing.doubleValue
    } else if options["bearing"] != nil {
      Logger.log(level: .error, message: "bearing expected to be a number or nil but was \(options["bearing"])")
    }

    if options["pitch"] == nil {
      result.pitch = (CGFloat?)(nil)
    } else if let pitch = options["pitch"] as? Double {
      result.pitch = pitch
    } else if options["pitch"] != nil{
      Logger.log(level: .error, message: "parseOverviewViewportOptions expected pitch to be number or nil, but was \(options["pitch"])")
    }

    if let animationDuration = options["animationDuration"] as? Double {
      result.animationDuration = animationDuration
    } else if let animationDuration = options["animationDuration"] as? NSNumber {
      result.animationDuration = animationDuration.doubleValue
    } else if options["animationDuration"] != nil {
      Logger.log(level: .error, message: "parseOverviewViewportOptions expected animationDuration to be a number or nil but was \(options["animationDuration"])")
    }

    return result
  }
  
  func toGeometry(_ geometry: Any) -> GeometryConvertible? {
    return logged("toGeometry") {
      let jsonData = try JSONSerialization.data(withJSONObject: geometry)
      let geometry = try JSONDecoder().decode(Geometry.self, from: jsonData)
      return geometry
    }
  }
  
  func toTransition(_ from: [String: Any], _ viewport: ViewportManager?) -> ViewportTransition? {
    guard let viewport = viewport else {
      Logger.log(level:.error, message: "no viewport")
      return nil
    }
    let kind = from["kind"] as? String ?? "default"

    switch (kind) {
    case "immediate":
      return viewport.makeImmediateViewportTransition()
    case "default":
      var options = DefaultViewportTransitionOptions()
      if let maxDurationMs = from["maxDurationMs"] as? NSNumber {
        options.maxDuration = maxDurationMs.doubleValue/1000.0
      }
      return viewport.makeDefaultViewportTransition(
        options: options
      )

    default:
      Logger.log(level:.error, message: "unexpected transition kind: \(kind)")
      return nil
    }
  }
  
  @objc public func transitionTo(
    state: [String: Any],
    transition: [String: Any],
    resolve: @escaping (NSNumber) -> Void
  ) {
    guard let mapView = mapView else {
      Logger.log(level:.error, message: "mapView is null in RNMBXViewport.transitionTo")
      return
    }
    guard let state = toState(mapView.viewport, state) else {
      Logger.log(level:.error, message: "unable to parse toState in RNMBXViewport.transitionTo")
      return
    }
    guard let transition = toTransition(transition, mapView.viewport) else {
      Logger.log(level:.error, message: "unable to parse transition in RNMBXViewport.transitionTo")
      return
    }
    mapView.viewport.transition(to: state, transition: transition) { completed in
      resolve(NSNumber(booleanLiteral: completed))
    }
  }
}


func toPadding(_ value: [String: NSNumber]) -> UIEdgeInsets {
  var result = UIEdgeInsets()
  
  if let top = value["top"] as? NSNumber {
    result.top = top.CGFloat
  }
  
  if let bottom = value["bottom"] as? NSNumber {
    result.bottom = bottom.CGFloat
  }
  
  if let left = value["left"] as? NSNumber {
    result.left = left.CGFloat
  }
  
  if let right = value["right"] as? NSNumber {
    result.right = right.CGFloat
  }
  
  return result
}

/// Implements the object form of `transitionsToIdleUponUserInteraction`: the SDK's own option is off,
/// and this idles the viewport only when one of the selected gestures begins.
class RNMBXViewportGestureHandler: NSObject, GestureManagerDelegate, ViewportStatusObserver {
  struct IdleGestures: Equatable {
    var pan = true
    var pinch = true
    var doubleTap = true
    var rotate = true
    var pitch = true

    init(_ value: [String: Any]) {
      pan = (value["pan"] as? NSNumber)?.boolValue ?? true
      pinch = (value["pinch"] as? NSNumber)?.boolValue ?? true
      doubleTap = (value["doubleTap"] as? NSNumber)?.boolValue ?? true
      rotate = (value["rotate"] as? NSNumber)?.boolValue ?? true
      pitch = (value["pitch"] as? NSNumber)?.boolValue ?? true
    }
  }

  var idleGestures: IdleGestures {
    didSet { updateZoomOverrides() }
  }

  private weak var map: RNMBXMapView?
  private weak var mapView: MapView?
  private let willIdle: () -> Void

  private var cameraChangedCancelable: AnyCancelable? = nil
  /// The focal point this handler set, or nil if it isn't managing the focal point.
  private var managedFocalPoint: CGPoint? = nil
  private var managesPinchPan = false

  init(map: RNMBXMapView, mapView: MapView, idleGestures: IdleGestures, willIdle: @escaping () -> Void) {
    self.map = map
    self.mapView = mapView
    self.idleGestures = idleGestures
    self.willIdle = willIdle
    super.init()
    map.addGestureDelegate(self)
    mapView.viewport.addStatusObserver(self)
    updateZoomOverrides()
  }

  func detach() {
    stopZoomOverrides()
    map?.removeGestureDelegate(self)
    mapView?.viewport.removeStatusObserver(self)
  }

  // MARK: GestureManagerDelegate

  func gestureManager(_ gestureManager: GestureManager, didBegin gestureType: GestureType) {
    guard let mapView = mapView else { return }
    let idles: Bool
    switch gestureType {
    case .pan:
      idles = idleGestures.pan
    case .pinch, .quickZoom:
      idles = idleGestures.pinch
    case .doubleTapToZoomIn, .doubleTouchToZoomOut:
      idles = idleGestures.doubleTap
    case .rotation:
      idles = idleGestures.rotate
    case .pitch:
      idles = idleGestures.pitch
    @unknown default:
      idles = true
    }

    if idles {
      // the SDK option, when on, also cancels camera animations on touch
      mapView.camera.cancelAnimations()
      if case .idle = mapView.viewport.status { return }
      willIdle()
      mapView.viewport.idle()
    } else if let followPuck = followPuckState(mapView.viewport.status) {
      switch gestureType {
      case .pinch, .quickZoom, .doubleTapToZoomIn, .doubleTouchToZoomOut:
        followPuck.options.zoom = nil
      case .rotation:
        followPuck.options.bearing = nil
      case .pitch:
        followPuck.options.pitch = nil
      default:
        break
      }
    }
  }

  func gestureManager(_ gestureManager: GestureManager, didEnd gestureType: GestureType, willAnimate: Bool) {}

  func gestureManager(_ gestureManager: GestureManager, didEndAnimatingFor gestureType: GestureType) {}

  // MARK: ViewportStatusObserver

  func viewportStatusDidChange(from fromStatus: ViewportStatus, to toStatus: ViewportStatus, reason: ViewportStatusChangeReason) {
    updateZoomOverrides()
  }

  // MARK: Zooming around the puck

  private func followPuckState(_ status: ViewportStatus) -> FollowPuckViewportState? {
    switch status {
    case .state(let state):
      return state as? FollowPuckViewportState
    case .transition(_, let toState):
      return toState as? FollowPuckViewportState
    case .idle:
      return nil
    }
  }

  private func updateZoomOverrides() {
    guard let mapView = mapView else { return }
    let following: Bool
    if case .state(let state) = mapView.viewport.status, state is FollowPuckViewportState {
      following = true
    } else {
      following = false
    }
    if following && (!idleGestures.pinch || !idleGestures.doubleTap) {
      startZoomOverrides(mapView)
    } else {
      stopZoomOverrides()
    }
  }

  private func startZoomOverrides(_ mapView: MapView) {
    guard cameraChangedCancelable == nil else { return }

    if mapView.gestures.options.focalPoint == nil {
      let focalPoint = puckScreenPoint(mapView)
      mapView.gestures.options.focalPoint = focalPoint
      managedFocalPoint = focalPoint
    }

    // pinch ignores focalPoint while pinchPanEnabled is set, and it makes a drifting pinch also begin a pan
    if !pinchPanSetByApp() && mapView.gestures.options.pinchPanEnabled {
      mapView.gestures.options.pinchPanEnabled = false
      managesPinchPan = true
    }

    cameraChangedCancelable = mapView.mapboxMap.onCameraChanged.observe { [weak self, weak mapView] _ in
      guard let self = self, let mapView = mapView, let managed = self.managedFocalPoint else { return }
      guard mapView.gestures.options.focalPoint == managed else {
        // someone else set a focal point, theirs wins
        self.managedFocalPoint = nil
        return
      }
      let focalPoint = self.puckScreenPoint(mapView)
      if focalPoint != managed {
        mapView.gestures.options.focalPoint = focalPoint
        self.managedFocalPoint = focalPoint
      }
    }
  }

  private func stopZoomOverrides() {
    cameraChangedCancelable?.cancel()
    cameraChangedCancelable = nil
    guard let mapView = mapView else { return }
    if let managed = managedFocalPoint, mapView.gestures.options.focalPoint == managed {
      mapView.gestures.options.focalPoint = nil
    }
    managedFocalPoint = nil
    if managesPinchPan && !pinchPanSetByApp() && !mapView.gestures.options.pinchPanEnabled {
      mapView.gestures.options.pinchPanEnabled = true
    }
    managesPinchPan = false
  }

  private func pinchPanSetByApp() -> Bool {
    return map?.gestureSettings.pinchPanEnabled != nil || map?.scrollEnabled == false
  }

  /// While following, the puck is at the centre of the padded viewport.
  private func puckScreenPoint(_ mapView: MapView) -> CGPoint {
    let padding = mapView.mapboxMap.cameraState.padding
    let bounds = mapView.bounds
    return CGPoint(
      x: padding.left + (bounds.width - padding.left - padding.right) / 2.0,
      y: padding.top + (bounds.height - padding.top - padding.bottom) / 2.0
    )
  }
}
