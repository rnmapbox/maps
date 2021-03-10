import MapboxMaps
import Turf

@objc class RCTMGLMapView : MapView {
    var reactOnPress : RCTBubblingEventBlock? = nil
    var reactOnMapChange : RCTBubblingEventBlock? = nil
    
    var mapView : MapView {
        get { return self }
    }

    @objc func setReactStyleURL(_ value: String) {
        if let url = URL(string: value) {
            self.style.styleURL = StyleURL.custom(url: url);
        } else {
            if RCTJSONParse(value, nil) != nil {
                do {
                 try self.style.styleManager.setStyleJSONForJson(value)
                } catch {
                    RCTMGLLogging.error(.argumentError, "RCTMGLMapView.setReactStyleURL unexpected error \(error)");
                }
            }
        }
    }
    
    func fireEvent(event: RCTMGLEvent, callback: @escaping RCTBubblingEventBlock) {
        callback(event.toJSON())
    }
    
    @objc func handleTap(_ sender: UITapGestureRecognizer) {
        if let reactOnPress = self.reactOnPress {
            let tapPoint = sender.location(in: self)
            let location = mapView.coordinate(for: tapPoint)
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
    
    @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
        self.reactOnPress = value
        
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        self.addGestureRecognizer(tapGesture)
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
    
    func toJSON(geometry: Geometry, properties: [String: Any]? = nil) -> [String: Any] {
        let geojson = Feature(geometry: geometry);
        var result = try! GeoJSONManager.dictionaryFrom(geojson)!
        if let properties = properties {
            result["properties"] = properties
        }
        return result
    }
    
    func _makeRegionPayload() -> [String:Any] {
        return toJSON(
            geometry: .point(Point(mapView.centerCoordinate)),
            properties: [
                "zoomLevel" : Double(mapView.zoom),
                "heading": Double(mapView.cameraView.bearing),
                "bearing": Double(mapView.cameraView.bearing),
                "pitch": Double(mapView.cameraView.pitch),
                "visibleBounds": _toArray(bounds: mapView.cameraView.visibleCoordinateBounds)
            ]
        )
    }
    
    @objc func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
        self.reactOnMapChange = value
        self.mapView.on(.cameraChanged, handler: { cameraEvent in
            
            let event = RCTMGLEvent(type:.regionDidChange, payload: self._makeRegionPayload());
            self.fireEvent(event: event, callback: self.reactOnMapChange!)
        })
    }
    
    required init(frame:CGRect) {
        let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
        super.init(with: frame, resourceOptions: resourceOptions)
    }
    
    required init (coder: NSCoder) {
        fatalError("not implemented")
    }
}
