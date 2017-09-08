package com.mapbox.rctmgl.components.mapview;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.mapbox.services.commons.geojson.FeatureCollection;
import com.mapbox.services.commons.geojson.Point;

import java.util.Map;

import javax.annotation.Nullable;

import com.mapbox.rctmgl.components.AbstractEventEmitter;
import com.mapbox.rctmgl.events.constants.EventKeys;
import com.mapbox.rctmgl.utils.ConvertUtils;

/**
 * Created by nickitaliano on 8/18/17.
 */

public class RCTMGLMapViewManager extends AbstractEventEmitter<RCTMGLMapView> {
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
    protected RCTMGLMapView createViewInstance(ThemedReactContext themedReactContext) {
        return new RCTMGLMapView(themedReactContext, this);
    }

    @Override
    public void onDropViewInstance(RCTMGLMapView mapView) {
        mapView.dispose();
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

    @ReactProp(name="scrollEnabled")
    public void setScrollEnabled(RCTMGLMapView mapView, boolean scrollEnabled) {
        mapView.setReactScrollEnabled(scrollEnabled);
    }

    @ReactProp(name="pitchEnabled")
    public void setPitchEnabled(RCTMGLMapView mapView, boolean pitchEnabled) {
        mapView.setReactPitchEnabled(pitchEnabled);
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

    @ReactProp(name="centerCoordinate")
    public void setCenterCoordinate(RCTMGLMapView mapView, String featureJSONStr) {
        Point centerCoordinate = ConvertUtils.toPointGemetry(featureJSONStr);
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

    //endregion

    //region Custom Events

    @Override
    public Map<String, String> customEvents() {
        return MapBuilder.<String, String>builder()
                .put(EventKeys.MAP_CLICK, "onPress")
                .put(EventKeys.MAP_LONG_CLICK,"onLongPress")
                .put(EventKeys.MAP_ONCHANGE, "onMapChange")
                .build();
    }

    //endregion

    //region React Methods

    public static final int METHOD_SET_CAMERA = 1;

    @Nullable
    @Override
    public Map<String, Integer> getCommandsMap() {
        return MapBuilder.<String, Integer>builder()
                .put("setCamera", METHOD_SET_CAMERA)
                .build();
    }

    @Override
    public void receiveCommand(RCTMGLMapView mapView, int commandID, @Nullable ReadableArray args) {
        switch (commandID) {
            case METHOD_SET_CAMERA:
                mapView.setCamera(args.getMap(0));
                break;
        }
    }

    //endregion
}
