package com.mapbox.rctmgl.components.styles.sources;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;

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
    public Map<String, String> customEvents() {
        return new HashMap<>();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLVectorSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLVectorSource(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLVectorSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name="url")
    public void setUrl(RCTMGLVectorSource source, String url) {
        source.setURL(url);
    }
}
