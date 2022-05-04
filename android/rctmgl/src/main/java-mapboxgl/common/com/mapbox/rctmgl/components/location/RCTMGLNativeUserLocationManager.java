package com.mapbox.rctmgl.components.location;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.mapboxsdk.location.modes.RenderMode;

import javax.annotation.Nonnull;

public class RCTMGLNativeUserLocationManager extends ViewGroupManager<RCTMGLNativeUserLocation> {
    public static final String REACT_CLASS = "RCTMGLNativeUserLocation";

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @ReactProp(name="androidRenderMode")
    public void setAndroidRenderMode(RCTMGLNativeUserLocation userLocation, String mode) {
       if ("compass".equalsIgnoreCase(mode)) {
           userLocation.setRenderMode(RenderMode.COMPASS);
        } else if ("gps".equalsIgnoreCase(mode)) {
           userLocation.setRenderMode(RenderMode.GPS);
        } else {
           userLocation.setRenderMode(RenderMode.NORMAL);
       }
    }

    @Nonnull
    @Override
    protected RCTMGLNativeUserLocation createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new RCTMGLNativeUserLocation(reactContext);
    }
}
