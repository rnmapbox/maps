package com.mapbox.rctmgl.components.mapview;

import android.util.Log;
import android.view.Gravity;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.LayoutShadowNode;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
/*
import com.mapbox.mapboxsdk.gqeometry.LatLngBounds;
import com.mapbox.mapboxsdk.log.Logger;
import com.mapbox.mapboxsdk.maps.MapboxMap;
 */
import com.mapbox.maps.MapboxMap;

import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.events.constants.EventKeys;
/*
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.ExpressionParser;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.geojson.FeatureCollection;
import com.mapbox.geojson.Point;
 */

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;
import java.util.concurrent.RunnableFuture;

import javax.annotation.Nullable;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapViewManager extends AbstractEventEmitter<RCTMGLMapView> {
    public static final String LOG_TAG = "RCTMGLMapViewManager";
    public static final String REACT_CLASS = "RCTMGLMapView";

    private Map<Integer, RCTMGLMapView> mViews;

    public RCTMGLMapViewManager(ReactApplicationContext context) {
        super(context);
        mViews = new HashMap<>();
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public LayoutShadowNode createShadowNodeInstance() {
        return new MapShadowNode(this);
    }

    @Override
    public Class<? extends LayoutShadowNode> getShadowNodeClass() {
        return MapShadowNode.class;
    }

    @Override
    protected void onAfterUpdateTransaction(RCTMGLMapView mapView) {
        super.onAfterUpdateTransaction(mapView);

        if (mapView.getMapboxMap() == null) {
            mViews.put(mapView.getId(), mapView);
            mapView.init();
        }
    }

    @Override
    public void addView(RCTMGLMapView mapView, View childView, int childPosition) {
        mapView.addFeature(childView, childPosition);
    }

    @Override
    public int getChildCount(RCTMGLMapView mapView) {
        return mapView.getFeatureCount();
    }

    @Override
    public View getChildAt(RCTMGLMapView mapView, int index) {
        return mapView.getFeatureAt(index);
    }

    @Override
    public void removeViewAt(RCTMGLMapView mapView, int index) {
        mapView.removeFeature(index);
    }

    @Override
    protected RCTMGLMapView createViewInstance(ThemedReactContext themedReactContext) {
        return new RCTMGLMapView(themedReactContext, this/*, null*/);
    }

    @Override
    public void onDropViewInstance(RCTMGLMapView mapView) {
        int reactTag = mapView.getId();

        if (mViews.containsKey(reactTag)) {
            mViews.remove(reactTag);
        }

        super.onDropViewInstance(mapView);
    }

    public RCTMGLMapView getByReactTag(int reactTag) {
        return mViews.get(reactTag);
    }

    //region React Props

    @ReactProp(name="styleURL")
    public void setStyleURL(RCTMGLMapView mapView, String styleURL) {
        mapView.setReactStyleURL(styleURL);
    }

    @ReactProp(name="preferredFramesPerSecond")
    public void setPreferredFramesPerSecond(RCTMGLMapView mapView, int preferredFramesPerSecond) {
        //mapView.setReactPreferredFramesPerSecond(preferredFramesPerSecond);
    }

    @ReactProp(name="localizeLabels")
    public void setLocalizeLabels(RCTMGLMapView mapView, boolean localizeLabels) {
        //mapView.setLocalizeLabels(localizeLabels);
    }

    @ReactProp(name="zoomEnabled")
    public void setZoomEnabled(RCTMGLMapView mapView, boolean zoomEnabled) {
        //mapView.setReactZoomEnabled(zoomEnabled);
    }

    @ReactProp(name="scrollEnabled")
    public void setScrollEnabled(RCTMGLMapView mapView, boolean scrollEnabled) {
        //mapView.setReactScrollEnabled(scrollEnabled);
    }

    @ReactProp(name="pitchEnabled")
    public void setPitchEnabled(RCTMGLMapView mapView, boolean pitchEnabled) {
        //mapView.setReactPitchEnabled(pitchEnabled);
    }

    @ReactProp(name="rotateEnabled")
    public void setRotateEnabled(RCTMGLMapView mapView, boolean rotateEnabled) {
        //mapView.setReactRotateEnabled(rotateEnabled);
    }

    @ReactProp(name="attributionEnabled")
    public void setAttributionEnabled(RCTMGLMapView mapView, boolean attributionEnabled) {
        //mapView.setReactAttributionEnabled(attributionEnabled);
    }

    @ReactProp(name="attributionPosition")
    public void setAttributionPosition(RCTMGLMapView mapView, @Nullable ReadableMap attributionPosition) {
        //mapView.setReactAttributionPosition(attributionPosition);
    }

    @ReactProp(name="logoEnabled")
    public void setLogoEnabled(RCTMGLMapView mapView, boolean logoEnabled) {
        //mapView.setReactLogoEnabled(logoEnabled);
    }

    @ReactProp(name="logoPosition")
    public void setLogoPosition(RCTMGLMapView mapView, ReadableMap logoPosition) {
        //mapView.setReactLogoPosition(logoPosition);
    }

    @ReactProp(name="compassEnabled")
    public void setCompassEnabled(RCTMGLMapView mapView, boolean compassEnabled) {
        //mapView.setReactCompassEnabled(compassEnabled);
    }

    @ReactProp(name="compassViewMargins")
    public void setCompassViewMargins(RCTMGLMapView mapView, ReadableMap compassViewMargins){
        //mapView.setReactCompassViewMargins(compassViewMargins);
    }

    @ReactProp(name="compassViewPosition")
    public void setCompassViewPosition(RCTMGLMapView mapView, int compassViewPosition) {
        //mapView.setReactCompassViewPosition(compassViewPosition);
    }

    @ReactProp(name="contentInset")
    public void setContentInset(RCTMGLMapView mapView, ReadableArray array) {
        //mapView.setReactContentInset(array);
    }

    @ReactProp(name = "tintColor", customType = "Color")
    public void setTintColor(RCTMGLMapView mapView, @Nullable Integer tintColor) {
        //mapView.setTintColor(tintColor);
    }

    //endregion

    //region Custom Events

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.MAP_CLICK, "onPress")
                .put(EventKeys.MAP_LONG_CLICK,"onLongPress")
                .put(EventKeys.MAP_ONCHANGE, "onMapChange")
                .put(EventKeys.MAP_ON_LOCATION_CHANGE, "onLocationChange")
                .put(EventKeys.MAP_USER_TRACKING_MODE_CHANGE, "onUserTrackingModeChange")
                .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
                .build();
    }

    //endregion

    //region React Methods
    public static final int METHOD_QUERY_FEATURES_POINT = 2;
    public static final int METHOD_QUERY_FEATURES_RECT = 3;
    public static final int METHOD_VISIBLE_BOUNDS = 4;
    public static final int METHOD_GET_POINT_IN_VIEW = 5;
    public static final int METHOD_GET_COORDINATE_FROM_VIEW = 6;
    public static final int METHOD_TAKE_SNAP = 7;
    public static final int METHOD_GET_ZOOM = 8;
    public static final int METHOD_GET_CENTER = 9;
    public static final int METHOD_SET_HANDLED_MAP_EVENTS = 10;
    public static final int METHOD_SHOW_ATTRIBUTION = 11;
    public static final int METHOD_SET_SOURCE_VISIBILITY = 12;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("queryRenderedFeaturesAtPoint", METHOD_QUERY_FEATURES_POINT)
                .put("queryRenderedFeaturesInRect", METHOD_QUERY_FEATURES_RECT)
                .put("getVisibleBounds", METHOD_VISIBLE_BOUNDS)
                .put("getPointInView", METHOD_GET_POINT_IN_VIEW)
                .put("getCoordinateFromView", METHOD_GET_COORDINATE_FROM_VIEW)
                .put("takeSnap", METHOD_TAKE_SNAP)
                .put("getZoom", METHOD_GET_ZOOM)
                .put("getCenter", METHOD_GET_CENTER)
                .put( "setHandledMapChangedEvents", METHOD_SET_HANDLED_MAP_EVENTS)
                .put("showAttribution", METHOD_SHOW_ATTRIBUTION)
                .put("setSourceVisibility", METHOD_SET_SOURCE_VISIBILITY)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLMapView mapView, int commandID, @Nullable ReadableArray args) {
        // allows method calls to work with componentDidMount
        MapboxMap mapboxMap = mapView.getMapboxMap();
        if (mapboxMap == null) {
//            mapView.enqueuePreRenderMapMethod(commandID, args);
            return;
        }
/*
        switch (commandID) {
            case METHOD_QUERY_FEATURES_POINT:
                mapView.queryRenderedFeaturesAtPoint(
                        args.getString(0),
                        ConvertUtils.toPointF(args.getArray(1)),
                        ExpressionParser.from(args.getArray(2)),
                        ConvertUtils.toStringList(args.getArray(3)));
                break;
            case METHOD_QUERY_FEATURES_RECT:
                mapView.queryRenderedFeaturesInRect(
                        args.getString(0),
                        ConvertUtils.toRectF(args.getArray(1)),
                        ExpressionParser.from(args.getArray(2)),
                        ConvertUtils.toStringList(args.getArray(3)));
                break;
            case METHOD_VISIBLE_BOUNDS:
                mapView.getVisibleBounds(args.getString(0));
                break;
            case METHOD_GET_POINT_IN_VIEW:
                mapView.getPointInView(args.getString(0), GeoJSONUtils.toLatLng(args.getArray(1)));
                break;
            case METHOD_GET_COORDINATE_FROM_VIEW:
                mapView.getCoordinateFromView(args.getString(0), ConvertUtils.toPointF(args.getArray(1)));
                break;
            case METHOD_TAKE_SNAP:
                mapView.takeSnap(args.getString(0), args.getBoolean(1));
                break;
            case METHOD_GET_ZOOM:
                mapView.getZoom(args.getString(0));
                break;
            case METHOD_GET_CENTER:
                mapView.getCenter(args.getString(0));
                break;
            case METHOD_SET_HANDLED_MAP_EVENTS:
                if(args != null) {
                    ArrayList<String> eventsArray = new ArrayList<>();
                    for (int i = 1; i < args.size(); i++) {
                        eventsArray.add(args.getString(i));
                    }
                    mapView.setHandledMapChangedEvents(eventsArray);
                }
                break;
            case METHOD_SHOW_ATTRIBUTION:
                mapView.showAttribution();
                break;
            case METHOD_SET_SOURCE_VISIBILITY:
                mapView.setSourceVisibility(
                        args.getBoolean(1),
                        args.getString(2),
                        args.getString(3)
                );

        }*/
    }

    //endregion

    private static final class MapShadowNode extends LayoutShadowNode {
        private RCTMGLMapViewManager mViewManager;

        public MapShadowNode(RCTMGLMapViewManager viewManager) {
            mViewManager = viewManager;
        }

        @Override
        public void dispose() {
            super.dispose();
            diposeNativeMapView();
        }

        /**
         * We need this mapview to dispose (calls into nativeMap.destroy) before ReactNative starts tearing down the views in
         * onDropViewInstance.
         */
        private void diposeNativeMapView() {
            final RCTMGLMapView mapView = mViewManager.getByReactTag(getReactTag());

            if (mapView != null)
            {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run()
                    {
                        try
                        {
//                            mapView.dispose();
                        }
                        catch (Exception ex)
                        {
                            Log.e(LOG_TAG , " disposeNativeMapView() exception destroying map view", ex);
                        }
                    }
                });
            }
        }
    }
}

