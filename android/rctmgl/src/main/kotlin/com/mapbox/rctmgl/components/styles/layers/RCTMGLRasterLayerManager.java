package com.mapbox.rctmgl.components.styles.layers;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class RCTMGLRasterLayerManager extends ViewGroupManager<RCTMGLRasterLayer> {
    public static final String REACT_CLASS = "RCTMGLRasterLayer";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLRasterLayer createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLRasterLayer(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLRasterLayer layer, String id) {
        layer.setID(id);
    }

    @ReactProp(name="sourceID")
    public void setSourceID(RCTMGLRasterLayer layer, String sourceID) {
        layer.setSourceID(sourceID);
    }

    @ReactProp(name="aboveLayerID")
    public void setAboveLayerID(RCTMGLRasterLayer layer, String aboveLayerID) {
        layer.setAboveLayerID(aboveLayerID);
    }

    @ReactProp(name="belowLayerID")
    public void setBelowLayerID(RCTMGLRasterLayer layer, String belowLayerID) {
        layer.setBelowLayerID(belowLayerID);
    }

    @ReactProp(name="layerIndex")
    public void setLayerIndex(RCTMGLRasterLayer layer, int layerIndex){
        layer.setLayerIndex(layerIndex);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLRasterLayer layer, double minZoomLevel) {
        layer.setMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLRasterLayer layer, double maxZoomLevel) {
        layer.setMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="reactStyle")
    public void setReactStyle(RCTMGLRasterLayer layer, ReadableMap style) {
        layer.setReactStyle(style);
    }
}
