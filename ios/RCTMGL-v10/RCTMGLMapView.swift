import MapboxMaps
import Turf

@objc class RCTMGLMapView : MapView {
  var reactOnPress : RCTBubblingEventBlock? = nil
  var reactOnMapChange : RCTBubblingEventBlock? = nil
  
  var layerWaiters : [String:[(String) -> Void]] = [:]
    
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
      
      let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
      self.addGestureRecognizer(tapGesture)
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
    
  @objc func handleTap(_ sender: UITapGestureRecognizer) {
      if let reactOnPress = self.reactOnPress {
          let tapPoint = sender.location(in: self)
          let location = mapboxMap.coordinate(for: tapPoint)
          print("Tap point \(tapPoint) => \(location)")
          
          var geojson = Feature(geometry: .point(Point(location)));
          geojson.properties = [
              "screenPointX": Double(tapPoint.x),
              "screenPointY": Double(tapPoint.y)
          ];
          let event = try!  RCTMGLEvent(type:.tap, payload: GeoJSONManager.dictionaryFrom(geojson)!);
          self.fireEvent(event: event, callback: reactOnPress)
      }
  }
        
  func _toArray(bounds: CoordinateBounds) -> [[Double]] {
      return [
          [
              Double(bounds.northeast.longitude),
              Double(bounds.northeast.latitude),
          ],
          [
              Double(bounds.southwest.longitude),
              Double(bounds.southwest.latitude)
          ]
      ]
  }
    
    
  func toJSON(geometry: Turf.Geometry, properties: [String: Any]? = nil) -> [String: Any] {
      let geojson = Feature(geometry: geometry);
      var result = try! GeoJSONManager.dictionaryFrom(geojson)!
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
  }
    
  required init(frame:CGRect) {
      let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
      super.init(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))
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
}
