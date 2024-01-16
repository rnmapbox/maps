@_spi(Experimental) import MapboxMaps

#if RNMBX_11
#else
typealias ViewportManager = Viewport
#endif

@objc(RNMBXViewport)
open class RNMBXViewport : UIView, RNMBXMapComponent, ViewportStatusObserver {
  var mapView: MapView? = nil
    
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
    onStatusChanged?([
      "type": "statuschanged",
      "payload": [
        "from": statusToMap(fromStatus),
        "to": statusToMap(toStatus),
        "reason": reasonToString(reason)
      ]])
  }
  
  @objc
  public var transitionsToIdleUponUserInteraction: NSNumber? = nil {
    didSet {
      if let mapView = mapView {
        apply(mapView: mapView)
      }
    }
  }
  
  public func waitForStyleLoad() -> Bool {
    true
  }

  public func addToMap(_ map: RNMBXMapView, style: Style) {
    mapView = map.mapView
    applyHasStatusChanged(mapView: mapView!)
    apply(mapView: map.mapView)
  }

  public func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    if (hasStatusChanged) {
      map.mapView.viewport.removeStatusObserver(self)
    }
    self.mapView = nil
    return true
  }

  func apply(mapView: MapView) {
    if let value = transitionsToIdleUponUserInteraction {
      var origOptions = mapView.viewport.options
      origOptions.transitionsToIdleUponUserInteraction = value.boolValue
      mapView.viewport.options = origOptions
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
  
  func getState() -> [String:Any] {
    guard let mapView = mapView else {
      Logger.log(level:.error, message: "mapView is null in RNMBXViewport.getState")
      return [:]
    }
    return statusToMap(mapView.viewport.status)
  }
  
  func idle() {
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
    guard let kind = from["kind"] as? String else {
      Logger.log(level:.error, message: "no kind found in state")
      return nil
    }
    
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
  
  func transitionTo(
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
