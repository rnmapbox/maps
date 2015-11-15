package com.mapbox.reactnativemapboxgl;

import android.graphics.Color;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.uimanager.ReactProp;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.constants.MyLocationTracking;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.views.MapView;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.facebook.react.uimanager.events.RCTEventEmitter;

import javax.annotation.Nullable;

public class ReactNativeMapboxGLManager extends SimpleViewManager<MapView> {
    public static final String REACT_CLASS = "RCTMapbox";

    public static final String PROP_ACCESS_TOKEN = "accessToken";
    public static final String PROP_ANNOTATIONS = "annotations";
    public static final String PROP_CENTER_COORDINATE = "centerCoordinate";
    public static final String PROP_DEBUG_ACTIVE = "debugActive";
    public static final String PROP_DIRECTION = "direction";
    public static final String PROP_ONREGIONCHANGE = "onRegionChange";
    public static final String PROP_ROTATION_ENABLED = "rotationEnabled";
    public static final String PROP_SCROLL_ENABLED = "scrollEnabled";
    public static final String PROP_USER_LOCATON = "showsUserLocation";
    public static final String PROP_STYLE_URL = "styleUrl";
    public static final String PROP_USER_TRACKING_MODE = "UserLocationTrackingMode";
    public static final String PROP_ZOOM_ENABLED = "zoomEnabled";
    public static final String PROP_ZOOM_LEVEL = "zoomLevel";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public MapView createViewInstance(ThemedReactContext context) {
        MapView mv = new MapView(context, "pk.foo");
        mv.onCreate(null);
        return mv;
    }

    @ReactProp(name = PROP_ACCESS_TOKEN)
    public void setAccessToken(MapView view, @Nullable String value) {
        if (value == null || value.isEmpty()) {
            Log.e(REACT_CLASS, "Error: No access token provided");
        } else {
            view.setAccessToken(value);
        }
    }

    @ReactProp(name = PROP_ANNOTATIONS)
    public void setAnnotations(MapView view, @Nullable ReadableArray value) {
        if (value == null || value.size() < 1) {
            Log.e(REACT_CLASS, "Error: No annotations");
        } else {
            int size = value.size();
            for (int i = 0; i < size; i++) {
                ReadableMap annotation = value.getMap(i);
                String type = annotation.getString("type");
                if (type.equals("point")) {
                    double latitude = annotation.getArray("coordinates").getDouble(0);
                    double longitude = annotation.getArray("coordinates").getDouble(1);
                    LatLng markerCenter = new LatLng(latitude, longitude);
                    MarkerOptions marker = new MarkerOptions();
                    marker.position(markerCenter);
                    if (annotation.hasKey("title")) {
                        String title = annotation.getString("title");
                        marker.title(title);
                    }
                    if (annotation.hasKey("subtitle")) {
                        String subtitle = annotation.getString("subtitle");
                        marker.snippet(subtitle);
                    }
                    view.addMarker(marker);
                } else if (type.equals("polyline")) {
                    int coordSize = annotation.getArray("coordinates").size();
                    PolylineOptions polyline = new PolylineOptions();
                    for (int p = 0; p < coordSize; p++) {
                        double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
                        double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
                        polyline.add(new LatLng(latitude, longitude));
                    }
                    if (annotation.hasKey("alpha")) {
                        double strokeAlpha = annotation.getDouble("alpha");
                        polyline.alpha((float) strokeAlpha);
                    }
                    if (annotation.hasKey("strokeColor")) {
                        int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
                        polyline.color(strokeColor);
                    }
                    if (annotation.hasKey("strokeWidth")) {
                        float strokeWidth = annotation.getInt("strokeWidth");
                        polyline.width(strokeWidth);
                    }
                    view.addPolyline(polyline);
                } else if (type.equals("polygon")) {
                    int coordSize = annotation.getArray("coordinates").size();
                    PolygonOptions polygon = new PolygonOptions();
                    for (int p = 0; p < coordSize; p++) {
                        double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
                        double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
                        polygon.add(new LatLng(latitude, longitude));
                    }
                    if (annotation.hasKey("alpha")) {
                        double fillAlpha = annotation.getDouble("alpha");
                        polygon.alpha((float) fillAlpha);
                    }
                    if (annotation.hasKey("fillColor")) {
                        int fillColor = Color.parseColor(annotation.getString("fillColor"));
                        polygon.fillColor(fillColor);
                    }
                    if (annotation.hasKey("strokeColor")) {
                        int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
                        polygon.strokeColor(strokeColor);
                    }
                    view.addPolygon(polygon);
                }
            }
        }
    }

    @ReactProp(name = PROP_DEBUG_ACTIVE, defaultBoolean = false)
    public void setDebugActive(MapView view, Boolean value) {
        view.setDebugActive(value);
    }

    @ReactProp(name = PROP_DIRECTION, defaultFloat = 0f)
    public void setDirection(MapView view, float value) {
        view.setDirection(value);
    }

    @ReactProp(name = PROP_ONREGIONCHANGE, defaultBoolean=true)
    public void onMapChanged(final MapView view, Boolean value) {
        view.addOnMapChangedListener(new MapView.OnMapChangedListener() {
            @Override
            public void onMapChanged(int change) {
                if (change == MapView.REGION_DID_CHANGE || change == MapView.REGION_DID_CHANGE_ANIMATED) {
                    WritableMap event = Arguments.createMap();
                    WritableMap location = Arguments.createMap();
                    location.putDouble("latitude", view.getCenterCoordinate().getLatitude());
                    location.putDouble("longitude", view.getCenterCoordinate().getLongitude());
                    location.putDouble("zoom", view.getZoomLevel());
                    event.putMap("src", location);
                    ReactContext reactContext = (ReactContext) view.getContext();
                    reactContext.getJSModule(RCTEventEmitter.class).receiveEvent(view.getId(), "topChange", event);
                }
            }
        });
    }

    @ReactProp(name = PROP_CENTER_COORDINATE)
    public void setCenterCoordinate(MapView view, @Nullable ReadableMap center) {
        if (center != null) {
            double latitude = center.getDouble("latitude");
            double longitude = center.getDouble("longitude");
            view.setCenterCoordinate(new LatLng(latitude, longitude));
        }else{
            Log.w(REACT_CLASS, "No CenterCoordinate provided");
        }
    }

    @ReactProp(name = PROP_ROTATION_ENABLED, defaultBoolean = true)
    public void setRotateEnabled(MapView view, Boolean value) {
        view.setRotateEnabled(value);
    }

    @ReactProp(name = PROP_USER_LOCATON, defaultBoolean = true)
    public void setMyLocationEnabled(MapView view, Boolean value) {
        view.setMyLocationEnabled(value);
    }

    @ReactProp(name = PROP_STYLE_URL)
    public void setStyleUrl(MapView view, @Nullable String value) {
        if (value != null && !value.isEmpty()) {
            view.setStyleUrl(value);
        }else{
            Log.w(REACT_CLASS, "No StyleUrl provided");
        }
    }

    @ReactProp(name = PROP_USER_TRACKING_MODE)
    public void setMyLocationTrackingMode(MapView view, @Nullable String mode) {
        if (mode != null && !mode.isEmpty()) {
            if (mode.equals("NONE")) {
                view.setMyLocationTrackingMode(MyLocationTracking.TRACKING_NONE);
            } else if (mode.equals("FOLLOW")) {
                view.setMyLocationTrackingMode(MyLocationTracking.TRACKING_FOLLOW);
            }
        } else {
            view.setMyLocationTrackingMode(MyLocationTracking.TRACKING_NONE);
            Log.w(REACT_CLASS, "ErrorTracking mode not found. Setting to NONE.");
        }
    }

    @ReactProp(name = PROP_ZOOM_ENABLED, defaultBoolean = true)
    public void setZoomEnabled(MapView view, Boolean value) {
        view.setZoomEnabled(value);
    }

    @ReactProp(name = PROP_ZOOM_LEVEL, defaultFloat = 0f)
    public void setZoomLevel(MapView view, float value) {
        view.setZoomLevel(value);
    }

    @ReactProp(name = PROP_SCROLL_ENABLED, defaultBoolean = true)
    public void setScrollEnabled(MapView view, Boolean value) {
        view.setScrollEnabled(value);
    }
}
