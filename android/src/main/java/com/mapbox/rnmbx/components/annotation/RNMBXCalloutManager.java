package com.mapbox.rnmbx.components.annotation;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RNMBXCalloutManager extends ViewGroupManager<RNMBXCallout> {
    public static final String REACT_CLASS = "RNMBXCallout";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RNMBXCallout createViewInstance(ThemedReactContext reactContext) {
        return new RNMBXCallout(reactContext);
    }
}
