package com.rnmapbox.rnmbx.components.styles.light;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class RNMBXLightManager extends ViewGroupManager<RNMBXLight> {
    public static final String REACT_CLASS = "RNMBXLight";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RNMBXLight createViewInstance(ThemedReactContext reactContext) {
        return new RNMBXLight(reactContext);
    }

    @ReactProp(name="reactStyle")
    public void setReactStyle(RNMBXLight light, ReadableMap reactStyle) {
        light.setReactStyle(reactStyle);
    }
}
