package com.mapbox.rctmgl.components;

import android.content.Context;

import com.facebook.react.views.view.ReactViewGroup;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView ;

public abstract class AbstractMapFeature extends ReactViewGroup {
    public AbstractMapFeature(Context context) {
        super(context);
    }

    public abstract void addToMap(RCTMGLMapView mapView);
    public abstract void removeFromMap(RCTMGLMapView mapView);
}
