package com.mapbox.rctmgl.components.styles.sources;

import android.util.Log;

import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Created by nickitaliano on 9/19/17.
 */

public class RCTMGLShapeSourceManager extends ViewGroupManager<RCTMGLShapeSource> {
    public static final String LOG_TAG = RCTMGLShapeSourceManager.class.getSimpleName();
    public static final String REACT_CLASS = RCTMGLShapeSource.class.getSimpleName();

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLShapeSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLShapeSource(reactContext);
    }

    @ReactProp(name="id")
    public void setId(RCTMGLShapeSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name="url")
    public void setURL(RCTMGLShapeSource source, String urlStr) {
        try {
            source.setURL(new URL(urlStr));
        } catch (MalformedURLException e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }

    @ReactProp(name="shape")
    public void setGeometry(RCTMGLShapeSource source, String geoJSONStr) {
        source.setShape(geoJSONStr);
    }

    @ReactProp(name="cluster")
    public void setCluster(RCTMGLShapeSource source, int cluster) {
        source.setCluster(cluster == 1);
    }

    @ReactProp(name="clusterRadius")
    public void setClusterRadius(RCTMGLShapeSource source, int radius) {
        source.setClusterRadius(radius);
    }

    @ReactProp(name="clusterMaxZoom")
    public void setClusterMaxZoom(RCTMGLShapeSource source, int clusterMaxZoom) {
        source.setClusterMaxZoom(clusterMaxZoom);
    }

    @ReactProp(name="maxZoom")
    public void setMaxZoom(RCTMGLShapeSource source, int maxZoom) {
        source.setMaxZoom(maxZoom);
    }

    @ReactProp(name="buffer")
    public void setBuffer(RCTMGLShapeSource source, int buffer) {
        source.setBuffer(buffer);
    }

    @ReactProp(name="tolerance")
    public void setTolerance(RCTMGLShapeSource source, double tolerance) {
        source.setTolerance(tolerance);
    }

    @ReactProp(name="images")
    public void setImages(RCTMGLShapeSource source, ReadableMap map) {
        List<Map.Entry<String, String>> images = new ArrayList<>();

        ReadableMapKeySetIterator iterator = map.keySetIterator();
        while (iterator.hasNextKey()) {
            String imageName = iterator.nextKey();
            images.add(new AbstractMap.SimpleEntry<String, String>(imageName, map.getString(imageName)));
        }

        source.setImages(images);
    }
}
