package com.mapbox.rctmgl.components.styles.layers;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.util.ArrayList;

/**
 * Created by nickitaliano on 9/18/17.
 */

public class RCTMGLCircleLayerManager extends ViewGroupManager<RCTMGLCircleLayer> {
    public static final String REACT_CLASS = "RCTMGLCircleLayer";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLCircleLayer createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLCircleLayer(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLCircleLayer layer, String id) {
        layer.setID(id);
    }

    @ReactProp(name="sourceID")
    public void setSourceID(RCTMGLCircleLayer layer, String sourceID) {
        layer.setSourceID(sourceID);
    }

    @ReactProp(name="aboveLayerID")
    public void setAboveLayerID(RCTMGLCircleLayer layer, String aboveLayerID) {
        layer.setAboveLayerID(aboveLayerID);
    }

    @ReactProp(name="belowLayerID")
    public void setBelowLayerID(RCTMGLCircleLayer layer, String belowLayerID) {
        layer.setBelowLayerID(belowLayerID);
    }

    @ReactProp(name="layerIndex")
    public void setLayerIndex(RCTMGLCircleLayer layer, int layerIndex){
        layer.setLayerIndex(layerIndex);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLCircleLayer layer, double minZoomLevel) {
        layer.setMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLCircleLayer layer, double maxZoomLevel) {
        layer.setMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="reactStyle")
    public void setReactStyle(RCTMGLCircleLayer layer, ReadableMap style) {
        layer.setReactStyle(style);
    }

    @ReactProp(name="sourceLayerID")
    public void setSourceLayerId(RCTMGLCircleLayer layer, String sourceLayerID) {
        layer.setSourceLayerID(sourceLayerID);
    }

    @ReactProp(name="filter")
    public void setFilter(RCTMGLCircleLayer layer, ReadableArray filterList) {
        layer.setFilter(filterList);
    }
}
