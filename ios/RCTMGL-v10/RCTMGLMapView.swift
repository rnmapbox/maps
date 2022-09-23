@_spi(Restricted) import MapboxMaps
import Turf
import MapKit

@objc(RCTMGLMapView)
open class RCTMGLMapView: MapView {
  var compassEnabled: Bool = false
  var compassFadeWhenNorth: Bool = false
  var reactOnPress : RCTBubblingEventBlock?
  var reactOnLongPress : RCTBubblingEventBlock?
  var reactOnMapChange : RCTBubblingEventBlock?

  var styleLoaded: Bool = false
  var styleLoadWaiters : [(MapboxMap)->Void] = []

  var reactCamera : RCTMGLCamera?
  var images : [RCTMGLImages] = []
  var sources : [RCTMGLInteractiveElement] = []
  
  var handleMapChangedEvents = Set<RCTMGLEvent.EventType>()
  
  var onStyleLoadedComponents: [RCTMGLMapComponent] = []
  
  private var isPendingInitialLayout = true
  private var isGestureActive = false
  private var isAnimatingFromGesture = false

  var layerWaiters : [String:[(String) -> Void]] = [:]
  
  lazy var pointAnnotationManager : PointAnnotationManager = {
    return PointAnnotationManager(annotations: annotations, mapView: mapView)
  }()

  lazy var calloutAnnotationManager : MapboxMaps.PointAnnotationManager = {
    return annotations.makePointAnnotationManager(id: "rctmlg-callout")
  }()
  
  var mapView : MapView {
    get { return self }
  }

  func addToMap(_ subview: UIView) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      let style = mapView.mapboxMap.style
      if mapComponent.waitForStyleLoad() {
        if (self.styleLoaded) {
          mapComponent.addToMap(self, style: style)
        } else {
          onStyleLoadedComponents.append(mapComponent)
        }
      } else {
        mapComponent.addToMap(self, style: style)
      }
    } else {
      subview.reactSubviews()?.forEach { addToMap($0) }
    }
    if let source = subview as? RCTMGLInteractiveElement {
      sources.append(source)
    }
  }
  
  func removeFromMap(_ subview: UIView) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      if mapComponent.waitForStyleLoad() {
        onStyleLoadedComponents.removeAll { $0 === mapComponent }
      }
      mapComponent.removeFromMap(self)
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
  
  @objc open override func removeReactSubview(_ subview:UIView!) {
    removeFromMap(subview)
    super.removeReactSubview(subview)
  }

  public required init(frame:CGRect) {
    let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
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

  public override func updateConstraints() {
    super.updateConstraints()
    if let camera = reactCamera {
      if (isPendingInitialLayout) {
        isPendingInitialLayout = false;

        camera.initialLayout()
      }
    }
  }

  
  // MARK: - React Native properties
  
  @objc func setReactAttributionEnabled(_ value: Bool) {
    mapView.ornaments.options.attributionButton.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactAttributionPosition(_ position: [String: Int]!) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.attributionButton.position = ornamentOptions.position
      mapView.ornaments.options.attributionButton.margins = ornamentOptions.margins
    }
  }
  
  @objc func setReactLogoEnabled(_ value: Bool) {
    mapView.ornaments.options.logo.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactLogoPosition(_ position: [String: Int]!) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      mapView.ornaments.options.logo.position = ornamentOptions.position
      mapView.ornaments.options.logo.margins = ornamentOptions.margins
    }
  }
  
  @objc func setReactCompassEnabled(_ value: Bool) {
    compassEnabled = value
    mapView.ornaments.options.compass.visibility = value ? compassFadeWhenNorth ? .adaptive : .visible : .hidden
  }
  
  @objc func setReactCompassFadeWhenNorth(_ value: Bool) {
    compassFadeWhenNorth = value
    if (compassEnabled) {
      mapView.ornaments.options.compass.visibility = value ? .adaptive : .visible
    }
  }
  
  @objc func setReactCompassPosition(_ position: [String: Int]!) {
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
      return .topLeft
    case .bottomRight:
      return .bottomRight
    case .topRight:
      return .topRight
    case .bottomLeft:
      return .bottomLeft
    case .none:
      return .topLeft
    }
  }
  
  @objc func setReactCompassViewPosition(_ position: Int) {
    mapView.ornaments.options.compass.position = toOrnamentPositon(position)
  }
  
  @objc func setReactCompassViewMargins(_ margins: CGPoint) {
    mapView.ornaments.options.compass.margins = margins;
  }

  @objc func setReactScaleBarEnabled(_ value: Bool) {
    self.mapView.ornaments.options.scaleBar.visibility = value ? .visible : .hidden
  }
  
  @objc func setReactScaleBarPosition(_ position: [String: Int]!) {
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
    self.mapView.gestures.options.pinchRotateEnabled = value
  }

  @objc func setReactPitchEnabled(_ value: Bool) {
    self.mapView.gestures.options.pitchEnabled = value
  }
  
  @objc func setReactStyleURL(_ value: String?) {
    self.styleLoaded = false
    if let value = value {
      if let _ = URL(string: value) {
        mapView.mapboxMap.loadStyleURI(StyleURI(rawValue: value)!)
      } else {
        if RCTJSONParse(value, nil) != nil {
          mapView.mapboxMap.loadStyleJSON(value)
        }
      }
    }
  }

  private func getOrnamentOptionsFromPosition(_ position: [String: Int]!) -> (position: OrnamentPosition, margins: CGPoint)? {
    let left = position["left"]
    let right = position["right"]
    let top = position["top"]
    let bottom = position["bottom"]
    
    if let left = left, let top = top {
      return (OrnamentPosition.topLeft, CGPoint(x: left, y: top))
    } else if let right = right, let top = top {
      return (OrnamentPosition.topRight, CGPoint(x: right, y: top))
    } else if let bottom = bottom, let right = right {
      return (OrnamentPosition.bottomRight, CGPoint(x: right, y: bottom))
    } else if let bottom = bottom, let left = left {
      return (OrnamentPosition.bottomLeft, CGPoint(x: left, y: bottom))
    }
    
    return nil
  }
}

// MARK: - event handlers

extension RCTMGLMapView {
  @objc func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnMapChange = value
    
    self.mapView.mapboxMap.onEvery(.cameraChanged, handler: { cameraEvent in
      if self.handleMapChangedEvents.contains(.regionIsChanging) {
        let event = RCTMGLEvent(type:.regionIsChanging, payload: self.buildRegionObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.cameraChanged) {
        let event = RCTMGLEvent(type:.cameraChanged, payload: self.buildStateObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      }
    })

    self.mapView.mapboxMap.onEvery(.mapIdle, handler: { cameraEvent in
      if self.handleMapChangedEvents.contains(.regionDidChange) {
        let event = RCTMGLEvent(type:.regionDidChange, payload: self.buildRegionObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.mapIdle) {
        let event = RCTMGLEvent(type:.mapIdle, payload: self.buildStateObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      }
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
  
  private func buildStateObject() -> [String: [String: Any]] {
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
        "isGestureActive": isGestureActive,
        "isAnimatingFromGesture": isAnimatingFromGesture
      ]
    ]
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
      "isUserInteraction": .boolean(isGestureActive),
      "isAnimatingFromUserInteraction": .boolean(isAnimatingFromGesture),
    ]
    return logged("buildRegionObject", errorResult: { ["error":["toJSON":$0.localizedDescription]] }) {
      try result.toJSON()
    }
  }
  
  public func setupEvents() {
    self.mapboxMap.onEvery(.mapLoadingError, handler: {(event) in
      if let data = event.data as? [String:Any], let message = data["message"] {
        Logger.log(level: .error, message: "MapLoad error \(message)")
      } else {
        Logger.log(level: .error, message: "MapLoad error \(event)")
      }
    })
    
    self.mapboxMap.onEvery(.styleImageMissing) { (event) in
      if let data = event.data as? [String:Any] {
        if let imageName = data["id"] as? String {

          self.images.forEach {
            if $0.addMissingImageToStyle(style: self.mapboxMap.style, imageName: imageName) {
              return
            }
          }
          
          self.images.forEach {
            $0.sendImageMissingEvent(imageName: imageName, event: event)
          }
        }
      }
    }

    self.mapboxMap.onEvery(.renderFrameFinished, handler: { (event) in
      var type = RCTMGLEvent.EventType.didFinishRendering
      var payload : [String:Any]? = nil
      if let data = event.data as? [String:Any] {
        if let renderMode = data["render-mode"], let renderMode = renderMode as? String, renderMode == "full" {
          type = .didFinishRenderingFully
        }
        payload = data
      }
      let event = RCTMGLEvent(type: type, payload: payload);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })

    self.mapboxMap.onNext(.mapLoaded, handler: { (event) in
      let event = RCTMGLEvent(type:.didFinishLoadingMap, payload: nil);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })
    
    self.mapboxMap.onEvery(.styleLoaded, handler: { (event) in
      self.onStyleLoadedComponents.forEach { (component) in
        component.addToMap(self, style: self.mapboxMap.style)
      }

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

extension RCTMGLMapView {
  @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnPress = value
    
    self.mapView.gestures.singleTapGestureRecognizer.removeTarget( pointAnnotationManager.manager, action: nil)
    self.mapView.gestures.singleTapGestureRecognizer.addTarget(self, action: #selector(doHandleTap(_:)))
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
        
        self.mapboxMap.queryRenderedFeatures(with: hitboxRect, options: options) { result in
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
          
          self.doHandleTapInSources(
            sources: nSources,
            tapPoint: tapPoint,
            hits: newHits,
            touchedSources: newTouchedSources,
            callback: callback
          )
        }
      } else {
        callback(hits, touchedSources)
      }
    }
  }
  
  func withHighestZIndex(sources: [RCTMGLInteractiveElement]) -> RCTMGLInteractiveElement? {
    return sources.first
  }
  
  @objc func doHandleTap(_ sender: UITapGestureRecognizer) {
    let tapPoint = sender.location(in: self)
    
    pointAnnotationManager.handleTap(sender) { (_: UITapGestureRecognizer) in
      DispatchQueue.main.async {
        let touchableSources = self.touchableSources()

        self.doHandleTapInSources(
          sources: touchableSources,
          tapPoint: tapPoint,
          hits: [:],
          touchedSources: [])
        { (hits, touchedSources) in
          let topSource = self.withHighestZIndex(sources: touchedSources)
          
          if let source = topSource, source.hasPressListener, let onPress = source.onPress {
            // If the individual source has a tap gesture recognizer, trigger it.
            guard let hitFeatures = hits[source.id] else {
              Logger.log(level:.error, message: "doHandleTap, no hits found when it should have")
              return
            }
            
            let features = hitFeatures.map { try? $0.feature.toJSON() }
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
          } else if let reactOnPress = self.reactOnPress {
            // If no individual gesture recognizer was found, register a press on the map.
            let location = self.mapboxMap.coordinate(for: tapPoint)
            
            var geojson = Feature(geometry: .point(Point(location)))
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
  
  @objc
  func doHandleLongPress(_ sender: UILongPressGestureRecognizer) {
    let position = sender.location(in: self)
    pointAnnotationManager.handleLongPress(sender) { (_: UILongPressGestureRecognizer) in
      DispatchQueue.main.async {
        let draggableSources = self.draggableSources()
        self.doHandleTapInSources(sources: draggableSources, tapPoint: position, hits: [:], touchedSources: []) { (hits, draggedSources) in
          if let source = self.withHighestZIndex(sources: draggedSources),
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
    isGestureActive = false
    if willAnimate {
      isAnimatingFromGesture = true
    }
  }
  
  public func gestureManager(_ gestureManager: GestureManager, didEndAnimatingFor gestureType: GestureType) {
    isGestureActive = false
    isAnimatingFromGesture = false
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
