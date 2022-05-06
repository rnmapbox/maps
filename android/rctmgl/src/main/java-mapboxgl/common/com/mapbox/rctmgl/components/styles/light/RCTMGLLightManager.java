package com.mapbox.rctmgl.components.styles.light;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

/**
 * Created by nickitaliano on 9/26/17.
 */

public class RCTMGLLightManager extends ViewGroupManager<RCTMGLLight> {
    public static final String REACT_CLASS = "RCTMGLLight";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLLight createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLLight(reactContext);
    }

    @ReactProp(name="reactStyle")
    public void setReactStyle(RCTMGLLight light, ReadableMap reactStyle) {
        light.setReactStyle(reactStyle);
    }
}
