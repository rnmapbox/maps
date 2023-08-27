package com.mapbox.rctmgl.components.styles.layers;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by nickitaliano on 9/8/17.
 */

public class RCTMGLFillLayerManager extends ViewGroupManager<RCTMGLFillLayer> {
    public static final String REACT_CLASS = "RCTMGLFillLayer";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLFillLayer createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLFillLayer(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLFillLayer layer, String id) {
        layer.setID(id);
    }

    @ReactProp(name="sourceID")
    public void setSourceID(RCTMGLFillLayer layer, String sourceID) {
        layer.setSourceID(sourceID);
    }

    @ReactProp(name="sourceLayerID")
    public void setSourceLayerId(RCTMGLFillLayer layer, String sourceLayerID) {
        layer.setSourceLayerID(sourceLayerID);
    }

    @ReactProp(name="aboveLayerID")
    public void setAboveLayerID(RCTMGLFillLayer layer, String aboveLayerID) {
        layer.setAboveLayerID(aboveLayerID);
    }

    @ReactProp(name="belowLayerID")
    public void setBelowLayerID(RCTMGLFillLayer layer, String belowLayerID) {
        layer.setBelowLayerID(belowLayerID);
    }

    @ReactProp(name="layerIndex")
    public void setLayerIndex(RCTMGLFillLayer layer, int layerIndex){
        layer.setLayerIndex(layerIndex);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLFillLayer layer, double minZoomLevel) {
        layer.setMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLFillLayer layer, double maxZoomLevel) {
        layer.setMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="reactStyle")
    public void setReactStyle(RCTMGLFillLayer layer, ReadableMap style) {
        layer.setReactStyle(style);
    }

    @ReactProp(name="filter")
    public void setFilter(RCTMGLFillLayer layer, ReadableArray filterList) {
        layer.setFilter(filterList);
    }
}
