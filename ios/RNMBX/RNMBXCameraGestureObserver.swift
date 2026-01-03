import MapboxMaps

@objc(RNMBXCameraGestureObserver)
public class RNMBXCameraGestureObserver: RNMBXMapComponentBase, GestureManagerDelegate {
  // MARK: Props from Fabric
  @objc public var quietPeriodMs: NSNumber? = nil
  @objc public var maxIntervalMs: NSNumber? = nil

  // Event callback set from the ComponentView when JS subscribes
  @objc public var onMapSteady: ((_ reason: String, _ idleDurationMs: NSNumber?, _ lastGestureType: String?, _ timestamp: NSNumber) -> Void)? = nil

  private var hasOnMapSteady: Bool = false

  @objc public func setHasOnMapSteady(_ hasOnMapSteady: Bool) {
    self.hasOnMapSteady = hasOnMapSteady
  }

  // MARK: Internal state
  private var activeAnimations: Int = 0
  private var isGestureActive: Bool = false
  private var lastGestureType: String? = nil
  // Time when the last transition (gesture without follow-up anim or camera animation) ended
  private var lastTransitionEndedAtMs: Double? = nil
  private var quietTimer: DispatchSourceTimer? = nil
  private var timeoutTimer: DispatchSourceTimer? = nil
  private var emittedForCurrentActivity: Bool = false

  private var _cancelables = Set<AnyCancelable>()

  private var quietMs: Double { (quietPeriodMs?.doubleValue) ?? 200.0 }
  private var maxMs: Double? { maxIntervalMs?.doubleValue }

  private func nowMs() -> Double { Date().timeIntervalSince1970 * 1000.0 }
  private func timestamp() -> NSNumber { NSNumber(value: nowMs()) }

  private var canEmitSteady: Bool {
    activeAnimations == 0 && !isGestureActive && lastTransitionEndedAtMs != nil
  }

  private func normalizeGestureType(_ gestureType: MapboxMaps.GestureType) -> String {
    switch gestureType {
    case .pan: return "pan"
    case .pinch: return "pinch"
    case .rotation: return "rotate"
    case .pitch: return "pitch"
    default: return "\(gestureType)"
    }
  }

  private func debugLog(_ message: String) {
    #if DEBUG
    print("[RNMBXCameraGestureObserver] \(message); activeAnimations=\(activeAnimations) isGestureActive=\(isGestureActive) lastTransitionEnd=\(lastTransitionEndedAtMs ?? -1)")
    #endif
  }

  private func scheduleTimer(
    _ timer: inout DispatchSourceTimer?,
    delay: Double,
    handler: @escaping @convention(block) () -> Void
  ) {
    timer?.cancel()
    guard delay > 0 else {
      timer = nil
      return
    }
    let newTimer = DispatchSource.makeTimerSource(queue: .main)
    newTimer.schedule(deadline: .now() + .milliseconds(Int(delay)))
    newTimer.setEventHandler(handler: handler)
    newTimer.resume()
    timer = newTimer
  }

  private func cancelQuietTimer() {
    quietTimer?.cancel()
    quietTimer = nil
  }

  private func cancelTimeoutTimer() {
    timeoutTimer?.cancel()
    timeoutTimer = nil
  }

  private func scheduleQuietCheck() {
    let delay = quietMs
    guard delay > 0 else {
      cancelQuietTimer()
      maybeEmitSteady()
      return
    }
    debugLog("scheduleQuietCheck in \(Int(delay))ms")
    scheduleTimer(&quietTimer, delay: delay) { [weak self] in
      self?.debugLog("quiet timer fired")
      self?.maybeEmitSteady()
    }
  }

  private func scheduleTimeout() {
    guard let delay = maxMs else { return }
    scheduleTimer(&timeoutTimer, delay: delay) { [weak self] in
      self?.emitTimeout()
    }
  }

  private func markActivity(gestureType: String? = nil) {
    if let gestureType = gestureType { lastGestureType = gestureType }
    emittedForCurrentActivity = false
    scheduleQuietCheck()
    scheduleTimeout()
  }

  private func maybeEmitSteady() {
    guard canEmitSteady else { return }
    guard let lastEnd = lastTransitionEndedAtMs else { return }
    let sinceEnd = nowMs() - lastEnd
    guard sinceEnd >= quietMs else { return }
    emitSteady(idleDurationMs: sinceEnd)
  }

  private func emitSteady(idleDurationMs: Double) {
    if emittedForCurrentActivity { return }
    cancelQuietTimer()
    cancelTimeoutTimer()
    let idleNs = NSNumber(value: idleDurationMs)
    let gesture = lastGestureType
    debugLog("EMIT steady idleDurationMs=\(idleDurationMs) lastGestureType=\(gesture ?? "nil")")
    onMapSteady?("steady", idleNs, gesture, timestamp())
    lastGestureType = nil
    emittedForCurrentActivity = true
  }

  private func emitTimeout() {
    cancelQuietTimer()
    debugLog("EMIT timeout lastGestureType=\(lastGestureType ?? "nil")")
    onMapSteady?("timeout", nil, lastGestureType, timestamp())
    scheduleTimeout()
  }

  // MARK: RNMBXMapComponent
  public override func addToMap(_ map: RNMBXMapView, style: Style) {
    super.addToMap(map, style: style)

    guard hasOnMapSteady else { return }

    let camera = map.mapView.camera!

    // Camera animator lifecycle
    _cancelables.insert(camera.onCameraAnimatorStarted.observe { [weak self] _ in
      guard let self = self else { return }
      self.activeAnimations += 1
      self.lastTransitionEndedAtMs = nil
      self.markActivity()
      self.debugLog("camera animator started")
    })
    let handleAnimatorEnd: (CameraAnimator) -> Void = { [weak self] _ in
      guard let self = self else { return }
      self.activeAnimations -= 1
      #if DEBUG
      if self.activeAnimations < 0 {
        print("[RNMBXCameraGestureObserver] WARNING: activeAnimations went negative, resetting to 0")
        self.activeAnimations = 0
      }
      #endif
      self.lastTransitionEndedAtMs = self.nowMs()
      self.scheduleQuietCheck()
      self.debugLog("camera animator ended")
    }
    _cancelables.insert(camera.onCameraAnimatorFinished.observe(handleAnimatorEnd))
    _cancelables.insert(camera.onCameraAnimatorCancelled.observe(handleAnimatorEnd))

    // Subscribe to gestures as a secondary observer (multicast from RNMBXMapView)
    map.addGestureDelegate(self)
    debugLog("addToMap and subscribed to gestures")
  }

  public override func removeFromMap(_ map: RNMBXMapView, reason: RemovalReason) -> Bool {
    _cancelables.forEach { $0.cancel() }
    _cancelables.removeAll()
    map.removeGestureDelegate(self)
    debugLog("removeFromMap and unsubscribed from gestures")
    cancelQuietTimer()
    cancelTimeoutTimer()
    return super.removeFromMap(map, reason: reason)
  }

  // MARK: GestureManagerDelegate
  public func gestureManager(_ gestureManager: MapboxMaps.GestureManager, didBegin gestureType: MapboxMaps.GestureType) {
    isGestureActive = true
    lastGestureType = normalizeGestureType(gestureType)
    lastTransitionEndedAtMs = nil
    markActivity(gestureType: lastGestureType)
    debugLog("gesture didBegin type=\(lastGestureType ?? "")")
  }

  public func gestureManager(_ gestureManager: MapboxMaps.GestureManager, didEnd gestureType: MapboxMaps.GestureType, willAnimate: Bool) {
    lastGestureType = normalizeGestureType(gestureType)
    if !willAnimate {
      isGestureActive = false
      lastTransitionEndedAtMs = nowMs()
    }
    markActivity(gestureType: lastGestureType)
    debugLog("gesture didEnd type=\(lastGestureType ?? "") willAnimate=\(willAnimate) -> isGestureActive=\(isGestureActive)")
  }

  public func gestureManager(_ gestureManager: MapboxMaps.GestureManager, didEndAnimatingFor gestureType: MapboxMaps.GestureType) {
    isGestureActive = false
    lastTransitionEndedAtMs = nowMs()
    scheduleQuietCheck()
    debugLog("gesture didEndAnimatingFor type=\(gestureType)")
  }
}
