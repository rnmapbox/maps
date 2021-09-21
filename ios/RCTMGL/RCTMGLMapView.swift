import MapboxMaps
import Turf

@objc class RCTMGLMapView : MapView {
    var reactOnPress : RCTBubblingEventBlock? = nil
    var reactOnMapChange : RCTBubblingEventBlock? = nil

    @objc func setReactStyleURL(_ value: String) {
        if let url = URL(string: value) {
            mapboxMap.style.uri = StyleURI(url: url);
        } else {
            if RCTJSONParse(value, nil) != nil {
                mapboxMap.style.styleManager.setStyleJSONForJson(value)
            }
        }
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
            let event = RCTMGLEvent(type: .tap, payload: toJSONDictionary(geojson: geojson));
            self.fireEvent(event: event, callback: reactOnPress)
        }
    }
    
    @objc func setReactOnPress(_ value: @escaping RCTBubblingEventBlock) {
        self.reactOnPress = value
        
        let tapGesture = UITapGestureRecognizer(target: self, action: #selector(handleTap))
        self.addGestureRecognizer(tapGesture)
    }

    func toJSONDictionary<T: GeoJSONObject>(geojson: T) -> [String: Any] {
        let result = try? JSONSerialization.jsonObject(with: JSONEncoder().encode(geojson)) as? [String: Any]
        return result!
    }

    func _makeRegionPayload() -> [String:Any] {
        let cameraState = mapboxMap.cameraState
        let bounds = mapboxMap.cameraBounds.bounds
        var feature = Feature(geometry: .point(Point(cameraState.center)));

        feature.properties = [
            "zoomLevel" : Double(cameraState.zoom),
            "heading": Double(cameraState.bearing),
            "bearing": Double(cameraState.bearing),
            "pitch": Double(cameraState.pitch),
            "visibleBounds": [
                [ Double(bounds.northeast.longitude), Double(bounds.northeast.latitude) ],
                [ Double(bounds.southwest.longitude), Double(bounds.southwest.latitude) ]
            ]
        ]

        return toJSONDictionary(geojson: feature)
    }

    @objc func setReactOnMapChange(_ value: @escaping RCTBubblingEventBlock) {
        self.reactOnMapChange = value
        mapboxMap.onEvery(.cameraChanged, handler: { cameraEvent in
            let event = RCTMGLEvent(type:.regionDidChange, payload: self._makeRegionPayload());
            self.fireEvent(event: event, callback: self.reactOnMapChange!)
        })
    }
    
    required init(frame:CGRect) {
        let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
        super.init(frame: frame, mapInitOptions: MapInitOptions(resourceOptions: resourceOptions))
    }
    
    required init (coder: NSCoder) {
        fatalError("not implemented")
    }
}
