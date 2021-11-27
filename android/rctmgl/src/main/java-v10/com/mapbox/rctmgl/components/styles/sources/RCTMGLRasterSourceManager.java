package com.mapbox.rctmgl.components.styles.sources;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.Map;

import javax.annotation.Nonnull;

public class RCTMGLRasterSourceManager extends RCTMGLTileSourceManager<RCTMGLRasterSource> {
    public static final String REACT_CLASS = "RCTMGLRasterSource";

    public RCTMGLRasterSourceManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Nonnull
    @Override
    protected RCTMGLRasterSource createViewInstance(@Nonnull ThemedReactContext reactContext) {
        return new RCTMGLRasterSource(reactContext);
    }

    @ReactProp(name="tileSize")
    public void setTileSize(RCTMGLRasterSource source, int tileSize) {
        source.setTileSize(tileSize);
    }

    @Override
    public Map<String, String> customEvents() {
        return null;
    }
}
