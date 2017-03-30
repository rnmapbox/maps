package com.mapbox.reactnativemapboxgl;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.mapboxsdk.geometry.LatLng;

public class RNMGLAnnotationViewManager extends ViewGroupManager<RNMGLAnnotationView> {
    private LayoutShadowNode _shadowNode;

    private static final String NAME = "RCTMapboxAnnotation";

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    protected RNMGLAnnotationView createViewInstance(ThemedReactContext reactContext) {
        return new RNMGLAnnotationView(reactContext, this);
    }

    @Override
    public LayoutShadowNode createShadowNodeInstance() {
        _shadowNode = super.createShadowNodeInstance();
        return _shadowNode;
    }

    public LayoutShadowNode getShadowNode() {
        return _shadowNode;
    }

    // Props

    @ReactProp(name = "id")
    public void setAnnotationId(RNMGLAnnotationView view, String value) {
        view.setAnnotationId(value);
    }

    @ReactProp(name = "coordinate")
    public void setCoordinate(RNMGLAnnotationView view, ReadableMap map) {
        LatLng coordinate = new LatLng();
        coordinate.setLatitude(map.getDouble("latitude"));
        coordinate.setLongitude(map.getDouble("longitude"));
        view.setCoordinate(coordinate);
    }
}
