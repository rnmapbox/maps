package com.mapbox.rctmgl.components.annotation;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

public class RCTMGLCalloutManager extends ViewGroupManager<RCTMGLCallout> {
    public static final String REACT_CLASS = "RCTMGLCallout";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLCallout createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLCallout(reactContext);
    }
}
