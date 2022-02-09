import MapboxMaps
import Turf

private extension MapboxMaps.PointAnnotationManager {
 // func doHandleTap(_ tap: UITapGestureRecognizer) {
 //   self.handleTap(tap)
 // }
}

class PointAnnotationManager : AnnotationInteractionDelegate {
  weak var selected : RCTMGLPointAnnotation? = nil
  
  func annotationManager(_ manager: AnnotationManager, didDetectTappedAnnotations annotations: [Annotation]) {
    guard annotations.count > 0 else {
      fatalError("didDetectTappedAnnotations: No annotations found")
    }
    
    for annotation in annotations {
      if let pointAnnotation = annotation as? PointAnnotation,
         let userInfo = pointAnnotation.userInfo {
        
        if let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation> {
          if let pt = rctmglPointAnnotation.object {
            if let selected = selected {
              selected.onDeselect()
            }
            pt.onSelect()
            selected = pt
          }
        }
      }
      /*
      
         let rctmglPointAnnotation = userInfo[RCTMGLPointAnnotation.key] as? WeakRef<RCTMGLPointAnnotation>,
         let rctmglPointAnnotation = rctmglPointAnnotation.object {
        rctmglPointAnnotation.didTap()
      }*/
    }
  }
  
  func handleTap(_ tap: UITapGestureRecognizer,  noAnnotationFound: @escaping (UITapGestureRecognizer) -> Void) {
    let layerId = manager.layerId
    let annotations = manager.annotations
    guard let mapFeatureQueryable = mapView?.mapboxMap else {
      noAnnotationFound(tap)
      return
    }
    let options = RenderedQueryOptions(layerIds: [layerId], filter: nil)
//    var handled = false
    mapFeatureQueryable.queryRenderedFeatures(
        at: tap.location(in: tap.view),
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
              self.annotationManager(
                self.manager,
                didDetectTappedAnnotations: tappedAnnotations)
              
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
    manager = annotations.makePointAnnotationManager()
    manager.delegate = self
    self.mapView = mapView
  }
  
  func remove(_ annotation: PointAnnotation) {
    manager.annotations.removeAll(where: {$0.id == annotation.id})
  }
  
  func add(_ annotation: PointAnnotation) {
    manager.annotations.append(annotation)
    manager.syncSourceAndLayerIfNeeded()
  }
}

public func dictionaryFrom(_ from: Turf.Feature?) throws -> [String:Any]? {
  let data = try JSONEncoder().encode(from)
  let value = try JSONSerialization.jsonObject(with: data) as? [String:Any]
  return value
}


@objc(RCTMGLMapView)
class RCTMGLMapView : MapView {
  var reactOnPress : RCTBubblingEventBlock? = nil
  var reactOnMapChange : RCTBubblingEventBlock? = nil
  
  var images : [RCTMGLImages] = []
  var sources : [RCTMGLSource] = []
  
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
    
  // -- react native properties
  
  @objc func setReactStyleURL(_ value: String?) {
    if let value = value {
      if let url = URL(string: value) {
        mapView.mapboxMap.loadStyleURI(StyleURI(rawValue: value)!)
      } else {
        if RCTJSONParse(value, nil) != nil {
          mapView.mapboxMap.loadStyleJSON(value)
        }
      }
    }
  }

  @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnPress = value

    /*
      let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
      self.addGestureRecognizer(tapGesture)
    */
    mapView.gestures.singleTapGestureRecognizer.removeTarget( pointAnnotationManager.manager, action: nil)
    mapView.gestures.singleTapGestureRecognizer.addTarget(self, action: #selector(doHandleTap(_:)))
  }

  @objc func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
    self.reactOnMapChange = value

    self.mapView.mapboxMap.onEvery(.cameraChanged, handler: { cameraEvent in
      let event = RCTMGLEvent(type:.regionDidChange, payload: self._makeRegionPayload());
      self.fireEvent(event: event, callback: self.reactOnMapChange!)
    })
  }
    
  func fireEvent(event: RCTMGLEvent, callback: @escaping RCTBubblingEventBlock) {
    callback(event.toJSON())
  }
  
  func _toArray(bounds: CoordinateBounds) -> [[Double]] {
    return [
      [
        Double(bounds.northeast.longitude),
        Double(bounds.northeast.latitude)
      ],
      [
        Double(bounds.southwest.longitude),
        Double(bounds.southwest.latitude)
      ]
    ]
  }
    
  func toJSON(geometry: Turf.Geometry, properties: [String: Any]? = nil) -> [String: Any] {
    let geojson = Feature(geometry: geometry);
  
    var result = try! dictionaryFrom(geojson)!
    if let properties = properties {
      result["properties"] = properties
    }
    return result
  }
    
  func _makeRegionPayload() -> [String:Any] {
    return toJSON(
      geometry: .point(Point(mapView.cameraState.center)),
      properties: [
        "zoomLevel" : Double(mapView.cameraState.zoom),
        "heading": Double(mapView.cameraState.bearing),
        "bearing": Double(mapView.cameraState.bearing),
        "pitch": Double(mapView.cameraState.pitch),
        "visibleBounds": _toArray(bounds: mapView.mapboxMap.cameraBounds.bounds)
      ]
    )
  }
    
  @objc override func insertReactSubview(_ subview: UIView!, at atIndex: Int) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      mapComponent.addToMap(self)
    }
    if let source = subview as? RCTMGLSource {
      sources.append(source)
    }
  }
  
  @objc override func removeReactSubview(_ subview:UIView!) {
    if let mapComponent = subview as? RCTMGLMapComponent {
      mapComponent.addToMap(self)
    }
    if let source = subview as? RCTMGLSource {
      sources.removeAll { $0 == source }
    }
  }

  required init(frame:CGRect) {
    let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
    super.init(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))

    setupEvents()
  }
  
  func setupEvents() {
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
    
    self.mapboxMap.onNext(.mapLoaded, handler: { (event) in
      let event = RCTMGLEvent(type:.didFinishLoadingMap, payload: nil);
      self.fireEvent(event: event, callback: self.reactOnMapChange!)
    })
  }
    
  required init (coder: NSCoder) {
      fatalError("not implemented")
  }
  
  func layerAdded (_ layer: Layer) {
      // V10 TODO
  }
  
  func waitForLayerWithID(_ layerId: String, _  callback: @escaping (_ layerId: String) -> Void) {
    let style = mapboxMap.style;
    if style.layerExists(withId: layerId) {
      callback(layerId)
    } else {
      layerWaiters[layerId, default: []].append(callback)
    }
  }

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

// MARK: - Touch

extension RCTMGLMapView {
  func touchableSources() -> [RCTMGLSource] {
    return sources.filter { $0.isTouchable() }
  }

  func doHandleTapInSources(sources: [RCTMGLSource], tapPoint: CGPoint, hits: [String: [QueriedFeature]], callback: @escaping (_ hits: [String: [QueriedFeature]]) -> Void) {
    DispatchQueue.main.async {
      if let source = sources.first {
        let hitbox = source.hitbox;
        
        let halfWidth = (hitbox["width"]?.doubleValue ?? RCTMGLSource.hitboxDefault) / 2.0;
        let halfHeight = (hitbox["height"]?.doubleValue  ?? RCTMGLSource.hitboxDefault) / 2.0;

        let top = tapPoint.y - halfHeight;
        let left = tapPoint.x - halfWidth;
        
        let hitboxRect = CGRect(x: left, y: top, width: halfWidth * 2.0, height: halfHeight * 2.0)

        let options = RenderedQueryOptions(
          layerIds: nil, filter: nil
        )
        self.mapboxMap.queryRenderedFeatures(in: hitboxRect, options: options) {
          result in
          
          var newHits = hits
          switch result {
           case .failure(let error):
            Logger.log(level: .error, message: "Error during handleTapInSources source.id=\(source.id ?? "n/a") error:\(error)")
          case .success(_):
              break
          }
          var nSources = sources
          nSources.removeFirst()
          self.doHandleTapInSources(sources: nSources, tapPoint: tapPoint, hits: newHits, callback: callback)
        }
      } else {
        callback(hits)
      }
    }
  }
  
  @objc
  func doHandleTap(_ sender: UITapGestureRecognizer) {
    let tapPoint = sender.location(in: self)
    pointAnnotationManager.handleTap(sender) { (_: UITapGestureRecognizer) in
      DispatchQueue.main.async {
        let touchableSources = self.touchableSources()
        var hits : [String: [QueriedFeature]] = [:]
        self.doHandleTapInSources(sources: touchableSources, tapPoint: tapPoint, hits: hits) { (hits) in
          
          if let reactOnPress = self.reactOnPress {
            let location = self.mapboxMap.coordinate(for: tapPoint)
            var geojson = Feature(geometry: .point(Point(location)));
            geojson.properties = [
              "screenPointX": .number(Double(tapPoint.x)),
              "screenPointY": .number(Double(tapPoint.y))
            ]
            let event = try!  RCTMGLEvent(type:.tap, payload: dictionaryFrom(geojson)!)
            self.fireEvent(event: event, callback: reactOnPress)
          }
        }
      }
    }
  }
}

// MARK: - queryTerrainElevation

extension RCTMGLMapView {
  func queryTerrainElevation(coordinates: [NSNumber]) -> Double? {
    return self.mapboxMap.elevation(at: CLLocationCoordinate2D(latitude: coordinates[1].doubleValue, longitude: coordinates[0].doubleValue))
  }
}


// MARK: - onMapReady
extension RCTMGLMapView {
  func onMapStyleLoaded(block: @escaping (MapboxMap) -> Void) {
    guard let mapboxMap = mapboxMap else {
      fatalError("mapboxMap is null")
    }
    
    if mapboxMap.style.isLoaded {
      block(mapboxMap)
    } else {
      mapboxMap.onNext(.styleLoaded) { _ in
        block(mapboxMap)
      }
    }
  }
}

