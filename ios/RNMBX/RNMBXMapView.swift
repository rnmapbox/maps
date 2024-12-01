@_spi(Restricted) import MapboxMaps
import Turf
import MapKit

public typealias RNMBXMapViewFactoryFunc = (String, UIView) -> (MapView?)

/**
 * InitWaiter: simple waiters gets queued unitl the init happens
 */
class InitWaiter<Type> {
  var object: Type? = nil;
  typealias Callback = (_ t:Type) -> Void;
  var waiters: [Callback] = []

  /// if the object has value call immediately, otherwise queue
  func callOrWait(_ callback: @escaping Callback) {
    if let object = object {
      callback(object)
      assert(waiters.count == 0, "the object is inited but there are still waiters")
    } else {
      waiters.append(callback)
    }
  }
  
  func hasInited() -> Bool {
    return object != nil
  }
  
  /// call whan the object has inited, queued calls will be executed
  func onInit(_ object: Type) {
    self.object = object
    let oldWaiters = waiters
    waiters = []
    oldWaiters.forEach { $0(object) }
  }
  
  /// reset, calls will be queued again
  func reset() {
    self.object = nil
  }
}


/**
 * Experimental MapView factory for advanced usecases
 */
public class RNMBXMapViewFactory {
  private static var factories: [String: RNMBXMapViewFactoryFunc] = [:];
  
  static func get(_ id: String) -> RNMBXMapViewFactoryFunc? {
    if let id = id.split(separator: ":", maxSplits: 1).first {
      return factories[String(id)]
    }
    return nil
  }
  
  public static func register(_ id: String, factory: @escaping RNMBXMapViewFactoryFunc) {
    factories.updateValue(factory, forKey: id)
  }
}

class FeatureEntry {
  let feature: RNMBXMapComponent
  let view: UIView
  var addedToMap: Bool = false

  init(feature:RNMBXMapComponent, view: UIView, addedToMap: Bool = false) {
    self.feature = feature
    self.view = view
    self.addedToMap = addedToMap
  }
}

#if RNMBX_11
extension QueriedRenderedFeature {
  var feature : Feature { return queriedFeature.feature }
}
#else
typealias QueriedRenderedFeature = QueriedFeature
#endif

#if RNMBX_11
public struct MapEventType<Payload> {
    var method: (_ map: MapboxMap) -> Signal<Payload>

    init(_ method: @escaping (MapboxMap) -> Signal<Payload>) {
        self.method = method
    }

    /// The style has been fully loaded, and the map has rendered all visible tiles.
  public static var mapLoaded: MapEventType<MapLoaded> { .init( \.onMapLoaded ) }
    /// An error that has occurred while loading the Map.
    public static var mapLoadingError: MapEventType<MapLoadingError> { .init(\.onMapLoadingError) }
    /// The requested style has been fully loaded.
    public static var styleLoaded: MapEventType<StyleLoaded> { .init(\.onStyleLoaded) }
    /// The requested style data has been loaded.
    public static var styleDataLoaded: MapEventType<StyleDataLoaded> { .init(\.onStyleDataLoaded) }
    /// The camera has changed.
    public static var cameraChanged: MapEventType<CameraChanged> { .init(\.onCameraChanged) }
    /// The map has entered the idle state.
    public static var mapIdle: MapEventType<MapIdle> { .init(\.onMapIdle) }
    /// The source has been added.
    public static var sourceAdded: MapEventType<SourceAdded> { .init(\.onSourceAdded) }
    /// The source has been removed.
    public static var sourceRemoved: MapEventType<SourceRemoved> { .init(\.onSourceRemoved) }
    /// A source data has been loaded.
    public static var sourceDataLoaded: MapEventType<SourceDataLoaded> { .init(\.onSourceDataLoaded) }
    /// A style has a missing image.
    public static var styleImageMissing: MapEventType<StyleImageMissing> { .init(\.onStyleImageMissing) }
    /// An image added to the style is no longer needed and can be removed.
    public static var styleImageRemoveUnused: MapEventType<StyleImageRemoveUnused> { .init(\.onStyleImageRemoveUnused) }
    /// The map started rendering a frame.
    public static var renderFrameStarted: MapEventType<RenderFrameStarted> { .init(\.onRenderFrameStarted) }
    /// The map finished rendering a frame.
    public static var renderFrameFinished: MapEventType<RenderFrameFinished> { .init(\.onRenderFrameFinished) }
    /// Resource requiest as been made.
    public static var resourceRequest: MapEventType<ResourceRequest> { .init(\.onResourceRequest) }
}

typealias MapLoadingErrorPayload = MapLoadingError
#endif

class RNMBXCameraChanged : RNMBXEvent, RCTEvent {
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

@objc(RNMBXMapView)
open class RNMBXMapView: UIView, RCTInvalidating {
  
  public func invalidate() {
    self.removeAllFeaturesFromMap(reason: .ViewRemoval)

#if RNMBX_11
    cancelables.forEach { $0.cancel() }
    cancelables.removeAll()
#endif
    
    _mapView.gestures.delegate = nil
    _mapView.removeFromSuperview()
    _mapView = nil
    
    self.removeFromSuperview()
  }
  
  var imageManager: ImageManager = ImageManager()

  var tapDelegate: IgnoreRNMBXMakerViewGestureDelegate? = nil
  
  var eventDispatcher: RCTEventDispatcherProtocol
  
  var reactOnPress : RCTBubblingEventBlock?
  var reactOnLongPress : RCTBubblingEventBlock?
  var reactOnMapChange : RCTBubblingEventBlock?
  
  @objc
  var onCameraChanged: RCTDirectEventBlock?
  
  var styleLoadWaiters = InitWaiter<MapboxMap>()
  var cameraWaiters = InitWaiter<MapView>()
  
  var features: [FeatureEntry] = []
  
  weak var reactCamera : RNMBXCamera?
  var images : [RNMBXImages] = []
  var sources : [RNMBXInteractiveElement] = []
  
  var handleMapChangedEvents = Set<RNMBXEvent.EventType>()
  
  var eventListeners : [Cancelable] = []
  
  private var isPendingInitialLayout = true
  private var wasGestureActive = false
  private var isGestureActive = false
  
  var layerWaiters : [String:[(String) -> Void]] = [:]

  @objc
  public var deselectAnnotationOnTap: Bool = false

  @objc
  public var mapViewImpl : String? = nil
  
#if RNMBX_11
  var cancelables = Set<AnyCancelable>()
#endif
  
  lazy var pointAnnotationManager : RNMBXPointAnnotationManager = {
    let result = RNMBXPointAnnotationManager(annotations: mapView.annotations, mapView: mapView)
    self._removeMapboxLongPressGestureRecognizer()
    return result
  }()
  
  lazy var calloutAnnotationManager : MapboxMaps.PointAnnotationManager = {
    return mapView.annotations.makePointAnnotationManager(id: "RNMBX-mapview-callouts")
  }()
  
  var _mapView: MapView! = nil
  func createMapView() -> MapView {
    if let mapViewImpl = mapViewImpl, let mapViewInstance = createAndAddMapViewImpl(mapViewImpl, self) {
      _mapView = mapViewInstance
    } else {
  #if RNMBX_11
      _mapView = MapView(frame: self.bounds, mapInitOptions:  MapInitOptions())
  #else
      let accessToken = RNMBXModule.accessToken
      if accessToken == nil {
        Logger.log(level: .error, message: "No accessToken set, please call Mapbox.setAccessToken(...)")
      }
      let resourceOptions = ResourceOptions(accessToken: accessToken ?? "")
      _mapView = MapView(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))
  #endif
      _mapView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      addSubview(_mapView)
    }
    
    _mapView.gestures.delegate = self
    setupEvents()
    afterMapViewAdded()
    return _mapView
  }

  func createAndAddMapViewImpl(_ impl: String, _ view: RNMBXMapView) -> MapView? {
    if let factory = RNMBXMapViewFactory.get(impl) {
      return factory(impl, view) as? MapView;
    } else {
      Logger.log(level:.error, message: "No mapview factory registered for: \(impl)")
      return nil
    }
  }

  @available(*, deprecated, renamed: "withMapView", message: "mapView can be nil if the map initialization has not finished, use withMapView instead")
  public var mapView : MapView! {
    get { return _mapView }
  }
  
  @available(*, deprecated, renamed: "withMapboxMap", message: "mapboxMap can be nil if the map initialization has not finished, use withMapboxMap instead")
  var mapboxMap: MapboxMap! {
    get { _mapView?.mapboxMap }
  }

  @objc public func addToMap(_ subview: UIView) {
    withMapView { mapView in
      if let mapComponent = subview as? RNMBXMapComponent {
        let style = mapView.mapboxMap.style
        var addToMap = false
        if mapComponent.waitForStyleLoad() {
          if (self.styleLoadWaiters.hasInited()) {
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
        self.features.append(entry)
      } else {
        subview.reactSubviews()?.forEach { self.addToMap($0) }
      }
      if let source = subview as? RNMBXInteractiveElement {
        self.sources.append(source)
      }
    }
  }
  
  @objc public func removeFromMap(_ subview: UIView) {
    if let mapComponent = subview as? RNMBXMapComponent {
      var entryIndex = features.firstIndex { $0.view == subview }
      if let entryIndex = entryIndex {
        var entry = features[entryIndex]
        if (entry.addedToMap) {
          mapComponent.removeFromMap(self, reason: .OnDestroy)
          entry.addedToMap = false
        }
        features.remove(at: entryIndex)
      }
    } else {
      subview.reactSubviews()?.forEach { removeFromMap($0) }
    }
    if let source = subview as? RNMBXInteractiveElement {
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

  @objc public required init(frame:CGRect, eventDispatcher: RCTEventDispatcherProtocol) {
    self.eventDispatcher = eventDispatcher
    super.init(frame: frame)
  }
  
  public required init (coder: NSCoder) {
    fatalError("not implemented")
  }
  
  func layerAdded (_ layer: Layer) {
    // TODO
  }
  
  func waitForLayerWithID(_ layerId: String, _  callback: @escaping (_ layerId: String) -> Void) {
    let style = mapView.mapboxMap.style;
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
  let changes : PropertyChanges<RNMBXMapView> = PropertyChanges()
  var mapViewWaiters = InitWaiter<MapView>()
  
  enum Property : String {
    case projection
    case localizeLabels
    case attribution
    case logo
    case compass
    case scaleBar
    case onLongPress
    case onPress
    case zoomEnabled
    case scrollEnabled
    case rotateEnabled
    case pitchEnabled
    case onMapChange
    case styleURL
    case gestureSettings
    
    func apply(_ map: RNMBXMapView) -> Void {
      switch self {
      case .projection:
        map.applyProjection()
      case .localizeLabels:
        map.applyLocalizeLabels()
      case .attribution:
        map.applyAttribution()
      case .logo:
        map.applyLogo()
      case .compass:
        map.applyCompass()
      case .scaleBar:
        map.applyScaleBar()
      case .onLongPress:
        map.applyOnLongPress()
      case .onPress:
        map.applyOnPress()
      case .zoomEnabled:
        map.applyZoomEnabled()
      case .scrollEnabled:
        map.applyScrollEnabled()
      case .rotateEnabled:
        map.applyRotateEnabled()
      case .onMapChange:
        map.applyOnMapChange()
      case .styleURL:
        map.applyStyleURL()
        map.applyLocalizeLabels()
      case .pitchEnabled:
        map.applyPitchEnabled()
      case .gestureSettings:
        map.applyGestureSettings()
      }
    }
  }
  
  func changed(_ property: Property) {
    changes.add(name: property.rawValue, update: property.apply)
  }
  
  func withMapView(callback: @escaping (_: MapView) -> Void) {
    mapViewWaiters.callOrWait(callback)
  }
  
  func withMapboxMap(callback: @escaping (_: MapboxMap) -> Void) {
    if let mapboxMap = _mapView?.mapboxMap {
      callback(mapboxMap)
    } else {
      mapViewWaiters.callOrWait { mapView in
        callback(mapView.mapboxMap)
      }
    }
  }
  
  var projection: StyleProjection?
  
  @objc public func setReactProjection(_ value: String?) {
    if let value = value {
      projection = StyleProjection(name: value == "globe" ? .globe : .mercator)
    } else {
      projection = nil
    }
    changed(.projection)
  }
  
  func applyProjection() {
    logged("RNMBXMapView.setReactProjection") {
      if let projection = projection {
        try self.mapboxMap.style.setProjection(projection)
      }
    }
  }
  
  var locale: (layerIds: [String]?, locale: Locale)? = nil
  
  @objc public func setReactLocalizeLabels(_ value: NSDictionary?) {
    if let value = value {
      let localeString = value["locale"] as! String
      let layerIds = value["layerIds"] as! [String]?
      let locale = localeString == "current" ? Locale.current : Locale(identifier: localeString)
      self.locale = (layerIds, locale)
    }
    changed(.localizeLabels)
  }
  
  func applyLocalizeLabels() {
    onMapStyleLoaded { _ in
      logged("RNMBXMapView.\(#function)") {
        if let locale = self.locale {
          try self.mapboxMap.style.localizeLabels(into: locale.locale, forLayerIds: locale.layerIds)
        }
      }
    }
  }
  
  struct GestureSettings {
    var doubleTapToZoomInEnabled: Bool? = nil;
    var doubleTouchToZoomOutEnabled: Bool? = nil;
    var pinchPanEnabled: Bool? = nil;
    var pinchZoomEnabled: Bool? = nil;
    var pitchEnabled: Bool? = nil;
    var quickZoomEnabled: Bool? = nil;
    var rotateEnabled: Bool? = nil;
    var panEnabled: Bool? = nil;
    var panDecelerationFactor: CGFloat? = nil;
    #if RNMBX_11
    var simultaneousRotateAndPinchZoomEnabled: Bool? = nil;
    #endif
  }
  
  var gestureSettings = GestureSettings()
  
  @objc
  public func setReactGestureSettings(_ value: NSDictionary?) {
    if let value = value {
      var options = gestureSettings
      if let doubleTapToZoomInEnabled = value["doubleTapToZoomInEnabled"] as? NSNumber {
        options.doubleTapToZoomInEnabled = doubleTapToZoomInEnabled.boolValue
      }
      if let doubleTouchToZoomOutEnabled = value["doubleTouchToZoomOutEnabled"] as? NSNumber {
        options.doubleTouchToZoomOutEnabled = doubleTouchToZoomOutEnabled.boolValue
      }
      if let pinchScrollEnabled = value["pinchPanEnabled"] as? NSNumber {
        options.pinchPanEnabled = pinchScrollEnabled.boolValue
      }
      if let pinchZoomEnabled = value["pinchZoomEnabled"] as? NSNumber {
        options.pinchZoomEnabled = pinchZoomEnabled.boolValue
      }
      /* android only
       if let pinchZoomDecelerationEnabled = value["pinchZoomDecelerationEnabled"] as? NSNumber {
       options.pinchZoomDecelerationEnabled = pinchZoomDecelerationEnabled.boolValue
       }
       */
      if let pitchEnabled = value["pitchEnabled"] as? NSNumber {
        options.pitchEnabled = pitchEnabled.boolValue
      }
      if let quickZoomEnabled = value["quickZoomEnabled"] as? NSNumber {
        options.quickZoomEnabled = quickZoomEnabled.boolValue
      }
      if let rotateEnabled = value["rotateEnabled"] as? NSNumber {
        options.rotateEnabled = rotateEnabled.boolValue
      }
      /* android only
       if let rotateDecelerationEnabled = value["rotateDecelerationEnabled"] as? NSNumber {
       options.rotateDecelerationEnabled = rotateDecelerationEnabled.boolValue
       }*/
      if let panEnabled = value["panEnabled"] as? NSNumber {
        options.panEnabled = panEnabled.boolValue
      }
      if let panDecelerationFactor = value["panDecelerationFactor"] as? NSNumber {
        options.panDecelerationFactor = panDecelerationFactor.CGFloat
      }
#if RNMBX_11
      if let simultaneousRotateAndPinchZoomEnabled = value["simultaneousRotateAndPinchZoomEnabled"] as? NSNumber {
        options.simultaneousRotateAndPinchZoomEnabled = simultaneousRotateAndPinchZoomEnabled.boolValue
      }
#endif
      /* android only
       if let zoomAnimationAmount = value["zoomAnimationAmount"] as? NSNumber {
       options.zoomAnimationAmount = zoomAnimationAmount.CGFloat
       }*/
      gestureSettings = options
      
      changed(.gestureSettings)
    }
  }
  
  func applyGestureSettings() {
    if let gestures = self.mapView?.gestures {
      var options = gestures.options
      let settings = gestureSettings
      if let doubleTapToZoomInEnabled = settings.doubleTapToZoomInEnabled as? Bool {
        options.doubleTapToZoomInEnabled = doubleTapToZoomInEnabled
      }
      if let doubleTouchToZoomOutEnabled = settings.doubleTouchToZoomOutEnabled as? Bool {
        options.doubleTouchToZoomOutEnabled = doubleTouchToZoomOutEnabled
      }
      if let pinchPanEnabled = settings.pinchPanEnabled as? Bool {
        options.pinchPanEnabled = pinchPanEnabled
      }
      if let pinchZoomEnabled = settings.pinchZoomEnabled as? Bool {
        options.pinchZoomEnabled = pinchZoomEnabled
      }
      if let pitchEnabled = settings.pitchEnabled as? Bool {
        options.pitchEnabled = pitchEnabled
      }
      if let quickZoomEnabled = settings.quickZoomEnabled as? Bool {
        options.quickZoomEnabled = quickZoomEnabled
      }
      if let rotateEnabled = settings.rotateEnabled as? Bool {
        options.rotateEnabled = rotateEnabled
      }
      /* android only
       if let rotateDecelerationEnabled = value["rotateDecelerationEnabled"] as? NSNumber {
       options.rotateDecelerationEnabled = rotateDecelerationEnabled.boolValue
       }*/
      if let panEnabled = settings.panEnabled as? Bool {
        options.panEnabled = panEnabled
      }
      if let panDecelerationFactor = settings.panDecelerationFactor as? CGFloat {
        options.panDecelerationFactor = panDecelerationFactor
      }
#if RNMBX_11
      if let simultaneousRotateAndPinchZoomEnabled = settings.simultaneousRotateAndPinchZoomEnabled as? Bool {
        options.simultaneousRotateAndPinchZoomEnabled = simultaneousRotateAndPinchZoomEnabled
      }
#endif
      /* android only
       if let zoomAnimationAmount = value["zoomAnimationAmount"] as? NSNumber {
       options.zoomAnimationAmount = zoomAnimationAmount.CGFloat
       }*/
      if options != gestures.options {
        gestures.options = options
      }
    }
  }
  
  var attributionEnabled: OrnamentVisibility? = nil
  var attributionOptions: (position: OrnamentPosition, margins: CGPoint)? = nil
  
  @objc public func setReactAttributionEnabled(_ value: Bool) {
    attributionEnabled = value ? .visible : .hidden
    changed(.attribution)
  }
  
  func applyAttribution() {
    if let visibility = attributionEnabled {
      mapView.ornaments.options.attributionButton.visibility = visibility
    }
    if let options = attributionOptions {
      mapView.ornaments.options.attributionButton.position = options.position
      mapView.ornaments.options.attributionButton.margins = options.margins
    }
  }
  
  @objc public func setReactAttributionPosition(_ position: [String: NSNumber]) {
    attributionOptions = self.getOrnamentOptionsFromPosition(position)
    changed(.attribution)
  }
  
  var logoEnabled: OrnamentVisibility? = nil
  var logoOptions: (position: OrnamentPosition, margins: CGPoint)? = nil
  
  @objc public func setReactLogoEnabled(_ value: Bool) {
    logoEnabled = value ? .visible : .hidden
    changed(.logo)
  }
  
  @objc public func setReactLogoPosition(_ position: [String: NSNumber]) {
    logoOptions = self.getOrnamentOptionsFromPosition(position)
    changed(.logo)
  }
  
  func applyLogo() {
    if let visibility = logoEnabled {
      mapView.ornaments.options.logo.visibility = visibility
    }
    if let options = logoOptions {
      mapView.ornaments.options.logo.position = options.position
      mapView.ornaments.options.logo.margins = options.margins
    }
  }
  
  var compassEnabled: Bool = false
  var compassPosition: OrnamentPosition? = nil
  var compassMargins: CGPoint? = nil
  var compassFadeWhenNorth: Bool = false
  var compassImage: String?

  @objc public func setReactCompassEnabled(_ value: Bool) {
    compassEnabled = value
    changed(.compass)
  }

  @objc public func setReactCompassFadeWhenNorth(_ value: Bool) {
    compassFadeWhenNorth = value
    changed(.compass)
  }
  
  @objc public func setReactCompassPosition(_ position: [String: NSNumber]) {
    if let compassOptions = self.getOrnamentOptionsFromPosition(position) {
      compassPosition = compassOptions.position
      compassMargins = compassOptions.margins
      changed(.compass)
    }
  }

  @objc public func setReactCompassViewPosition(_ position: NSInteger) {
    compassPosition = toOrnamentPositon(Int(truncating: NSNumber(value: position)))
    changed(.compass)
  }
  
  @objc public func setReactCompassViewMargins(_ margins: CGPoint) {
    compassMargins = margins
    changed(.compass)
  }

  @objc public func setReactCompassImage(_ image: String) {
    compassImage = image.isEmpty ? nil : image
    changed(.compass)
  }
    
  func applyCompass() {
    var visibility: OrnamentVisibility = .hidden
    if compassEnabled {
      visibility = compassFadeWhenNorth ? .adaptive : .visible
    }
    mapView.ornaments.options.compass.visibility = visibility
    
    if let position = compassPosition {
      mapView.ornaments.options.compass.position = position
    }
    if let margina = compassMargins {
      mapView.ornaments.options.compass.margins = margina
    }
    
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

  var scaleBarEnabled: Bool? = nil
  var scaleBarPosition: OrnamentPosition? = nil
  var scaleBarMargins: CGPoint? = nil
  
  @objc public func setReactScaleBarEnabled(_ value: Bool) {
    scaleBarEnabled = value
    changed(.scaleBar)
  }
  
  @objc public func setReactScaleBarPosition(_ position: [String: NSNumber]) {
    if let ornamentOptions = self.getOrnamentOptionsFromPosition(position) {
      scaleBarPosition = ornamentOptions.position
      scaleBarMargins = ornamentOptions.margins
    }
  }
  
  func applyScaleBar() {
    if let enabled = scaleBarEnabled {
      mapView.ornaments.options.scaleBar.visibility = enabled ? .visible : .hidden
    }
    if let position = scaleBarPosition {
      mapView.ornaments.options.scaleBar.position = position
    }
    if let margins = scaleBarMargins {
      mapView.ornaments.options.scaleBar.margins = margins
    }
  }

  @objc override public func didSetProps(_ props: [String]) {
    if (_mapView == nil) {
      let view = createMapView()
      
      mapViewWaiters.onInit(view)
    }
    changes.apply(self)
  }

  var zoomEnabled: Bool? = nil
  @objc public func setReactZoomEnabled(_ value: Bool) {
    self.zoomEnabled = value
    changed(.zoomEnabled)
  }

  func applyZoomEnabled() {
    if let value = zoomEnabled {
      self.mapView.gestures.options.quickZoomEnabled = value
      self.mapView.gestures.options.doubleTapToZoomInEnabled = value
      self.mapView.gestures.options.pinchZoomEnabled = value
    }
  }

  var scrollEnabled: Bool? = nil
  @objc public func setReactScrollEnabled(_ value: Bool) {
    self.scrollEnabled = value
    changed(.scrollEnabled)
  }
  
  func applyScrollEnabled() {
    if let value = scrollEnabled {
      self.mapView.gestures.options.panEnabled = value
      self.mapView.gestures.options.pinchPanEnabled = value
    }
  }

  var rotateEnabled: Bool? = nil
  @objc public func setReactRotateEnabled(_ value: Bool) {
    rotateEnabled = value
    changed(.rotateEnabled)
  }
  
  func applyRotateEnabled() {
    if let value = rotateEnabled {
      self.mapView.gestures.options.rotateEnabled = value
    }
  }

  
  var pitchEnabled: Bool? = nil
  @objc public func setReactPitchEnabled(_ value: Bool) {
    self.pitchEnabled = value
    changed(.pitchEnabled)
  }
  func applyPitchEnabled() {
    if let value = pitchEnabled {
      self.mapView.gestures.options.pitchEnabled = value
    }
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
  
  var reactStyleURL: String? = nil
  @objc public func setReactStyleURL(_ value: String?) {
    self.reactStyleURL = value
    changed(.styleURL)
  }
  
  public func applyStyleURL() {
    var initialLoad = !self.styleLoadWaiters.hasInited()
    if !initialLoad { refreshComponentsBeforeStyleChange() }
    if let value = reactStyleURL {
      self.styleLoadWaiters.reset()

      if let _ = URL(string: value) {
          if let styleURI = StyleURI(rawValue: value) {
              mapView.mapboxMap.loadStyleURI(styleURI)
          } else {
              let event = RNMBXEvent(type:.mapLoadingError, payload: ["error": "invalid URI: \(value)"]);
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
    let event = RNMBXEvent(type:.willStartLoadingMap, payload: nil);
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
  
  // MARK: - hooks for subclasses
  open func afterMapViewAdded() {}
}

// MARK: - event handlers

extension RNMBXMapView {
  #if RNMBX_11
  private func onEvery<T>(event: MapEventType<T>, handler: @escaping (RNMBXMapView, T) -> Void) {
    let signal = event.method(self.mapView.mapboxMap)
    signal.observe { [weak self] (mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }.store(in: &cancelables)
  }
  
  private func onNext<T>(event: MapEventType<T>, handler: @escaping (RNMBXMapView, T) -> Void) {
    let signal = event.method(self.mapView.mapboxMap)
    signal.observeNext { [weak self] (mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }.store(in: &cancelables)
  }
  #else
  private func onEvery<Payload>(event: MapEvents.Event<Payload>, handler: @escaping  (RNMBXMapView, MapEvent<Payload>) -> Void) {
    let eventListener = self.mapView.mapboxMap.onEvery(event: event) { [weak self](mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }
    eventListeners.append(eventListener)
    if eventListeners.count > 20 {
      Logger.log(level:.warn, message: "RNMBXMapView.onEvery, too much handler installed");
    }
  }

  private func onNext<Payload>(event: MapEvents.Event<Payload>, handler: @escaping  (RNMBXMapView, MapEvent<Payload>) -> Void) {
    self.mapView.mapboxMap.onNext(event: event) { [weak self](mapEvent) in
      guard let self = self else { return }

      handler(self, mapEvent)
    }
  }
  #endif

  @objc public func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnMapChange = value
    changed(.onMapChange)
  }

  func applyOnMapChange() {
    self.onEvery(event: .cameraChanged, handler: { (self, cameraEvent) in
      self.wasGestureActive = self.isGestureActive
      if self.handleMapChangedEvents.contains(.regionIsChanging) {
        let event = RNMBXEvent(type:.regionIsChanging, payload: self.buildRegionObject())
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.cameraChanged) {
        let event = RNMBXCameraChanged(type:.cameraChanged, payload: self.buildStateObject(), reactTag: self.reactTag)
        self.eventDispatcher.send(event)
      }
    })

    self.onEvery(event: .mapIdle, handler: { (self, cameraEvent) in
      if self.handleMapChangedEvents.contains(.regionDidChange) {
        let event = RNMBXEvent(type:.regionDidChange, payload: self.buildRegionObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      } else if self.handleMapChangedEvents.contains(.mapIdle) {
        let event = RNMBXEvent(type:.mapIdle, payload: self.buildStateObject());
        self.fireEvent(event: event, callback: self.reactOnMapChange)
      }
      
      self.wasGestureActive = false
    })
  }

  private func fireEvent(event: RNMBXEvent, callback: RCTBubblingEventBlock?) {
    guard let callback = callback else {
      Logger.log(level: .error, message: "fireEvent failed: \(event) - callback is null")
      return
    }
    fireEvent(event: event, callback: callback)
  }

  private func fireEvent(event: RNMBXEvent, callback: @escaping RCTBubblingEventBlock) {
    callback(event.toJSON())
  }
  
  private func buildStateObject() -> [String: Any] {
    let cameraOptions = CameraOptions(cameraState: mapView.cameraState)
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
    let cameraOptions = CameraOptions(cameraState: mapView.cameraState)
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
      #if RNMBX_11
      let error = eventPayload
      #else
      let error = eventPayload.error
      #endif
      var payload : [String:String] = [
        "error": error.errorDescription ?? error.localizedDescription
      ]
      if let tileId = eventPayload.tileId {
        payload["tileId"] = "x:\(tileId.x) y:\(tileId.y) z:\(tileId.z)"
      }
      if let sourceId = eventPayload.sourceId {
        payload["sourceId"] = sourceId
      }
      let RNMBXEvent = RNMBXEvent(type: .mapLoadingError, payload: payload);
      self.fireEvent(event: RNMBXEvent, callback: self.reactOnMapChange)

      if let message = error.errorDescription {
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
      var type = RNMBXEvent.EventType.didFinishRendering
      if event.payload.renderMode == .full {
        type = .didFinishRenderingFully
      }
      let payload : [String:Any] = [
        "renderMode": event.payload.renderMode.rawValue,
        "needsRepaint": event.payload.needsRepaint,
        "placementChanged": event.payload.placementChanged
      ]
      let event = RNMBXEvent(type: type, payload: payload);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })

    self.onNext(event: .mapLoaded, handler: { (self, event) in
      let event = RNMBXEvent(type:.didFinishLoadingMap, payload: nil);
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })
    
    self.onEvery(event: .styleLoaded, handler: { (self, event) in
      self.addFeaturesToMap(style: self.mapboxMap.style)
      
      if !self.styleLoadWaiters.hasInited(), let mapboxMap = self.mapboxMap {
        self.styleLoadWaiters.onInit(mapboxMap)
      }

      let event = RNMBXEvent(type:.didFinishLoadingStyle, payload: nil)
      self.fireEvent(event: event, callback: self.reactOnMapChange)
    })
  }
}

// MARK: - gestures

class IgnoreRNMBXMakerViewGestureDelegate : NSObject, UIGestureRecognizerDelegate {
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
      if (act is RNMBXMarkerView) {
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

extension RNMBXMapView {
  
  @objc public func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnPress = value
    changed(.onPress)
  }
  
  func applyOnPress() {
    let singleTapGestureRecognizer = self.mapView.gestures.singleTapGestureRecognizer

    singleTapGestureRecognizer.removeTarget(pointAnnotationManager.manager, action: nil)
    singleTapGestureRecognizer.addTarget(self, action: #selector(doHandleTap(_:)))

    self.tapDelegate = IgnoreRNMBXMakerViewGestureDelegate(originalDelegate: singleTapGestureRecognizer.delegate)
    singleTapGestureRecognizer.delegate = tapDelegate
  }

  @objc public func setReactOnLongPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnLongPress = value
    changed(.onLongPress)
  }
  
  func applyOnLongPress() {
    if (reactOnLongPress != nil) {
      let longPressGestureRecognizer = UILongPressGestureRecognizer(target: self, action: #selector(doHandleLongPress(_:)))
      self.mapView.addGestureRecognizer(longPressGestureRecognizer)
    }
  }
}

extension MapboxMaps.PointAnnotationManager {
  public func refresh() {
    #if !RNMBX_11
    syncSourceAndLayerIfNeeded()
    #else
    self.annotations = annotations
    #endif
  }
}

extension RNMBXMapView: GestureManagerDelegate {
  private func draggableSources() -> [RNMBXInteractiveElement] {
    return sources.filter { $0.isDraggable() }
  }
  private func touchableSources() -> [RNMBXInteractiveElement] {
    return sources.filter { $0.isTouchable() }
  }

  private func doHandleTapInSources(sources: [RNMBXInteractiveElement], tapPoint: CGPoint, hits: [String: [QueriedRenderedFeature]], touchedSources: [RNMBXInteractiveElement], callback: @escaping (_ hits: [String: [QueriedRenderedFeature]], _ touchedSources: [RNMBXInteractiveElement]) -> Void) {
    DispatchQueue.main.async {
      if let source = sources.first {
        let hitbox = source.hitbox;
        
        let halfWidth = (hitbox["width"]?.doubleValue ?? RNMBXInteractiveElement.hitboxDefault) / 2.0;
        let halfHeight = (hitbox["height"]?.doubleValue  ?? RNMBXInteractiveElement.hitboxDefault) / 2.0;

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
  
  func highestZIndex(sources: [RNMBXInteractiveElement]) -> RNMBXInteractiveElement? {
    var layersToSource : [String:RNMBXInteractiveElement] = [:]
    
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
  
  
  
  func _tapEvent(_ tapPoint: CGPoint) -> RNMBXEvent {
    let location = self.mapboxMap.coordinate(for: tapPoint)
    var geojson = Feature(geometry: .point(Point(location)));
    geojson.properties = [
      "screenPointX": .number(Double(tapPoint.x)),
      "screenPointY": .number(Double(tapPoint.y))
    ]
    let event = RNMBXEvent(type:.tap, payload: logged("reactOnPress") { try geojson.toJSON() })
    return event
  }
  
  @objc
  func doHandleTap(_ sender: UITapGestureRecognizer) {
    let tapPoint = sender.location(in: self)
    pointAnnotationManager.handleTap(sender) { (_: UITapGestureRecognizer) in
      DispatchQueue.main.async {
        if (self.deselectAnnotationOnTap) {
          if (self.pointAnnotationManager.deselectCurrentlySelected(deselectAnnotationOnTap: true)) {
            return
          }
        }
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
            let event = RNMBXEvent(
              type: (source is RNMBXVectorSource) ? .vectorSourceLayerPress : .shapeSourceLayerPress,
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
              self.fireEvent(event: self._tapEvent(tapPoint), callback: reactOnPress)
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
            let event = RNMBXEvent(
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
               let event = RNMBXEvent(type:.longPress, payload: logged("doHandleLongPress") { try geojson.toJSON() })
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

extension RNMBXMapView
{
  @objc public func takeSnap(
    writeToDisk:Bool) -> URL
  {
    UIGraphicsBeginImageContextWithOptions(self.bounds.size, true, 0);

    self.drawHierarchy(in: self.bounds, afterScreenUpdates: true)
    let snapshot = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();

    return writeToDisk ? RNMBImageUtils.createTempFile(snapshot!) :  RNMBImageUtils.createBase64(snapshot!)
  }
}

extension RNMBXMapView {
  func queryTerrainElevation(coordinates: [NSNumber]) -> Double? {
    return self.mapboxMap.elevation(at: CLLocationCoordinate2D(latitude: coordinates[1].doubleValue, longitude: coordinates[0].doubleValue))
  }
}

extension RNMBXMapView {
  func onMapStyleLoaded(block: @escaping (MapboxMap) -> Void) {
    guard let mapboxMap = mapboxMap else {
      fatalError("mapboxMap is null")
    }
    
    styleLoadWaiters.callOrWait(block)
  }
}

typealias LayerSourceDetails = (source: String?, sourceLayer: String?)

#if RNMBX_11
func getLayerSourceDetails(layer: (any Layer)?) -> LayerSourceDetails? {
    if let circleLayer = layer as? CircleLayer {
        return (circleLayer.source, circleLayer.sourceLayer)
    } else if let fillExtrusionLayer = layer as? FillExtrusionLayer {
        return (fillExtrusionLayer.source, fillExtrusionLayer.sourceLayer)
    } else if let fillLayer = layer as? FillLayer {
        return (fillLayer.source, fillLayer.sourceLayer)
    } else if let heatmapLayer = layer as? HeatmapLayer {
        return (heatmapLayer.source, heatmapLayer.sourceLayer)
    } else if let hillshadeLayer = layer as? HillshadeLayer {
        return (hillshadeLayer.source, hillshadeLayer.sourceLayer)
    } else if let lineLayer = layer as? LineLayer {
        return (lineLayer.source, lineLayer.sourceLayer)
    } else if let rasterLayer = layer as? RasterLayer {
        return (rasterLayer.source, rasterLayer.sourceLayer)
    } else if let symbolLayer = layer as? SymbolLayer {
        return (symbolLayer.source, symbolLayer.sourceLayer)
    } else {
        return nil
    }
}
#endif

extension RNMBXMapView {
  func setSourceVisibility(_ visible: Bool, sourceId: String, sourceLayerId: String?) -> Void {
    let style = self.mapboxMap.style
    
    style.allLayerIdentifiers.forEach { layerInfo in
      let layer = logged("setSourceVisibility.layer", info: { "\(layerInfo.id)" }) {
        try style.layer(withId: layerInfo.id)
      }

      #if RNMBX_11
        let sourceDetails = getLayerSourceDetails(layer: layer)
      #else
        let sourceDetails: LayerSourceDetails? = (source: layer?.source, sourceLayer: layer?.sourceLayer)
      #endif

      if let layer = layer, let sourceDetails = sourceDetails {
        if sourceDetails.source == sourceId {
          var good = true
          if let sourceLayerId = sourceLayerId {
            if sourceLayerId != sourceDetails.sourceLayer {
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

class RNMBXPointAnnotationManager : AnnotationInteractionDelegate {
  weak var selected : RNMBXPointAnnotation? = nil
  private var draggedAnnotation: PointAnnotation?
  
  func annotationManager(_ manager: AnnotationManager, didDetectTappedAnnotations annotations: [Annotation]) {
    // We handle taps ourselfs
    //   onTap(annotations: annotations)
  }
  
  func deselectCurrentlySelected(deselectAnnotationOnTap: Bool = false) -> Bool {
    if let selected = selected {
      selected.doDeselect(deselectAnnotationOnMapTap: deselectAnnotationOnTap)
      self.selected = nil
      return true
    }
    return false
  }
  
  func onAnnotationClick(pointAnnotation: RNMBXPointAnnotation) {
    let oldSelected = selected
    var newSelected: RNMBXPointAnnotation? = pointAnnotation
    
    if (newSelected == oldSelected) {
      newSelected = nil
    }
    
    deselectCurrentlySelected()

    if let newSelected = newSelected {
      newSelected.doSelect()
      selected = newSelected
    }
  }
  
  func lookup(_ annotation: PointAnnotation) -> RNMBXPointAnnotation? {
    guard let userInfo = annotation.userInfo else {
        return nil
    }
    if let rnmbxPointAnnotationWeakRef = userInfo[RNMBXPointAnnotation.key] as? WeakRef<RNMBXPointAnnotation> {
      if let rnmbxPointAnnotation = rnmbxPointAnnotationWeakRef.object {
        return rnmbxPointAnnotation
      }
    }
    #if RNMBX_11
    // see https://github.com/rnmapbox/maps/issues/3121
    if let rnmbxPointAnnotation = annotations.object(forKey: annotation.id as NSString) {
      return rnmbxPointAnnotation;
    }
    #endif
    return nil
  }
  

  func onTap(annotations: [Annotation]) {
    guard annotations.count > 0 else {
      fatalError("didDetectTappedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let annotation = annotation as? PointAnnotation {
        if let pointAnnotation = lookup(annotation) {
          onAnnotationClick(pointAnnotation: pointAnnotation)
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
    manager = annotations.makePointAnnotationManager(id: "RNMBX-mapview-point-annotations")
    manager.delegate = self
    self.mapView = mapView
  }

  func onDragHandler(_ manager: AnnotationManager, didDetectDraggedAnnotations annotations: [Annotation], dragState: UILongPressGestureRecognizer.State, targetPoint: CLLocationCoordinate2D) {
    guard annotations.count > 0 else {
      fatalError("didDetectDraggedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation,
         let pt = lookup(pointAnnotation) {
            let position = pt.superview?.convert(pt.layer.position, to: nil)
            var geojson = Feature(geometry: .point(Point(targetPoint)))
          geojson.identifier = .string(pt.id)
          geojson.properties = [
            "screenPointX": .number(Double(position!.x)),
            "screenPointY": .number(Double(position!.y))
          ]
          let event = RNMBXEvent(type:.longPress, payload: logged("doHandleLongPress") { try geojson.toJSON() })
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
                let enabledAnnotations = draggedAnnotations.filter { self.lookup($0)?.draggable ?? false }
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
  
  #if RNMBX_11
  var annotations = NSMapTable<NSString, RNMBXPointAnnotation>.init(
        keyOptions: .copyIn,
        valueOptions: .weakMemory
    )
  #endif
  
  func add(_ annotation: PointAnnotation, _ rnmbxPointAnnotation: RNMBXPointAnnotation) {
    manager.annotations.append(annotation)
    manager.refresh()
    #if RNMBX_11
    annotations.setObject(rnmbxPointAnnotation, forKey: annotation.id as NSString)
    #endif
  }
  
  func update(_ annotation: PointAnnotation) {
    let index = manager.annotations.firstIndex { $0.id == annotation.id }
    
    guard let index = index else {
      Logger.log(level: .warn, message: "RNMBX - PointAnnotation.refresh: annotation not found")
      return
    }
    
    manager.annotations[index] = annotation
    manager.refresh()
  }
}

