package com.mapbox.reactnativemapboxgl;

import android.graphics.Color;
import android.util.Log;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.uimanager.CatalystStylesDiffMap;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.UIProp;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.views.MapView;
import com.mapbox.mapboxsdk.geometry.LatLng;

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
    @UIProp(UIProp.Type.BOOLEAN)
    public static final String PROP_USER_LOCATON = "showsUserLocation";
    @UIProp(UIProp.Type.STRING)
    public static final String PROP_STYLE_URL = "styleUrl";
    @UIProp(UIProp.Type.STRING)
    public static final String PROP_USER_TRACKING_MODE = "UserLocationTrackingMode";
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
        mv.setAccessToken("pk.foobar"); // Placeholder access token
        mv.onCreate(null);
        return mv;
    }

    @Override
    public void updateView(final MapView view,
                           final CatalystStylesDiffMap props) {

        if (!props.hasKey(PROP_ACCESS_TOKEN)) {
            Log.e("Error", "No access token provided");
        } else {
            view.setAccessToken(props.getString(PROP_ACCESS_TOKEN));
        }
        if (props.hasKey(PROP_USER_TRACKING_MODE)) {
            String mode = props.getString(PROP_USER_TRACKING_MODE);
            if (mode.equals("NONE")) {
                view.setUserLocationTrackingMode(MapView.UserLocationTrackingMode.NONE);
            } else if (mode.equals("FOLLOW")) {
                view.setUserLocationTrackingMode(MapView.UserLocationTrackingMode.FOLLOW);
            } else if (mode.equals("FOLLOW_BEARING")) {
                view.setUserLocationTrackingMode(MapView.UserLocationTrackingMode.FOLLOW_BEARING);
            } else {
                view.setUserLocationTrackingMode(MapView.UserLocationTrackingMode.NONE);
                Log.w("Error", "Tracking mode not found. Setting to NONE.");
            }
        }
        if (props.hasKey(PROP_ANNOTATIONS)) {
            int size = props.getArray(PROP_ANNOTATIONS).size();
            for (int i = 0; i < size; i++) {
                ReadableMap annotation = props.getArray(PROP_ANNOTATIONS).getMap(i);
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
                    if (annotation.hasKey("strokeWidth")) {
                        float strokeWidth = annotation.getInt("strokeWidth");
                        polygon.strokeWidth(strokeWidth);
                    }
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
        if (props.hasKey(PROP_USER_LOCATON)) {
            view.setMyLocationEnabled(props.getBoolean(PROP_USER_LOCATON, true));
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
