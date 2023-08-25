package com.mapbox.rctmgl.components.styles.sources;

import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;

import java.util.ArrayList;
import java.util.List;

public abstract class RCTMGLTileSourceManager<T extends RCTMGLTileSource> extends AbstractEventEmitter<T> {

    RCTMGLTileSourceManager(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
    }

    @Override
    public View getChildAt(T source, int childPosition) {
        return source.getLayerAt(childPosition);
    }

    @Override
    public int getChildCount(T source) {
        return source.getLayerCount();
    }

    @Override
    public void addView(T source, View childView, int childPosition) {
        source.addLayer(childView, childPosition);
    }

    @Override
    public void removeViewAt(T source, int childPosition) {
        source.removeLayer(childPosition);
    }

    @ReactProp(name="id")
    public void setID(T source, String id) {
        source.setID(id);
    }

    @ReactProp(name="url")
    public void setURL(T source, String url) {
        source.setURL(url);
    }

    @ReactProp(name="tileUrlTemplates")
    public void setTileUrlTemplates(T source, ReadableArray tileUrlTemplates) {
        List<String> urls = new ArrayList<>();
        for (int i = 0; i < tileUrlTemplates.size(); i++) {
            if (tileUrlTemplates.getType(0) == ReadableType.String) {
                urls.add(tileUrlTemplates.getString(i));
            }
        }
        source.setTileUrlTemplates(urls);
    }

    @ReactProp(name="attribution")
    public void setAttribution(T source, String attribution) {
        source.setAttribution(attribution);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(T source, int minZoomLevel) {
        source.setMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(T source, int maxZoomLevel) {
        source.setMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="tms")
    public void setTMS(T source, boolean tms) {
        source.setTMS(tms);
    }
}
