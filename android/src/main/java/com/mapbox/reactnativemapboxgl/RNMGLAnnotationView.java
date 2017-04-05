package com.mapbox.reactnativemapboxgl;

import android.content.Context;
import android.util.Log;

import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.views.view.ReactViewGroup;
import com.mapbox.mapboxsdk.geometry.LatLng;

public class RNMGLAnnotationView extends ReactViewGroup {

    private final RNMGLAnnotationViewManager _manager;
    private String annotationId;
    private LatLng coordinate;

    public RNMGLAnnotationView(Context context, RNMGLAnnotationViewManager manager) {
        super(context);
        this._manager = manager;
    }

    public LayoutParams getShadowNodeMeasurements() {
        LayoutShadowNode shadowNode = _manager.getShadowNode();
        return new LayoutParams(
                (int)shadowNode.getLayoutWidth(),
                (int)shadowNode.getLayoutHeight()
        );
    }

    public String getAnnotationId() {
        return annotationId;
    }

    public void setAnnotationId(String annotationId) {
        this.annotationId = annotationId;
    }

    public LatLng getCoordinate() {
        return coordinate;
    }

    public void setCoordinate(LatLng coordinate) {
        this.coordinate = coordinate;
    }
}
