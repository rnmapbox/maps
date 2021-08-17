package com.mapbox.rctmgl.components.mapview;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.PointF;
import android.graphics.RectF;
import android.location.Location;
import android.os.Handler;
import androidx.annotation.NonNull;
import androidx.annotation.UiThread;

import android.util.DisplayMetrics;
import android.util.Pair;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
// import com.mapbox.mapboxsdk.log.Logger;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.mapbox.android.gestures.MoveGestureDetector;
import com.mapbox.geojson.Feature;
import com.mapbox.geojson.FeatureCollection;
/*
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.camera.CameraUpdate;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.geometry.VisibleRegion;
import com.mapbox.mapboxsdk.maps.AttributionDialogManager;
import com.mapbox.mapboxsdk.maps.MapView;
import com.mapbox.mapboxsdk.maps.MapboxMap;
import com.mapbox.mapboxsdk.maps.MapboxMapOptions;
import com.mapbox.mapboxsdk.maps.OnMapReadyCallback;
import com.mapbox.mapboxsdk.maps.Style;
import com.mapbox.mapboxsdk.maps.UiSettings;
import com.mapbox.mapboxsdk.plugins.localization.LocalizationPlugin;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolClickListener;
import com.mapbox.mapboxsdk.plugins.annotation.OnSymbolDragListener;
import com.mapbox.mapboxsdk.plugins.annotation.Symbol;
import com.mapbox.mapboxsdk.plugins.annotation.SymbolManager;
import com.mapbox.mapboxsdk.style.expressions.Expression;
import com.mapbox.mapboxsdk.style.layers.Layer;
import com.mapbox.mapboxsdk.style.layers.Property;

 */
import com.mapbox.geojson.Point;
import com.mapbox.maps.ScreenCoordinate;
import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.maps.plugin.gestures.MapboxMapUtils;
// import com.mapbox.maps.plugin.gestures.GesturesUtils;
import com.mapbox.maps.extension.style.layers.LayerUtils;
import com.mapbox.maps.plugin.delegates.MapPluginExtensionsDelegate;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener;
import com.mapbox.maps.plugin.delegates.listeners.eventdata.MapLoadErrorType;
import com.mapbox.maps.plugin.gestures.OnMapClickListener;
import com.mapbox.rctmgl.R;
import com.mapbox.rctmgl.components.AbstractMapFeature;
/*
import com.mapbox.rctmgl.components.annotation.RCTMGLPointAnnotation;
import com.mapbox.rctmgl.components.annotation.RCTMGLMarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerView;
import com.mapbox.rctmgl.components.annotation.MarkerViewManager;
import com.mapbox.rctmgl.components.camera.RCTMGLCamera;
import com.mapbox.rctmgl.components.images.RCTMGLImages;
import com.mapbox.rctmgl.components.location.LocationComponentManager;
import com.mapbox.rctmgl.components.location.RCTMGLNativeUserLocation;
import com.mapbox.rctmgl.components.mapview.helpers.CameraChangeTracker;
import com.mapbox.rctmgl.components.styles.layers.RCTLayer;
import com.mapbox.rctmgl.components.styles.light.RCTMGLLight;
import com.mapbox.rctmgl.components.styles.sources.RCTMGLShapeSource;
import com.mapbox.rctmgl.events.AndroidCallbackEvent;
import com.mapbox.rctmgl.events.IEvent;
import com.mapbox.rctmgl.events.MapChangeEvent;
import com.mapbox.rctmgl.events.constants.EventTypes;
import com.mapbox.rctmgl.utils.BitmapUtils;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.rctmgl.utils.GeoViewport;

 */


import com.mapbox.rctmgl.events.MapClickEvent;

import com.mapbox.rctmgl.components.styles.sources.RCTSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Locale;
import org.json.*;

import javax.annotation.Nullable;

import com.mapbox.maps.MapView;
import com.mapbox.maps.MapboxMap;
import com.mapbox.maps.Style;
import com.mapbox.maps.extension.style.layers.Layer;
import com.mapbox.maps.plugin.delegates.listeners.OnMapLoadErrorListener;

import com.mapbox.rctmgl.utils.LatLng;
import com.mapbox.rctmgl.utils.Logger;


// import static com.mapbox.mapboxsdk.style.layers.PropertyFactory.visibility;

public class RCTMGLMapView extends MapView implements OnMapClickListener {
    RCTMGLMapViewManager mManager;
    private Map<String, RCTSource> mSources;
    private String mStyleURL;
    private MapboxMap mMap;

    public RCTMGLMapView(Context context, RCTMGLMapViewManager manager/*, MapboxMapOptions options*/) {
        super(context);

        mManager = manager;
        mMap = this.getMapboxMap();
        mSources = new HashMap<>();

        MapboxMapUtils.addOnMapClickListener(mMap, this);
    }

    public void init() {

    }

    public void addFeature(View childView, int childPosition) {

    }

    public int getFeatureCount() {
        return 0;
    }

    public View getFeatureAt(int index) {
        return null;
    }

    public void removeFeature(int index) {
    }

    private void removeAllSourcesFromMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.removeFromMap(this);
        }
    }

    private void addAllSourcesToMap() {
        if (mSources.size() == 0) {
            return;
        }
        for (String key : mSources.keySet()) {
            RCTSource source = mSources.get(key);
            source.addToMap(this);
        }
    }

    public boolean isJSONValid(String test) {
        try {
            new JSONObject(test);
        } catch (JSONException ex) {
            return false;
        }
        return true;
    }

    public void setReactStyleURL(String styleURL) {
        mStyleURL = styleURL;

        if (mMap != null) {
            removeAllSourcesFromMap();

            if (isJSONValid(mStyleURL)) {

                mMap.loadStyleJson(mStyleURL, new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        addAllSourcesToMap();
                    }
                });
            } else {
                mMap.loadStyleUri(styleURL, new Style.OnStyleLoaded() {
                    @Override
                    public void onStyleLoaded(@NonNull Style style) {
                        addAllSourcesToMap();
                    }},
                    new OnMapLoadErrorListener() {
                        @Override
                        public void onMapLoadError(@NonNull MapLoadErrorType mapLoadErrorType, @NonNull String s) {
                            Logger.w("Hello","Hallo", null);
                        }
                    }
                );
            }
        }
    }

    @Override
    public boolean onMapClick(@NonNull Point point) {
        ScreenCoordinate screenPoint = mMap.pixelForCoordinate(point);

        MapClickEvent event = new MapClickEvent(this, new LatLng(point), screenPoint);
        mManager.handleEvent(event);
        return false;
    }

    public interface FoundLayerCallback {
        public void found(Layer layer);
    }

    private Map<String, List<FoundLayerCallback>> layerWaiters = new HashMap<String, List<FoundLayerCallback>>();

    public void layerAdded(Layer layer) {
        String layerId = layer.getLayerId();

        List<FoundLayerCallback> callbacks = layerWaiters.get(layerId);
        if (callbacks != null) {
            for (FoundLayerCallback callback : callbacks) {
                callback.found(layer);
            }
        }
        layerWaiters.remove(layerId);
    }

    public void waitForLayer(String layerID, FoundLayerCallback callback) {
        Layer layer = LayerUtils.getLayer(mMap.getStyle(), layerID);
        if (layer != null) {
            callback.found(layer);
        } else {
            List<FoundLayerCallback> waiters = layerWaiters.get(layerID);
            if (waiters == null) {
                waiters = new ArrayList<FoundLayerCallback>();
                layerWaiters.put(layerID, waiters);
            }
            waiters.add(callback);
        }
    }

}