package com.mapbox.rctmgl.components.styles.terrain;

import com.facebook.react.bridge.Dynamic;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.ArrayList;

public class RCTMGLTerrainManager extends ViewGroupManager<RCTMGLTerrain> {
    public static final String REACT_CLASS = "RCTMGLTerrain";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLTerrain createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLTerrain(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLTerrain layer, String id) {
        layer.setID(id);
    }

    @ReactProp(name="sourceID")
    public void setSourceID(RCTMGLTerrain layer, String sourceID) {
        layer.setSourceID(sourceID);
    }

    @ReactProp(name="exaggeration")
    public void setExaggeration(RCTMGLTerrain layer, Dynamic exaggeration) {
        layer.setExaggeration(exaggeration);
    }

}
