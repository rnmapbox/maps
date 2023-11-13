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
  
  func waitForStyleLoad() -> Bool {
    true
  }

  func addToMap(_ map: RNMBXMapView, style: Style) {
    mapView = map.mapView
    applyHasStatusChanged(mapView: mapView!)
    apply(mapView: map.mapView)
  }

  func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
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
  
  func toState(_ from: [String:String], _ viewport: ViewportManager?) -> ViewportState? {
    guard let viewport = viewport else {
      Logger.log(level:.error, message: "no viewport")
      return nil
    }
    guard let kind = from["kind"] else {
      Logger.log(level:.error, message: "no kind found in state")
      return nil
    }
    
    switch (kind) {
    case "followPuck":
      return viewport.makeFollowPuckViewportState()
//    case "overview":
//      viewport.makeOverviewViewportState(options: )
    default:
      Logger.log(level:.error, message: "unexpected state kind: \(kind)")
      return nil
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
    state: [String: String],
    transition: [String: Any],
    resolve: @escaping (NSNumber) -> Void
  ) {
    guard let mapView = mapView else {
      Logger.log(level:.error, message: "mapView is null in RNMBXViewport.transitionTo")
      return
    }
    guard let state = toState(state, mapView.viewport) else {
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
