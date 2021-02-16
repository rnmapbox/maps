import MapboxMaps

@objc class RCTMGLMapView : MapView {
    @objc func setReactStyleURL(_ value: String) {
        self.style.styleURL = StyleURL.custom(url: URL(string:value)!);
    }
    
    required init(frame:CGRect) {
        let resourceOptions = ResourceOptions(accessToken: MGLModule.accessToken!)
        super.init(with: frame, resourceOptions: resourceOptions)
    }
    
    required init (coder: NSCoder) {
        fatalError("not implemented")
    }
}
