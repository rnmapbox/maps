package com.mapbox.rctmgl.components.mapview;

import android.util.Log;
import android.view.View;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ConvertUtils;
import com.mapbox.rctmgl.utils.FilterParser;
import com.mapbox.rctmgl.utils.GeoJSONUtils;
import com.mapbox.services.commons.geojson.Point;

import java.util.Arrays;
import java.util.Map;

import javax.annotation.Nullable;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapViewManager extends AbstractEventEmitter<RCTMGLMapView> {
    public static final String LOG_TAG = RCTMGLMapViewManager.class.getSimpleName();
    public static final String REACT_CLASS = RCTMGLMapView.class.getSimpleName();

    public RCTMGLMapViewManager(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    protected void onAfterUpdateTransaction(RCTMGLMapView mapView) {
        super.onAfterUpdateTransaction(mapView);

        if (mapView.getMapboxMap() == null) {
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
        return new RCTMGLMapView(themedReactContext, this, null);
    }

    @Override
    public void onDropViewInstance(RCTMGLMapView mapView) {
        try {
            mapView.dispose();
        } catch (Exception e) {
            Log.w(LOG_TAG, e.getLocalizedMessage());
        }
    }

    //region React Props

    @ReactProp(name="styleURL")
    public void setStyleURL(RCTMGLMapView mapView, String styleURL) {
        mapView.setReactStyleURL(styleURL);
    }

    @ReactProp(name="animated")
    public void setAnimated(RCTMGLMapView mapView, boolean isAnimated) {
        mapView.setReactAnimated(isAnimated);
    }

    @ReactProp(name="zoomEnabled")
    public void setZoomEnabled(RCTMGLMapView mapView, boolean zoomEnabled) {
        mapView.setReactZoomEnabled(zoomEnabled);
    }

    @ReactProp(name="scrollEnabled")
    public void setScrollEnabled(RCTMGLMapView mapView, boolean scrollEnabled) {
        mapView.setReactScrollEnabled(scrollEnabled);
    }

    @ReactProp(name="pitchEnabled")
    public void setPitchEnabled(RCTMGLMapView mapView, boolean pitchEnabled) {
        mapView.setReactPitchEnabled(pitchEnabled);
    }

    @ReactProp(name="rotateEnabled")
    public void setRotateEnabled(RCTMGLMapView mapView, boolean rotateEnabled) {
        mapView.setReactRotateEnabled(rotateEnabled);
    }

    @ReactProp(name="attributionEnabled")
    public void setAttributionEnabled(RCTMGLMapView mapView, boolean attributionEnabled) {
        mapView.setReactAttributionEnabled(attributionEnabled);
    }

    @ReactProp(name="logoEnabled")
    public void setLogoEnabled(RCTMGLMapView mapView, boolean logoEnabled) {
        mapView.setReactLogoEnabled(logoEnabled);
    }

    @ReactProp(name="compassEnabled")
    public void setCompassEnabled(RCTMGLMapView mapView, boolean compassEnabled) {
        mapView.setReactCompassEnabled(compassEnabled);
    }

    @ReactProp(name="heading")
    public void setHeading(RCTMGLMapView mapView, double heading) {
        mapView.setReactHeading(heading);
    }

    @ReactProp(name="pitch")
    public void setPitch(RCTMGLMapView mapView, double pitch) {
        mapView.setReactPitch(pitch);
    }

    @ReactProp(name="zoomLevel")
    public void setZoomLevel(RCTMGLMapView mapView, double zoomLevel) {
        mapView.setReactZoomLevel(zoomLevel);
    }

    @ReactProp(name="minZoomLevel")
    public void setMinZoomLevel(RCTMGLMapView mapView, double minZoomLevel) {
        mapView.setReactMinZoomLevel(minZoomLevel);
    }

    @ReactProp(name="maxZoomLevel")
    public void setMaxZoomLevel(RCTMGLMapView mapView, double maxZoomLevel) {
        mapView.setReactMaxZoomLevel(maxZoomLevel);
    }

    @ReactProp(name="contentInset")
    public void setContentInset(RCTMGLMapView mapView, ReadableArray array) {
        mapView.setReactContentInset(array);
    }

    @ReactProp(name="centerCoordinate")
    public void setCenterCoordinate(RCTMGLMapView mapView, String featureJSONStr) {
        Point centerCoordinate = GeoJSONUtils.toPointGeometry(featureJSONStr);
        if (centerCoordinate != null) {
            mapView.setReactCenterCoordinate(centerCoordinate);
        }
    }

    @ReactProp(name="showUserLocation")
    public void setShowUserLocation(RCTMGLMapView mapView, boolean showUserLocation) {
        mapView.setReactShowUserLocation(showUserLocation);
    }

    @ReactProp(name="userTrackingMode")
    public void setUserTrackingMode(RCTMGLMapView mapView, int userTrackingMode) {
        mapView.setReactUserTrackingMode(userTrackingMode);
    }

    @ReactProp(name="userLocationVerticalAlignment")
    public void setUserLocationVerticalAlignment(RCTMGLMapView mapView, int userLocationVerticalAlignment) {
        mapView.setReactUserLocationVerticalAlignment(userLocationVerticalAlignment);
    }

    //endregion

    //region Custom Events

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.MAP_CLICK, "onPress")
                .put(EventKeys.MAP_LONG_CLICK,"onLongPress")
                .put(EventKeys.MAP_ONCHANGE, "onMapChange")
                .put(EventKeys.MAP_USER_TRACKING_MODE_CHANGE, "onUserTrackingModeChange")
                .put(EventKeys.MAP_ANDROID_CALLBACK, "onAndroidCallback")
                .build();
    }

    //endregion

    //region React Methods

    public static final int METHOD_SET_CAMERA = 1;
    public static final int METHOD_QUERY_FEATURES_POINT = 2;
    public static final int METHOD_QUERY_FEATURES_RECT = 3;
    public static final int METHOD_VISIBLE_BOUNDS = 4;
    public static final int METHOD_GET_POINT_IN_VIEW = 5;
    public static final int METHOD_TAKE_SNAP = 6;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("setCamera", METHOD_SET_CAMERA)
                .put("queryRenderedFeaturesAtPoint", METHOD_QUERY_FEATURES_POINT)
                .put("queryRenderedFeaturesInRect", METHOD_QUERY_FEATURES_RECT)
                .put("getVisibleBounds", METHOD_VISIBLE_BOUNDS)
                .put("getPointInView", METHOD_GET_POINT_IN_VIEW)
                .put("takeSnap", METHOD_TAKE_SNAP)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLMapView mapView, int commandID, @Nullable ReadableArray args) {
        switch (commandID) {
            case METHOD_SET_CAMERA:
                mapView.setCamera(args.getString(0), args.getMap(1));
                break;
            case METHOD_QUERY_FEATURES_POINT:
                mapView.queryRenderedFeaturesAtPoint(
                        args.getString(0),
                        ConvertUtils.toPointF(args.getArray(1)),
                        FilterParser.getFilterList(args.getArray(2)),
                        ConvertUtils.toStringList(args.getArray(3)));
                break;
            case METHOD_QUERY_FEATURES_RECT:
                mapView.queryRenderedFeaturesInRect(
                        args.getString(0),
                        ConvertUtils.toRectF(args.getArray(1)),
                        FilterParser.getFilterList(args.getArray(2)),
                        ConvertUtils.toStringList(args.getArray(3)));
                break;
            case METHOD_VISIBLE_BOUNDS:
                mapView.getVisibleBounds(args.getString(0));
                break;
            case METHOD_GET_POINT_IN_VIEW:
                mapView.getPointInView(args.getString(0), GeoJSONUtils.toLatLng(args.getArray(1)));
                break;
            case METHOD_TAKE_SNAP:
                mapView.takeSnap(args.getString(0), args.getBoolean(1));
                break;
        }
    }

    //endregion
}
