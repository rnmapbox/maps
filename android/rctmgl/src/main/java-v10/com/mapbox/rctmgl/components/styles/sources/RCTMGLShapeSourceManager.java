package com.mapbox.rctmgl.components.styles.sources;

import android.content.Context;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.media.Image;
import android.util.Log;
import android.view.View;

import androidx.annotation.Nullable;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
// import com.mapbox.rctmgl.components.annotation.RCTMGLCallout;
import com.mapbox.rctmgl.components.mapview.RCTMGLMapView;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ExpressionParser;
import com.mapbox.rctmgl.utils.ImageEntry;
// import com.mapbox.rctmgl.utils.ResourceUtils;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.AbstractMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class RCTMGLShapeSourceManager extends AbstractEventEmitter<RCTMGLShapeSource> {
    public static final String LOG_TAG = "RCTMGLShapeSourceManager";
    public static final String REACT_CLASS = "RCTMGLShapeSource";

    private ReactApplicationContext mContext;

    public RCTMGLShapeSourceManager(ReactApplicationContext context) {
        super(context);
        mContext = context;
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected RCTMGLShapeSource createViewInstance(ThemedReactContext reactContext) {
        return new RCTMGLShapeSource(reactContext, this);
    }

    @Override
    public View getChildAt(RCTMGLShapeSource source, int childPosition) {
        return source.getLayerAt(childPosition);
    }

    @Override
    public int getChildCount(RCTMGLShapeSource source) {
        return source.getLayerCount();
    }

    @Override
    public void addView(RCTMGLShapeSource source, View childView, int childPosition) {
        source.addLayer(childView, getChildCount(source));
    }

    @Override
    public void removeViewAt(RCTMGLShapeSource source, int childPosition) {
        source.removeLayer(childPosition);
    }

    @ReactProp(name = "id")
    public void setId(RCTMGLShapeSource source, String id) {
        source.setID(id);
    }

    @ReactProp(name = "url")
    public void setURL(RCTMGLShapeSource source, String urlStr) {
        try {
            source.setURL(new URL(urlStr));
        } catch (MalformedURLException e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }

    @ReactProp(name = "shape")
    public void setGeometry(RCTMGLShapeSource source, String geoJSONStr) {
        source.setShape(geoJSONStr);
    }

    @ReactProp(name = "cluster")
    public void setCluster(RCTMGLShapeSource source, int cluster) {
        source.setCluster(cluster == 1);
    }

    @ReactProp(name = "clusterRadius")
    public void setClusterRadius(RCTMGLShapeSource source, int radius) {
        source.setClusterRadius(radius);
    }

    @ReactProp(name = "clusterMaxZoomLevel")
    public void setClusterMaxZoomLevel(RCTMGLShapeSource source, int clusterMaxZoom) {
        source.setClusterMaxZoom(clusterMaxZoom);
    }

    @ReactProp(name = "maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLShapeSource source, int maxZoom) {
        source.setMaxZoom(maxZoom);
    }

    @ReactProp(name = "buffer")
    public void setBuffer(RCTMGLShapeSource source, int buffer) {
        source.setBuffer(buffer);
    }

    @ReactProp(name = "tolerance")
    public void setTolerance(RCTMGLShapeSource source, double tolerance) {
        source.setTolerance(tolerance);
    }

    @ReactProp(name = "lineMetrics")
    public void setLineMetrics(RCTMGLShapeSource source, boolean lineMetrics) {
        source.setLineMetrics(lineMetrics);
    }

    @ReactProp(name = "hasPressListener")
    public void setHasPressListener(RCTMGLShapeSource source, boolean hasPressListener) {
        source.setHasPressListener(hasPressListener);
    }

    @ReactProp(name="hitbox")
    public void setHitbox(RCTMGLShapeSource source, ReadableMap map) {
        source.setHitbox(map);
    }

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.SHAPE_SOURCE_LAYER_CLICK, "onMapboxShapeSourcePress")
                .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
                .build();
    }

    //region React Methods
    public static final int METHOD_FEATURES = 103;
    public static final int METHOD_GET_CLUSTER_EXPANSION_ZOOM = 104;
    public static final int METHOD_GET_CLUSTER_LEAVES = 105;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("features", METHOD_FEATURES)
                .put("getClusterExpansionZoom", METHOD_GET_CLUSTER_EXPANSION_ZOOM)
                .put("getClusterLeaves", METHOD_GET_CLUSTER_LEAVES)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLShapeSource source, int commandID, @Nullable ReadableArray args) {
        switch (commandID) {
            case METHOD_FEATURES:
                source.querySourceFeatures(
                        args.getString(0),
                        ExpressionParser.from(args.getArray(1))
                );
                break;
            case METHOD_GET_CLUSTER_EXPANSION_ZOOM:
                source.getClusterExpansionZoom(args.getString(0), args.getInt(1));
                break;
            case METHOD_GET_CLUSTER_LEAVES:
                source.getClusterLeaves(
                        args.getString(0),
                        args.getInt(1),
                        args.getInt(2),
                        args.getInt((3))
                );
                break;
        }
    }
}
