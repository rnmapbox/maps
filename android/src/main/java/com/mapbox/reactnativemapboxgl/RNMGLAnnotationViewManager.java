package com.mapbox.reactnativemapboxgl;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.mapboxsdk.geometry.LatLng;

import java.util.HashMap;

public class RNMGLAnnotationViewManager extends ViewGroupManager<RNMGLAnnotationView> {

    private static final String NAME = "RCTMapboxAnnotation";

    @Override
    public String getName() {
        return NAME;
    }

    @Override
    protected RNMGLAnnotationView createViewInstance(ThemedReactContext reactContext) {
        return new RNMGLAnnotationView(reactContext);
    }

    @Override
    public Class<? extends LayoutShadowNode> getShadowNodeClass() {
        return SizeReportingShadowNode.class;
    }

    @Override
    public LayoutShadowNode createShadowNodeInstance() {
        return new SizeReportingShadowNode();
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

    @Override
    public void updateExtraData(RNMGLAnnotationView view, Object extraData) {
        // This is called from the {@link SizeReportingShadowNode}. We cache
        // the width and height so that we can set the correct size on the marker
        // view annotations in ReactNativeMapboxGLView RNMGLCustomMarkerViewAdapter.
        HashMap<String, Float> data = (HashMap<String, Float>) extraData;
        float width = data.get("width");
        float height = data.get("height");
        view.setLayoutDimensions(width, height);
    }
}
