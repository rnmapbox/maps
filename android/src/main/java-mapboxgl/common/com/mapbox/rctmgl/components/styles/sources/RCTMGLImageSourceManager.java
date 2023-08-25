package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.view.View;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.imagehelper.ImageSource;
import com.mapbox.mapboxsdk.geometry.LatLngQuad;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;

/**
 * Created by nickitaliano on 11/29/17.
 */

public class RCTMGLImageSourceManager extends ViewGroupManager<RCTMGLImageSource> {
    public static final String REACT_CLASS = "RCTMGLImageSource";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLImageSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLImageSource(reactContext);
    }

    @Override
    public View getChildAt(RCTMGLImageSource source, int childPosition) {
        return source.getLayerAt(childPosition);
    }

    @Override
    public int getChildCount(RCTMGLImageSource source) {
        return source.getLayerCount();
    }

    @Override
    public void addView(RCTMGLImageSource source, View childView, int childPosition) {
        source.addLayer(childView, childPosition);
    }

    @Override
    public void removeViewAt(RCTMGLImageSource source, int childPosition) {
        source.removeLayer(childPosition);
    }

    @ReactProp(name = "id")
    public void setId(RCTMGLImageSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name = "url")
    public void setUrl(RCTMGLImageSource source, String url) {
        source.setURL(url);
    }

    @ReactProp(name = "coordinates")
    public void setCoordinates(RCTMGLImageSource source, ReadableArray arr) {
        LatLngQuad quad = GeoJSONUtils.toLatLngQuad(arr);

        if (quad == null) {
            return;
        }

        source.setCoordinates(quad);
    }
}
