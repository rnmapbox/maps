@_spi(Restricted) import MapboxMaps
import Turf
import MapKit

class FeatureEntry {
  let feature: RCTMGLMapComponent
  let view: UIView
  var addedToMap: Bool = false

  init(feature:RCTMGLMapComponent, view: UIView, addedToMap: Bool = false) {
    self.feature = feature
    self.view = view
    self.addedToMap = addedToMap
  }
}

class RCTMGLCameraChanged : RCTMGLEvent, RCTEvent {
  init(type: EventType, payload: [String:Any?]?, reactTag: NSNumber) {
    super.init(type: type, payload: payload)
    self.viewTag = reactTag
    self.eventName = "onCameraChanged"
  }

  var viewTag: NSNumber!

  var eventName: String!

  func canCoalesce() -> Bool {
    true
  }

  func coalesce(with newEvent: RCTEvent!) -> RCTEvent! {
    return newEvent
  }

  @objc
  var coalescingKey: UInt16 {
    return 0;
  }

  static func moduleDotMethod() -> String! {
    "RCTEventEmitter.receiveEvent"
  }

  func arguments() -> [Any]! {
    return [self.viewTag, RCTNormalizeInputEventName(self.eventName), self.toJSON()];
  }
}

@objc(RCTMGLMapView)
open class RCTMGLMapView : MapView {
  var tapDelegate: IgnoreRCTMGLMakerViewGestureDelegate? = nil

  var eventDispatcher: RCTEventDispatcherProtocol

  var compassEnabled: Bool = false
  var compassFadeWhenNorth: Bool = false
  var compassImage: String?
  
  var reactOnPress : RCTBubblingEventBlock?
  var reactOnLongPress : RCTBubblingEventBlock?
  var reactOnMapChange : RCTBubblingEventBlock?

  @objc
  var onCameraChanged: RCTDirectEventBlock?

  var styleLoaded: Bool = false
  var styleLoadWaiters : [(MapboxMap)->Void] = []

  var features: [FeatureEntry] = []

  weak var reactCamera : RCTMGLCamera?
  var images : [RCTMGLImages] = []
  var sources : [RCTMGLInteractiveElement] = []
  
  var handleMapChangedEvents = Set<RCTMGLEvent.EventType>()

  var eventListeners : [Cancelable] = []

  private var isPendingInitialLayout = true
  private var wasGestureActive = false
  private var isGestureActive = false

  var layerWaiters : [String:[(String) -> Void]] = [:]
  
  lazy var pointAnnotationManager : PointAnnotationManager = {
    let result = PointAnnotationManager(annotations: annotations, mapView: mapView)
    self._removeMapboxLongPressGestureRecognizer()
    return result
  }()

  lazy var calloutAnnotationManager : MapboxMaps.PointAnnotationManager = {
    return annotations.makePointAnnotationManager(id: "rctmgl-mapview-callouts")
  }()
  
  var mapView : MapView {
    get { return self }
  }

  func addToMap(_ subview: UIView) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      let style = mapView.mapboxMap.style
      var addToMap = false
      if mapComponent.waitForStyleLoad() {
        if (self.styleLoaded) {
          addToMap = true
        }
      } else {
        addToMap = true
      }

      let entry = FeatureEntry(feature: mapComponent, view: subview, addedToMap: false)
      if (addToMap) {
        mapComponent.addToMap(self, style: style)
        entry.addedToMap = true
      }
      features.append(entry)
    } else {
      subview.reactSubviews()?.forEach { addToMap($0) }
    }
    if let source = subview as? RCTMGLInteractiveElement {
      sources.append(source)
    }
  }
  
  func removeFromMap(_ subview: UIView) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      var entryIndex = features.firstIndex { $0.view == subview }
      if let entryIndex = entryIndex {
        var entry = features[entryIndex]
        if (entry.addedToMap) {
            mapComponent.removeFromMap(self, reason: .OnDestory)
            entry.addedToMap = false
        }
        features.remove(at: entryIndex)
      }
    } else {
      subview.reactSubviews()?.forEach { removeFromMap($0) }
    }
    if let source = subview as? RCTMGLInteractiveElement {
      sources.removeAll { $0 == source }
    }
  }

  @objc open override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    addToMap(subview)
    super.insertReactSubview(subview, at: atIndex)
  }
  
  @objc open override func removeReactSubview(_ subview: UIView!) {
    removeFromMap(subview)
    super.removeReactSubview(subview)
  }

  public required init(frame:CGRect, eventDispatcher: RCTEventDispatcherProtocol) {
    let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
    self.eventDispatcher = eventDispatcher
    super.init(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))

    self.mapView.gestures.delegate = self

    setupEvents()
  }
  
  public required init (coder: NSCoder) {
      fatalError("not implemented")
  }
  
  func layerAdded (_ layer: Layer) {
      // TODO
  }
  
  func waitForLayerWithID(_ layerId: String, _  callback: @escaping (_ layerId: String) -> Void) {
    let style = mapboxMap.style;
    if style.layerExists(withId: layerId) {
      callback(layerId)
    } else {
      layerWaiters[layerId, default: []].append(callback)
    }
  }
  
  @objc public override func layoutSubviews() {
    super.layoutSubviews()
    if let camera = reactCamera {
      if (isPendingInitialLayout) {
        isPendingInitialLayout = false;

        camera.initialLayout()
      }
    }
  }

  
  // MARK: - React Native properties

  @objc func setReactProjection(_ value: String?) {
    if let value = value {
      let projection = StyleProjection(name: value == "globe" ? .globe : .mercator)
      try! self.mapboxMap.style.setProjection(projection)
    }
  }

  @objc func setReactLocalizeLabels(_ value: NSDictionary?) {
    onMapStyleLoaded { _ in
      if let value = value {
        logged("RCTMGLMapVIew.setReactLocalizeLabels") {
          let localeString = value["locale"] as! String
          let layerIds = value["layerIds"] as! [String]?
          let locale = localeString == "current" ? Locale.current : Locale(identifier: localeString)
          try self.mapboxMap.style.localizeLabels(into: locale, forLayerIds: layerIds)
        }
      }
    }
  }
  
  
  @objc func setReactAttributionEnabled(_ value: Bool) {
    mapView.ornaments.options.attributionButton.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactAttributionPosition(_ position: [String: NSNumber]) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.attributionButton.position = ornamentOptions.position
      mapView.ornaments.options.attributionButton.margins = ornamentOptions.margins
    }
  }
  
  @objc func setReactLogoEnabled(_ value: Bool) {
    mapView.ornaments.options.logo.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactLogoPosition(_ position: [String: NSNumber]) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.logo.position = ornamentOptions.position
      mapView.ornaments.options.logo.margins = ornamentOptions.margins
    }
  }
  
  @objc func setReactCompassEnabled(_ value: Bool) {
    compassEnabled = value
    refreshCompassVisibility()
  }
  
  @objc func setReactCompassFadeWhenNorth(_ value: Bool) {
    compassFadeWhenNorth = value
    refreshCompassVisibility()
  }
  
  private func refreshCompassVisibility() {
    var visibility: OrnamentVisibility = .hidden
    if compassEnabled {
      visibility = compassFadeWhenNorth ? .adaptive : .visible
    }
    mapView.ornaments.options.compass.visibility = visibility
    
    refreshCompassImage()
  }
  
  @objc func setReactCompassPosition(_ position: [String: NSNumber]) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.compass.position = ornamentOptions.position
      mapView.ornaments.options.compass.margins = ornamentOptions.margins
    }
  }
  
  func toOrnamentPositon(_ position: Int) -> OrnamentPosition {
    enum MapboxGLPosition : Int {
      case topLeft = 0
      case topRight = 1
      case bottomLeft = 2
      case bottomRight = 3
    };
    
    let glPosition = MapboxGLPosition(rawValue: position)
    switch glPosition {
    case .topLeft:
      return .topLeading
    case .bottomRight:
      return .bottomTrailing
    case .topRight:
      return .topTrailing
    case .bottomLeft:
      return .bottomLeading
    case .none:
      return .topLeading
    }
  }
  
  @objc func setReactCompassViewPosition(_ position: NSInteger) {
    mapView.ornaments.options.compass.position = toOrnamentPositon(Int(truncating: NSNumber(value: position)))
  }
  
  @objc func setReactCompassViewMargins(_ margins: CGPoint) {
    mapView.ornaments.options.compass.margins = margins;
  }

  @objc func setReactCompassImage(_ image: String) {
    compassImage = image.isEmpty ? nil : image
    refreshCompassImage()
  }
  
  private func refreshCompassImage() {
    if let compassImage = compassImage {
      onMapStyleLoaded { map in
        let img = map.style.image(withId: compassImage)
        self.mapView.ornaments.options.compass.image = img
      }
    } else {
      // Does not currently reset the image to the default.
      // See https://github.com/mapbox/mapbox-maps-ios/issues/1673.
      self.mapView.ornaments.options.compass.image = nil
    }
  }

  @objc func setReactScaleBarEnabled(_ value: Bool) {
    self.mapView.ornaments.options.scaleBar.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactScaleBarPosition(_ position: [String: NSNumber]) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.scaleBar.position = ornamentOptions.position
      mapView.ornaments.options.scaleBar.margins = ornamentOptions.margins
    }
  }

  @objc func setReactZoomEnabled(_ value: Bool) {
    self.mapView.gestures.options.quickZoomEnabled = value
    self.mapView.gestures.options.doubleTapToZoomInEnabled = value
    self.mapView.gestures.options.pinchZoomEnabled = value
  }

  @objc func setReactScrollEnabled(_ value: Bool) {
    self.mapView.gestures.options.panEnabled = value
    self.mapView.gestures.options.pinchPanEnabled = value
  }

  @objc func setReactRotateEnabled(_ value: Bool) {
    self.mapView.gestures.options.rotateEnabled = value
  }

  @objc func setReactPitchEnabled(_ value: Bool) {
    self.mapView.gestures.options.pitchEnabled = value
  }

  private func removeAllFeaturesFromMap(reason: RemovalReason) {
    features.forEach { entry in
      if (entry.addedToMap) {
        entry.feature.removeFromMap(self, reason: reason)
        entry.addedToMap = false
      }
    }
  }

  private func addFeaturesToMap(style: Style) {
    features.forEach { entry in
      if (!entry.addedToMap) {
        entry.feature.addToMap(self, style: style)
        entry.addedToMap = true
      }
    }
  }
  
  func refreshComponentsBeforeStyleChange() {
    removeAllFeaturesFromMap(reason: .StyleChange)
  }
  
  func refreshComponentsAfterStyleChange(style: Style) {
      addFeaturesToMap(style: style)
  }
  
  @objc func setReactStyleURL(_ value: String?) {
    var initialLoad = !self.styleLoaded
    if !initialLoad { refreshComponentsBeforeStyleChange() }
    self.styleLoaded = false
    if let value = value {
      if let _ = URL(string: value) {
          if let styleURI = StyleURI(rawValue: value) {
              mapView.mapboxMap.loadStyleURI(styleURI)
          } else {
              let event = RCTMGLEvent(type:.mapLoadingError, payload: ["error": "invalid URI: \(value)"]);
              self.fireEvent(event: event, callback: self.reactOnMapChange)
          }
      } else {
        if RCTJSONParse(value, nil) != nil {
          mapView.mapboxMap.loadStyleJSON(value)
        }
      }
      if !initialLoad {
        self.onNext(event: .styleLoaded) {_,_ in
          self.addFeaturesToMap(style: self.mapboxMap.style)
        }
      }
    }
    let event = RCTMGLEvent(type:.willStartLoadingMap, payload: nil);
    self.fireEvent(event: event, callback: self.reactOnMapChange)
  }

  private func getOrnamentOptionsFromPosition(_ position: [String: NSNumber]) -> (position: OrnamentPosition, margins: CGPoint)? {
    let left = position["left"]
    let right = position["right"]
    let top = position["top"]
    let bottom = position["bottom"]
    
    if let left = left, let top = top {
      return (OrnamentPosition.topLeading, CGPoint(x: Int(truncating: left), y: Int(truncating: top)))
    } else if let right = right, let top = top {
      return (OrnamentPosition.topTrailing, CGPoint(x: Int(truncating: right), y: Int(truncating: top)))
    } else if let bottom = bottom, let right = right {
      return (OrnamentPosition.bottomTrailing, CGPoint(x: Int(truncating: right), y: Int(truncating: bottom)))
    } else if let bottom = bottom, let left = left {
      return (OrnamentPosition.bottomLeading, CGPoint(x: Int(truncating: left), y: Int(truncating: bottom)))
    }
    
    return nil
  }

  func _removeMapboxLongPressGestureRecognizer() {
    mapView.gestureRecognizers?.forEach { recognizer in
      if (String(describing: type(of:recognizer)) == "MapboxLongPressGestureRecognizer") {
        mapView.removeGestureRecognizer(recognizer)
      }
    }
  }
}

// MARK: - event handlers

extension RCTMGLMapView {
  private func onEvery<Payload>(event: MapEvents.Event<Payload>, handler: @escaping  (RCTMGLMapView, MapEvent<Payload>) -> Void) {
    let eventListener = self.mapView.mapboxMap.onEvery(event: event) { [weak self](mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }
    eventListeners.append(eventListener)
    if eventListeners.count > 20 {
      Logger.log(level:.warn, message: "RCTMGLMapView.onEvery, too much handler installed");
    }
  }

  private func onNext<Payload>(event: MapEvents.Event<Payload>, handler: @escaping  (RCTMGLMapView, MapEvent<Payload>) -> Void) {
    self.mapView.mapboxMap.onNext(event: event) { [weak self](mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }
  }

  @objc func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnMapChange = value

    self.onEvery(event: .cameraChanged, handler: { (self, cameraEvent) in
      self.wasGestureActive = self.isGestureActive
      if self.handleMapChangedEvents.contains(.regionIsChanging) {
        let event = RCTMGLEvent(type:.regionIsChanging, payload: self.buildRegionObject())
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.cameraChanged) {
        let event = RCTMGLCameraChanged(type:.cameraChanged, payload: self.buildStateObject(), reactTag: self.reactTag)
        self.eventDispatcher.send(event)
      }
    })

    self.onEvery(event: .mapIdle, handler: { (self, cameraEvent) in
      if self.handleMapChangedEvents.contains(.regionDidChange) {
        let event = RCTMGLEvent(type:.regionDidChange, payload: self.buildRegionObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.mapIdle) {
        let event = RCTMGLEvent(type:.mapIdle, payload: self.buildStateObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      }
      
      self.wasGestureActive = false
    })
  }

  private func fireEvent(event: RCTMGLEvent, callback: RCTBubblingEventBlock?) {
    guard let callback = callback else {
      Logger.log(level: .error, message: "fireEvent failed: \(event) - callback is null")
      return
    }
    fireEvent(event: event, callback: callback)
  }

  private func fireEvent(event: RCTMGLEvent, callback: @escaping RCTBubblingEventBlock) {
    callback(event.toJSON())
  }
  
  private func buildStateObject() -> [String: Any] {
    let cameraOptions = CameraOptions(cameraState: cameraState)
    let bounds = mapView.mapboxMap.coordinateBounds(for: cameraOptions)
    
    return [
      "properties": [
        "center": Point(mapView.cameraState.center).coordinates.toArray(),
        "bounds": [
          "ne": bounds.northeast.toArray(),
          "sw": bounds.southwest.toArray()
        ],
        "zoom" : Double(mapView.cameraState.zoom),
        "heading": Double(mapView.cameraState.bearing),
        "pitch": Double(mapView.cameraState.pitch),
      ],
      "gestures": [
        "isGestureActive": wasGestureActive
      ],
      "timestamp": timestamp()
    ]
  }
  
  private func timestamp(date: Date? = nil) -> Double {
    return (date ?? Date()).timeIntervalSince1970 * 1000
  }

  private func buildRegionObject() -> [String: Any] {
    let cameraOptions = CameraOptions(cameraState: cameraState)
    let bounds = mapView.mapboxMap.coordinateBounds(for: cameraOptions)
    let boundsArray : JSONArray = [
      [.number(bounds.northeast.longitude),.number(bounds.northeast.latitude)],
      [.number(bounds.southwest.longitude),.number(bounds.southwest.latitude)]
    ]

    var result = Feature(
       geometry: .point(Point(mapView.cameraState.center))
    )
    result.properties = [
      "zoomLevel": .number(mapView.cameraState.zoom),
      "heading": .number(mapView.cameraState.bearing),
      "bearing": .number(mapView.cameraState.bearing),
      "pitch": .number(mapView.cameraState.pitch),
      "visibleBounds": .array(boundsArray),
      "isUserInteraction": .boolean(wasGestureActive),
    ]
    return logged("buildRegionObject", errorResult: { ["error":["toJSON":$0.localizedDescription]] }) {
      try result.toJSON()
    }
  }
  
  public func setupEvents() {
    self.onEvery(event: .mapLoadingError, handler: { (self, event) in
      let eventPayload : MapLoadingErrorPayload = event.payload
      var payload : [String:String] = [
        "error": eventPayload.error.errorDescription ?? eventPayload.error.localizedDescription
      ]
      if let tileId = eventPayload.tileId {
        payload["tileId"] = "x:\(tileId.x) y:\(tileId.y) z:\(tileId.z)"
      }
      if let sourceId = eventPayload.sourceId {
        payload["sourceId"] = sourceId
      }
      let rctmglEvent = RCTMGLEvent(type: .mapLoadingError, payload: payload);
      self.fireEvent(event: rctmglEvent, callback: self.reactOnMapChange)

      if let message = eventPayload.error.errorDescription {
        Logger.log(level: .error, message: "MapLoad error \(message)")
      } else {
        Logger.log(level: .error, message: "MapLoad error \(event)")
      }
    })
    
    self.onEvery(event: .styleImageMissing) { (self, event) in
      let imageName = event.payload.id
      
      self.images.forEach {
        if $0.addMissingImageToStyle(style: self.mapboxMap.style, imageName: imageName) {
          return
        }
      }

      self.images.forEach {
        $0.sendImageMissingEvent(imageName: imageName, payload: event.payload)
      }
    }

    self.onEvery(event: .renderFrameFinished, handler: { (self, event) in
      var type = RCTMGLEvent.EventType.didFinishRendering
      if event.payload.renderMode == .full {
        type = .didFinishRenderingFully
      }
      let payload : [String:Any] = [
        "renderMode": event.payload.renderMode.rawValue,
        "needsRepaint": event.payload.needsRepaint,
        "placementChanged": event.payload.placementChanged
      ]
      let event = RCTMGLEvent(type: type, payload: payload);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })

    self.onNext(event: .mapLoaded, handler: { (self, event) in
      let event = RCTMGLEvent(type:.didFinishLoadingMap, payload: nil);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })
    
    self.onEvery(event: .styleLoaded, handler: { (self, event) in
      self.addFeaturesToMap(style: self.mapboxMap.style)
      
      if !self.styleLoaded {
        self.styleLoaded = true
        if let mapboxMap = self.mapboxMap {
          let waiters = self.styleLoadWaiters
          self.styleLoadWaiters = []
          waiters.forEach { $0(mapboxMap) }
        }
      }

      let event = RCTMGLEvent(type:.didFinishLoadingStyle, payload: nil)
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })
  }
}

// MARK: - gestures

class IgnoreRCTMGLMakerViewGestureDelegate : NSObject, UIGestureRecognizerDelegate {
  var originalDelegate: UIGestureRecognizerDelegate?

  init(originalDelegate: UIGestureRecognizerDelegate?) {
    self.originalDelegate = originalDelegate
  }
  
  func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
    return originalDelegate?.gestureRecognizerShouldBegin?(gestureRecognizer) ?? true
  }

  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRecognizeSimultaneouslyWith otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldRecognizeSimultaneouslyWith: otherGestureRecognizer) ?? false
  }
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldRequireFailureOf otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldRequireFailureOf: otherGestureRecognizer) ?? false
  }

  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldBeRequiredToFailBy otherGestureRecognizer: UIGestureRecognizer) -> Bool {
    return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldBeRequiredToFailBy: otherGestureRecognizer) ?? false
  }

  private func isMarkerViewSubview(_ view: UIView) -> Bool {
    var current : UIView? = view
    while let act = current {
      if (act is RCTMGLMarkerView) {
        return true
      }
      current = act.superview
    }
    return false
  }
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
    if let view = touch.view, isMarkerViewSubview(view) {
      return false
    }
    return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldReceive: touch) ?? true
  }
  
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive press: UIPress) -> Bool {
    return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldReceive: press) ?? true
  }

  
  @available(iOS 13.4, *)
  func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive event: UIEvent) -> Bool {
        return originalDelegate?.gestureRecognizer?(gestureRecognizer,shouldReceive: event) ?? true
  }
}

extension RCTMGLMapView {
  
  @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnPress = value

    let singleTapGestureRecognizer = self.mapView.gestures.singleTapGestureRecognizer

    singleTapGestureRecognizer.removeTarget(pointAnnotationManager.manager, action: nil)
    singleTapGestureRecognizer.addTarget(self, action: #selector(doHandleTap(_:)))

    self.tapDelegate = IgnoreRCTMGLMakerViewGestureDelegate(originalDelegate: singleTapGestureRecognizer.delegate)
    singleTapGestureRecognizer.delegate = tapDelegate
  }

  @objc func setReactOnLongPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnLongPress = value

    let longPressGestureRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(doHandleLongPress(_:)))
    self.mapView.addGestureRecognizer(longPressGestureRecognizer)
  }
}

extension RCTMGLMapView: GestureManagerDelegate {
  private func draggableSources() -> [RCTMGLInteractiveElement] {
    return sources.filter { $0.isDraggable() }
  }
  private func touchableSources() -> [RCTMGLInteractiveElement] {
    return sources.filter { $0.isTouchable() }
  }

  private func doHandleTapInSources(sources: [RCTMGLInteractiveElement], tapPoint: CGPoint, hits: [String: [QueriedFeature]], touchedSources: [RCTMGLInteractiveElement], callback: @escaping (_ hits: [String: [QueriedFeature]], _ touchedSources: [RCTMGLInteractiveElement]) -> Void) {
    DispatchQueue.main.async {
      if let source = sources.first {
        let hitbox = source.hitbox;
        
        let halfWidth = (hitbox["width"]?.doubleValue ?? RCTMGLInteractiveElement.hitboxDefault) / 2.0;
        let halfHeight = (hitbox["height"]?.doubleValue  ?? RCTMGLInteractiveElement.hitboxDefault) / 2.0;

        let top = tapPoint.y - halfHeight;
        let left = tapPoint.x - halfWidth;
        
        let hitboxRect = CGRect(x: left, y: top, width: halfWidth * 2.0, height: halfHeight * 2.0)

        let options = RenderedQueryOptions(
          layerIds: source.getLayerIDs(), filter: nil
        )
        self.mapboxMap.queryRenderedFeatures(with: hitboxRect, options: options) {
          result in
          
          var newHits = hits
          var newTouchedSources = touchedSources;
          switch result {
           case .failure(let error):
            Logger.log(level: .error, message: "Error during handleTapInSources source.id=\(source.id ?? "n/a") error:\(error)")
          case .success(let features):
            if !features.isEmpty {
              newHits[source.id] = features
              newTouchedSources.append(source)
            }
            break
          }
          var nSources = sources
          nSources.removeFirst()
          self.doHandleTapInSources(sources: nSources, tapPoint: tapPoint, hits: newHits, touchedSources: newTouchedSources, callback: callback)
        }
      } else {
        callback(hits, touchedSources)
      }
    }
  }
  
  func highestZIndex(sources: [RCTMGLInteractiveElement]) -> RCTMGLInteractiveElement? {
    var layersToSource : [String:RCTMGLInteractiveElement] = [:]
    
    sources.forEach { source in
      source.getLayerIDs().forEach { layerId in
        if layersToSource[layerId] == nil {
          layersToSource[layerId] = source
        }
      }
    }
    let orderedLayers = mapboxMap.style.allLayerIdentifiers
    return orderedLayers.lazy.reversed().compactMap { layersToSource[$0.id] }.first ?? sources.first
  }
  
  @objc
  func doHandleTap(_ sender: UITapGestureRecognizer) {
    let tapPoint = sender.location(in: self)
    pointAnnotationManager.handleTap(sender) { (_: UITapGestureRecognizer) in
      DispatchQueue.main.async {
        let touchableSources = self.touchableSources()
        self.doHandleTapInSources(sources: touchableSources, tapPoint: tapPoint, hits: [:], touchedSources: []) { (hits, touchedSources) in
          
          if let source = self.highestZIndex(sources: touchedSources),
             source.hasPressListener,
             let onPress = source.onPress {
            guard let hitFeatures = hits[source.id] else {
              Logger.log(level:.error, message: "doHandleTap, no hits found when it should have")
              return
            }
            let features = hitFeatures.compactMap { queriedFeature in
              logged("doHandleTap.hitFeatures") { try queriedFeature.feature.toJSON() } }
            let location = self.mapboxMap.coordinate(for: tapPoint)
            let event = RCTMGLEvent(
              type: (source is RCTMGLVectorSource) ? .vectorSourceLayerPress : .shapeSourceLayerPress,
              payload: [
                "features": features,
                "point": [
                  "x": Double(tapPoint.x),
                  "y": Double(tapPoint.y),
                ],
                "coordinates": [
                  "latitude": Double(location.latitude),
                  "longitude": Double(location.longitude),
                ]
              ]
            )
            self.fireEvent(event: event, callback: onPress)
            
          } else {
            if let reactOnPress = self.reactOnPress {
              let location = self.mapboxMap.coordinate(for: tapPoint)
              var geojson = Feature(geometry: .point(Point(location)));
              geojson.properties = [
                "screenPointX": .number(Double(tapPoint.x)),
                "screenPointY": .number(Double(tapPoint.y))
              ]
              let event = RCTMGLEvent(type:.tap, payload: logged("reactOnPress") { try geojson.toJSON() })
              self.fireEvent(event: event, callback: reactOnPress)
            }
          }
        }
      }
    }
  }
  
  @objc
  func doHandleLongPress(_ sender: UILongPressGestureRecognizer) {
    let position = sender.location(in: self)
    pointAnnotationManager.handleLongPress(sender) { (_: UILongPressGestureRecognizer) in
      DispatchQueue.main.async {
        let draggableSources = self.draggableSources()
        self.doHandleTapInSources(sources: draggableSources, tapPoint: position, hits: [:], touchedSources: []) { (hits, draggedSources) in
          if let source = self.highestZIndex(sources: draggedSources),
             source.draggable,
             let onDragStart = source.onDragStart {
            guard let hitFeatures = hits[source.id] else {
              Logger.log(level:.error, message: "doHandleLongPress, no hits found when it should have")
              return
            }
            let features = hitFeatures.compactMap { queriedFeature in
              logged("doHandleTap.hitFeatures") { try queriedFeature.feature.toJSON() } }
            let location = self.mapboxMap.coordinate(for: position)
            let event = RCTMGLEvent(
              type: .longPress,
              payload: [
                "features": features,
                "point": [
                  "x": Double(position.x),
                  "y": Double(position.y),
                ],
                "coordinates": [
                  "latitude": Double(location.latitude),
                  "longitude": Double(location.longitude),
                ]
              ]
            )
            self.fireEvent(event: event, callback: onDragStart)
            } else {
             if let reactOnLongPress = self.reactOnLongPress, sender.state == .began {
               let coordinate = self.mapboxMap.coordinate(for: position)
               var geojson = Feature(geometry: .point(Point(coordinate)));
               geojson.properties = [
                 "screenPointX": .number(Double(position.x)),
                 "screenPointY": .number(Double(position.y))
               ]
               let event = RCTMGLEvent(type:.longPress, payload: logged("doHandleLongPress") { try geojson.toJSON() })
               self.fireEvent(event: event, callback: reactOnLongPress)
             }
           }
        }
      }
    }
  }

  public func gestureManager(_ gestureManager: GestureManager, didBegin gestureType: GestureType) {
    isGestureActive = true
  }
  
  public func gestureManager(_ gestureManager: GestureManager, didEnd gestureType: GestureType, willAnimate: Bool) {
    if !willAnimate {
      isGestureActive = false;
    }
  }
  
  public func gestureManager(_ gestureManager: GestureManager, didEndAnimatingFor gestureType: GestureType) {
    isGestureActive = false;
  }
}

extension RCTMGLMapView
{
  @objc func takeSnap(
    writeToDisk:Bool) -> URL
  {
    UIGraphicsBeginImageContextWithOptions(self.bounds.size, true, 0);

    self.drawHierarchy(in: self.bounds, afterScreenUpdates: true)
    let snapshot = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    return writeToDisk ? RNMBImageUtils.createTempFile(snapshot!) :  RNMBImageUtils.createBase64(snapshot!)
  }
}

extension RCTMGLMapView {
  func queryTerrainElevation(coordinates: [NSNumber]) -> Double? {
    return self.mapboxMap.elevation(at: CLLocationCoordinate2D(latitude: coordinates[1].doubleValue, longitude: coordinates[0].doubleValue))
  }
}

extension RCTMGLMapView {
  func onMapStyleLoaded(block: @escaping (MapboxMap) -> Void) {
    guard let mapboxMap = mapboxMap else {
      fatalError("mapboxMap is null")
    }
    
    if styleLoaded {
      block(mapboxMap)
    } else {
      styleLoadWaiters.append(block)
    }
  }
}

extension RCTMGLMapView {
  func setSourceVisibility(_ visible: Bool, sourceId: String, sourceLayerId: String?) -> Void {
    let style = self.mapboxMap.style
    
    style.allLayerIdentifiers.forEach { layerInfo in
      let layer = logged("setSourceVisibility.layer", info: { "\(layerInfo.id)" }) {
        try style.layer(withId: layerInfo.id)
      }
      if let layer = layer {
        if layer.source == sourceId {
          var good = true
          if let sourceLayerId = sourceLayerId {
            if sourceLayerId != layer.sourceLayer {
              good = false
            }
          }
          if good {
            do {
              try style.setLayerProperty(for: layer.id, property: "visibility", value: visible ? "visible" : "none")
            } catch {
              Logger.log(level: .error, message: "Cannot change visibility of \(layer.id) with source: \(sourceId)")
            }
          }
        }
      }
    }
  }
}

class PointAnnotationManager : AnnotationInteractionDelegate {
  weak var selected : RCTMGLPointAnnotation? = nil
  private var draggedAnnotation: PointAnnotation?
  
  func annotationManager(_ manager: AnnotationManager, didDetectTappedAnnotations annotations: [Annotation]) {
    // We handle taps ourselfs
    //   onTap(annotations: annotations)
  }

  func onTap(annotations: [Annotation]) {
    guard annotations.count > 0 else {
      fatalError("didDetectTappedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation,
         let userInfo = pointAnnotation.userInfo {
        
        if let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation> {
          if let pt = rctmglPointAnnotation.object {
            let position = pt.superview?.convert(pt.layer.position, to: nil)
            let location = pt.map?.mapboxMap.coordinate(for: position!)
            var geojson = Feature(geometry: .point(Point(location!)))
            geojson.identifier = .string(pt.id)
            geojson.properties = [
              "screenPointX": .number(Double(position!.x)),
              "screenPointY": .number(Double(position!.y))
            ]
            let event = RCTMGLEvent(type:.tap, payload: logged("doHandleTap") { try geojson.toJSON() })
            if let selected = selected {
              guard let onDeselected = pt.onDeselected else {
                return
              }
              onDeselected(event.toJSON())
              selected.onDeselect()
            }
            guard let onSelected = pt.onSelected else {
              return
            }
            onSelected(event.toJSON())
            pt.onSelect()
            selected = pt
          }
        }
      }
    }
  }
  
  func handleTap(_ tap: UITapGestureRecognizer,  noAnnotationFound: @escaping (UITapGestureRecognizer) -> Void) {
    let layerId = manager.layerId
    guard let mapFeatureQueryable = mapView?.mapboxMap else {
      noAnnotationFound(tap)
      return
    }
    let options = RenderedQueryOptions(layerIds: [layerId], filter: nil)
    mapFeatureQueryable.queryRenderedFeatures(
      with: tap.location(in: tap.view),
        options: options) { [weak self] (result) in

        guard let self = self else { return }

        switch result {

        case .success(let queriedFeatures):

            // Get the identifiers of all the queried features
            let queriedFeatureIds: [String] = queriedFeatures.compactMap {
                guard case let .string(featureId) = $0.feature.identifier else {
                    return nil
                }
                return featureId
            }

            // Find if any `queriedFeatureIds` match an annotation's `id`
            let tappedAnnotations = self.manager.annotations.filter { queriedFeatureIds.contains($0.id) }

            // If `tappedAnnotations` is not empty, call delegate
            if !tappedAnnotations.isEmpty {
              self.onTap(annotations: tappedAnnotations)
            } else {
              noAnnotationFound(tap)
            }

        case .failure(let error):
          noAnnotationFound(tap)
          Logger.log(level:.warn, message:"Failed to query map for annotations due to error: \(error)")
        }
    }
  }
  
  var manager : MapboxMaps.PointAnnotationManager
  weak var mapView : MapView? = nil
  
  init(annotations: AnnotationOrchestrator, mapView: MapView) {
    manager = annotations.makePointAnnotationManager(id: "rctmgl-mapview-point-annotations")
    manager.delegate = self
    self.mapView = mapView
  }

  func onDragHandler(_ manager: AnnotationManager, didDetectDraggedAnnotations annotations: [Annotation], dragState: UILongPressGestureRecognizer.State, targetPoint: CLLocationCoordinate2D) {
    guard annotations.count > 0 else {
      fatalError("didDetectDraggedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation,
         let userInfo = pointAnnotation.userInfo {
        
        if let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation> {
          if let pt = rctmglPointAnnotation.object {
            let position = pt.superview?.convert(pt.layer.position, to: nil)
            var geojson = Feature(geometry: .point(Point(targetPoint)))
            geojson.identifier = .string(pt.id)
            geojson.properties = [
              "screenPointX": .number(Double(position!.x)),
              "screenPointY": .number(Double(position!.y))
            ]
            let event = RCTMGLEvent(type:.longPress, payload: logged("doHandleLongPress") { try geojson.toJSON() })
            switch (dragState) {
            case .began:
              guard let onDragStart = pt.onDragStart else {
                return
              }
              onDragStart(event.toJSON())
            case .changed:
              guard let onDrag = pt.onDrag else {
                return
              }
              onDrag(event.toJSON())
              return
            case .ended:
              guard let onDragEnd = pt.onDragEnd else {
                return
              }
              onDragEnd(event.toJSON())
              return
            default:
              return
            }
          }
        }
      }
    }
  }
  
  // Used for handling panning to detect annotation dragging
  func handleLongPress(_ sender: UILongPressGestureRecognizer, noAnnotationFound: @escaping (UILongPressGestureRecognizer) -> Void) {
    let layerId = manager.layerId
    guard let mapFeatureQueryable = mapView?.mapboxMap else {
      noAnnotationFound(sender)
      return
    }
    let options = RenderedQueryOptions(layerIds: [layerId], filter: nil)
    guard let targetPoint = self.mapView?.mapboxMap.coordinate(for: sender.location(in: sender.view)) else {
      return
    }
      switch sender.state {
        case .began:
        mapFeatureQueryable.queryRenderedFeatures(
          with: sender.location(in: sender.view),
            options: options) { [weak self] (result) in
              
              guard let self = self else { return }
              switch result {
                case .success(let queriedFeatures):
                  // Get the identifiers of all the queried features
                  let queriedFeatureIds: [String] = queriedFeatures.compactMap {
                      guard case let .string(featureId) = $0.feature.identifier else {
                          return nil
                      }
                      return featureId
                  }

                  // Find if any `queriedFeatureIds` match an annotation's `id`
                let draggedAnnotations = self.manager.annotations.filter { queriedFeatureIds.contains($0.id) }
                let enabledAnnotations = draggedAnnotations.filter { ($0.userInfo?[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation>)?.object?.draggable ?? false }
                  // If `tappedAnnotations` is not empty, call delegate
                  if !enabledAnnotations.isEmpty {
                    self.draggedAnnotation = enabledAnnotations.first!
                    self.onDragHandler(self.manager, didDetectDraggedAnnotations: enabledAnnotations, dragState: .began, targetPoint: targetPoint)
                  } else {
                    noAnnotationFound(sender)
                  }
                case .failure(let error):
                  noAnnotationFound(sender)
                  Logger.log(level:.warn, message:"Failed to query map for annotations due to error: \(error)")
                }
              }

      case .changed:
          guard var annotation = self.draggedAnnotation else {
              return
          }
        
          self.onDragHandler(self.manager, didDetectDraggedAnnotations: [annotation], dragState: .changed, targetPoint: targetPoint)

          let idx = self.manager.annotations.firstIndex { an in return an.id == annotation.id }
          if let idx = idx {
            self.manager.annotations[idx].point = Point(targetPoint)
          }
      case .cancelled, .ended:
        guard let annotation = self.draggedAnnotation else {
            return
        }
        // Optionally notify some other delegate to tell them the drag finished.
        self.onDragHandler(self.manager, didDetectDraggedAnnotations: [annotation], dragState: .ended, targetPoint: targetPoint)
        // Reset our global var containing the annotation currently being dragged
        self.draggedAnnotation = nil
        return
      default:
          return
      }
  }
  
  func remove(_ annotation: PointAnnotation) {
    manager.annotations.removeAll(where: {$0.id == annotation.id})
  }
  
  func add(_ annotation: PointAnnotation) {
    manager.annotations.append(annotation)
    manager.syncSourceAndLayerIfNeeded()
  }
  
  func update(_ annotation: PointAnnotation) {
    let index = manager.annotations.firstIndex { $0.id == annotation.id }
    
    guard let index = index else {
      Logger.log(level: .warn, message: "RCTMGL - PointAnnotation.refresh: annotation not found")
      return
    }
    
    manager.annotations[index] = annotation
    manager.syncSourceAndLayerIfNeeded()
  }
}
