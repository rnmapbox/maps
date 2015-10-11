package com.mapbox.reactnativemapboxgl;


import android.graphics.Color;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.uimanager.BaseViewPropertyApplicator;
import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIProp;
import com.facebook.react.uimanager.ViewManager;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.views.MapView;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import android.graphics.Color;

import java.util.Arrays;
import java.util.ArrayList;
import java.util.Objects;
import java.util.List;

public class ReactNativeMapboxGLManager extends SimpleViewManager<MapView> {
    public static final String REACT_CLASS = "RCTMapbox";

    @UIProp(UIProp.Type.STRING)
    public static final String PROP_ACCESS_TOKEN = "accessToken";
    @UIProp(UIProp.Type.ARRAY)
    public static final String PROP_ANNOTATIONS = "annotations";
    @UIProp(UIProp.Type.MAP)
    public static final String PROP_CENTER_COORDINATE = "centerCoordinate";
    @UIProp(UIProp.Type.BOOLEAN)
    public static final String PROP_DEBUG_ACTIVE = "debugActive";
    @UIProp(UIProp.Type.NUMBER)
    public static final String PROP_DIRECTION = "direction";
    @UIProp(UIProp.Type.BOOLEAN)
    public static final String PROP_ROTATION_ENABLED = "rotationEnabled";
    @UIProp(UIProp.Type.STRING)
    public static final String PROP_SCROLL_ENABLED = "scrollEnabled";
    @UIProp(UIProp.Type.STRING)
    public static final String PROP_STYLE_URL = "styleUrl";
    @UIProp(UIProp.Type.BOOLEAN)
    public static final String PROP_ZOOM_ENABLED = "zoomEnabled";
    @UIProp(UIProp.Type.NUMBER)
    public static final String PROP_ZOOM_LEVEL = "zoomLevel";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public MapView createViewInstance(ThemedReactContext context) {
        MapView mv = new MapView(context);
        mv.setAccessToken("pk.eyJ1IjoiYm9iYnlzdWQiLCJhIjoiTi16MElIUSJ9.Clrqck--7WmHeqqvtFdYig");
        mv.setStyleUrl("asset://styles/dark-v8.json");
        mv.onCreate(null);
        mv.onStart();
        return mv;
    }

    @Override
    public void updateView(final MapView view,
                           final CatalystStylesDiffMap props) {

        BaseViewPropertyApplicator.applyCommonViewProperties(view, props);
        if (props.hasKey(PROP_ACCESS_TOKEN)) {
            view.setAccessToken(props.getString(PROP_ACCESS_TOKEN));
        }
        if (props.hasKey(PROP_ANNOTATIONS)) {
            int size = props.getArray(PROP_ANNOTATIONS).size();
            for (int i = 0; i < size; i++) {
                ReadableMap annotation = props.getArray(PROP_ANNOTATIONS).getMap(i);
                String type = annotation.getString("type");
                if (type.equals("point")) {
                    double latitude = annotation.getArray("coordinates").getDouble(0);
                    double longitude = annotation.getArray("coordinates").getDouble(1);
                    String title = annotation.getString("title");
                    String subtitle = annotation.getString("title");
                    LatLng markerCenter = new LatLng(latitude, longitude);
                    MarkerOptions marker = new MarkerOptions();
                    marker.position(markerCenter);
                    marker.title(title);
                    marker.snippet(subtitle);
                    marker.isDraggable();
                    view.addMarker(marker);
                } else if (type.equals("polyline")) {
                    int coordSize = annotation.getArray("coordinates").size();
                    PolylineOptions polyline = new PolylineOptions();
                    for (int p = 0; p < coordSize; p++) {
                        double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
                        double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
                        polyline.add(new LatLng(latitude, longitude));
                    }
                    double strokeAlpha = annotation.getDouble("alpha");
                    int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
                    float strokeWidth = annotation.getInt("strokeWidth");
                    polyline.alpha((float) strokeAlpha);
                    polyline.color(strokeColor);
                    polyline.width(strokeWidth);
                    view.addPolyline(polyline);
                } else if (type.equals("polygon")) {
                    int coordSize = annotation.getArray("coordinates").size();
                    PolygonOptions polygon = new PolygonOptions();
                    for (int p = 0; p < coordSize; p++) {
                        double latitude = annotation.getArray("coordinates").getArray(p).getDouble(0);
                        double longitude = annotation.getArray("coordinates").getArray(p).getDouble(1);
                        polygon.add(new LatLng(latitude, longitude));
                    }
                    double fillAlpha = annotation.getDouble("alpha");
                    int fillColor = Color.parseColor(annotation.getString("fillColor"));
                    int strokeColor = Color.parseColor(annotation.getString("strokeColor"));
                    float strokeWidth = annotation.getInt("strokeWidth");
                    polygon.alpha((float) fillAlpha);
                    polygon.fillColor(fillColor);
                    polygon.strokeColor(strokeColor);
                    polygon.strokeWidth(strokeWidth);
                    view.addPolygon(polygon);
                }
            }
        }
        if (props.hasKey(PROP_DEBUG_ACTIVE)) {
            view.setDebugActive(props.getBoolean(PROP_DEBUG_ACTIVE, false));
        }
        if (props.hasKey(PROP_DIRECTION)) {
            view.setDirection(props.getFloat(PROP_DIRECTION, 0));
        }
        if (props.hasKey(PROP_CENTER_COORDINATE)) {
            ReadableMap center = props.getMap(PROP_CENTER_COORDINATE);
            double latitude = center.getDouble("latitude");
            double longitude = center.getDouble("longitude");
            view.setCenterCoordinate(new LatLng(latitude, longitude));
        }
        if (props.hasKey(PROP_ROTATION_ENABLED)) {
            view.setRotateEnabled(props.getBoolean(PROP_ROTATION_ENABLED, true));
        }
        if (props.hasKey(PROP_SCROLL_ENABLED)) {
            view.setScrollEnabled(props.getBoolean(PROP_SCROLL_ENABLED, true));
        }
        if (props.hasKey(PROP_STYLE_URL)) {
            view.setStyleUrl(props.getString(PROP_STYLE_URL));
        }
        if (props.hasKey(PROP_STYLE_URL)) {
            view.setZoomEnabled(props.getBoolean(PROP_ZOOM_ENABLED, true));
        }
        if (props.hasKey(PROP_ZOOM_LEVEL)) {
            view.setZoomLevel(props.getFloat(PROP_ZOOM_LEVEL, 0));
        }

        super.updateView(view, props);
        }
}
