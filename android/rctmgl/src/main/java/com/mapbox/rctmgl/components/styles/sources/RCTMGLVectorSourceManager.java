package com.mapbox.rctmgl.components.styles.sources;

import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.events.constants.EventKeys;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLVectorSourceManager extends AbstractEventEmitter<RCTMGLVectorSource> {
    public static final String REACT_CLASS = RCTMGLVectorSource.class.getSimpleName();

    public RCTMGLVectorSourceManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLVectorSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLVectorSource(reactContext, this);
    }

    @Override
    public View getChildAt(RCTMGLVectorSource source, int childPosition) {
        return source.getLayerAt(childPosition);
    }

    @Override
    public int getChildCount(RCTMGLVectorSource source) {
        return source.getLayerCount();
    }

    @Override
    public void addView(RCTMGLVectorSource source, View childView, int childPosition) {
        source.addLayer(childView, childPosition);
    }

    @Override
    public void removeViewAt(RCTMGLVectorSource source, int childPosition) {
        source.removeLayer(childPosition);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLVectorSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name="url")
    public void setUrl(RCTMGLVectorSource source, String url) {
        source.setURL(url);
    }

    @ReactProp(name = "hasPressListener")
    public void setHasPressListener(RCTMGLVectorSource source, boolean hasPressListener) {
        source.setHasPressListener(hasPressListener);
    }

    @ReactProp(name="hitbox")
    public void setHitbox(RCTMGLVectorSource source, ReadableMap map) {
        source.setHitbox(map);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.VECTOR_SOURCE_LAYER_CLICK, "onMapboxVectorSourcePress")
                .build();
    }
}
