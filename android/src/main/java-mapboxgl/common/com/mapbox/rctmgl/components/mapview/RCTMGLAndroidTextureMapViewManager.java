package com.mapbox.rctmgl.components.mapview;

import com.facebook.react.bridge.ReactApplicationContext;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

/**
 * Created by hernanmateo on 12/11/18.
 */

public class RCTMGLAndroidTextureMapViewManager extends RCTMGLMapViewManager {
    public static final String LOG_TAG = "RCTMGLAndroidTextureMapViewManager";
    public static final String REACT_CLASS = "RCTMGLAndroidTextureMapView";

    public RCTMGLAndroidTextureMapViewManager(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLAndroidTextureMapView createViewInstance(ThemedReactContext themedReactContext) {
        MapboxMapOptions options = new MapboxMapOptions();
        options.textureMode(true);
        return new RCTMGLAndroidTextureMapView(themedReactContext, this, options);
    }
}
