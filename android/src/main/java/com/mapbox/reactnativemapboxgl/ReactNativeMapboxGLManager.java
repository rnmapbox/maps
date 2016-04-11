
package com.mapbox.reactnativemapboxgl;

import android.graphics.Color;
import android.util.Log;
import android.os.StrictMode;
import android.location.Location;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.mapbox.mapboxsdk.annotations.Marker;
import com.mapbox.mapboxsdk.camera.CameraUpdateFactory;
import android.graphics.RectF;
import com.mapbox.mapboxsdk.geometry.CoordinateBounds;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.mapbox.mapboxsdk.annotations.MarkerOptions;
import com.mapbox.mapboxsdk.annotations.PolygonOptions;
import com.mapbox.mapboxsdk.annotations.PolylineOptions;
import com.mapbox.mapboxsdk.geometry.LatLng;
import com.mapbox.mapboxsdk.views.MapView;
import com.mapbox.mapboxsdk.camera.CameraPosition;
import com.mapbox.mapboxsdk.annotations.Icon;
import com.mapbox.mapboxsdk.annotations.IconFactory;
import android.graphics.drawable.Drawable;
import android.graphics.BitmapFactory;
import android.graphics.Bitmap;
import java.io.InputStream;
import java.io.IOException;
import java.net.URL;
import java.net.HttpURLConnection;
import android.graphics.drawable.BitmapDrawable;
import javax.annotation.Nullable;
import android.graphics.PointF;

public class ReactNativeMapboxGLManager extends SimpleViewManager<MapView> {

    public static final String REACT_CLASS = "RCTMapbox";

    public static final String PROP_ACCESS_TOKEN = "accessToken";
    public static final String PROP_ANNOTATIONS = "annotations";
    public static final String PROP_CENTER_COORDINATE = "centerCoordinate";
    public static final String PROP_DEBUG_ACTIVE = "debugActive";
    public static final String PROP_DIRECTION = "direction";
    public static final String PROP_ONOPENANNOTATION = "onOpenAnnotation";
    public static final String PROP_ONLONGPRESS = "onLongPress";
    public static final String PROP_ONREGIONCHANGE = "onRegionChange";
    public static final String PROP_ONUSER_LOCATION_CHANGE = "onUserLocationChange";
    public static final String PROP_ROTATION_ENABLED = "rotateEnabled";
    public static final String PROP_SCROLL_ENABLED = "scrollEnabled";
    public static final String PROP_USER_LOCATION = "showsUserLocation";
    public static final String PROP_STYLE_URL = "styleURL";
    public static final String PROP_USER_TRACKING_MODE = "userTrackingMode";
    public static final String PROP_ZOOM_ENABLED = "zoomEnabled";
    public static final String PROP_ZOOM_LEVEL = "zoomLevel";
    public static final String PROP_SET_TILT = "tilt";
    public static final String PROP_COMPASS_IS_HIDDEN = "compassIsHidden";
    public static final String PROP_LOGO_IS_HIDDEN = "logoIsHidden";
    public static final String PROP_ATTRIBUTION_BUTTON_IS_HIDDEN = "attributionButtonIsHidden";
    private static String APPLICATION_ID;
    private MapView mapView;

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public MapView createViewInstance(ThemedReactContext context) {
        mapView = new MapView(context, "pk.foo");
        mapView.onCreate(null);
        APPLICATION_ID = context.getPackageName();
        StrictMode.ThreadPolicy policy = new StrictMode.ThreadPolicy.Builder().permitAll().build();
        StrictMode.setThreadPolicy(policy);
        return mapView;
    }

    @ReactProp(name = PROP_ACCESS_TOKEN)
    public void setAccessToken(MapView view, @Nullable String value) {
        if (value == null || value.isEmpty()) {
            Log.e(REACT_CLASS, "Error: No access token provided");
        } else {
            view.setAccessToken(value);
        }
    }

    @ReactProp(name = PROP_SET_TILT)
    public void setTilt(MapView view, @Nullable double pitch) {
        mapView.setTilt(pitch, 1L);
    }

    public static Drawable drawableFromUrl(MapView view, String url) throws IOException {
        Bitmap x;

        HttpURLConnection connection = (HttpURLConnection) new URL(url).openConnection();
        connection.connect();
        InputStream input = connection.getInputStream();

        x = BitmapFactory.decodeStream(input);
        return new BitmapDrawable(view.getResources(), x);
    }

    public static Drawable drawableFromDrawableName(MapView view, String drawableName) {
        Bitmap x;
        int resID = view.getResources().getIdentifier(drawableName, "drawable", APPLICATION_ID);
        x = BitmapFactory.decodeResource(view.getResources(), resID);
        return new BitmapDrawable(view.getResources(), x);
    }

    @ReactProp(name = PROP_ANNOTATIONS)
    public void setAnnotationClear(MapView view, @Nullable ReadableArray value) {
        setAnnotations(view, value, true);
    }

    public void setAnnotations(MapView view, @Nullable ReadableArray value, boolean clearMap) {
        if (value == null || value.size() < 1) {
            Log.e(REACT_CLASS, "Error: No annotations");
        } else {
            if (clearMap) {
                view.removeAllAnnotations();
            }
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
                    if (annotation.hasKey("annotationImage")) {
                        ReadableMap annotationImage = annotation.getMap("annotationImage");
                        String annotationURL = annotationImage.getString("url");
                        try {
                            Drawable image;
                            if (annotationURL.startsWith("image!")) {
                                image = drawableFromDrawableName(mapView, annotationURL.replace("image!", ""));
                            } else {
                                image = drawableFromUrl(mapView, annotationURL);
                            }
                            IconFactory iconFactory = view.getIconFactory();
                            Icon icon = iconFactory.fromDrawable(image);
                            marker.icon(icon);
                        } catch (Exception e) {
                            e.printStackTrace();
                        }
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

    @ReactProp(name = PROP_DIRECTION, defaultDouble = 0)
    public void setDirection(MapView view, double value) {
        view.setDirection(value, true);
    }

    @ReactProp(name = PROP_ONREGIONCHANGE, defaultBoolean = true)
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
                    reactContext
                            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit("onRegionChange", event);
                }
            }
        });
    }

    @ReactProp(name = PROP_ONUSER_LOCATION_CHANGE, defaultBoolean = true)
    public void onMyLocationChange(final MapView view, Boolean value) {
        view.setOnMyLocationChangeListener(new MapView.OnMyLocationChangeListener() {
            @Override
            public void onMyLocationChange(@Nullable Location location) {
                WritableMap event = Arguments.createMap();
                WritableMap locationMap = Arguments.createMap();
                locationMap.putDouble("latitude", location.getLatitude());
                locationMap.putDouble("longitude", location.getLongitude());
                locationMap.putDouble("accuracy", location.getAccuracy());
                locationMap.putDouble("altitude", location.getAltitude());
                locationMap.putDouble("bearing", location.getBearing());
                locationMap.putDouble("speed", location.getSpeed());
                locationMap.putString("provider", location.getProvider());
                event.putMap("src", locationMap);
                ReactContext reactContext = (ReactContext) view.getContext();
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onUserLocationChange", event);
            }
        });
    }

    @ReactProp(name = PROP_ONOPENANNOTATION, defaultBoolean = true)
    public void onMarkerClick(final MapView view, Boolean value) {
        view.setOnMarkerClickListener(new MapView.OnMarkerClickListener() {
            @Override
            public boolean onMarkerClick(@Nullable Marker marker) {
                WritableMap event = Arguments.createMap();
                WritableMap markerObject = Arguments.createMap();
                markerObject.putString("title", marker.getTitle());
                markerObject.putString("subtitle", marker.getSnippet());
                markerObject.putDouble("latitude", marker.getPosition().getLatitude());
                markerObject.putDouble("longitude", marker.getPosition().getLongitude());
                event.putMap("src", markerObject);
                ReactContext reactContext = (ReactContext) view.getContext();
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onOpenAnnotation", event);
                return false;
            }
        });
    }

    @ReactProp(name = PROP_ONLONGPRESS, defaultBoolean = true)
    public void onMapLongClick(final MapView view, Boolean value) {
        view.setOnMapLongClickListener(new MapView.OnMapLongClickListener() {
            @Override
            public void onMapLongClick(@Nullable LatLng location) {
                WritableMap event = Arguments.createMap();
                WritableMap loc = Arguments.createMap();
                loc.putDouble("latitude", location.getLatitude());
                loc.putDouble("longitude", location.getLongitude());
                event.putMap("src", loc);
                ReactContext reactContext = (ReactContext) view.getContext();
                reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("onLongPress", event);
            }
        });
    }

    @ReactProp(name = PROP_CENTER_COORDINATE)
    public void setCenterCoordinate(MapView view, @Nullable ReadableMap center) {
        if (center != null) {
            double latitude = center.getDouble("latitude");
            double longitude = center.getDouble("longitude");
            CameraPosition cameraPosition = new CameraPosition.Builder()
                    .target(new LatLng(latitude, longitude))
                    .build();
            view.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition));
        }else{
            Log.w(REACT_CLASS, "No CenterCoordinate provided");
        }
    }

    @ReactProp(name = PROP_ROTATION_ENABLED, defaultBoolean = true)
    public void setRotateEnabled(MapView view, Boolean value) {
        view.setRotateEnabled(value);
    }

    @ReactProp(name = PROP_USER_LOCATION, defaultBoolean = true)
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

    @ReactProp(name = PROP_USER_TRACKING_MODE, defaultInt = 0)
    public void setMyLocationTrackingMode(MapView view, @Nullable int mode) {
        view.setMyLocationTrackingMode(mode);
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

    @ReactProp(name = PROP_COMPASS_IS_HIDDEN)
    public void setCompassIsHidden(MapView view, Boolean value) {
        view.setCompassEnabled(!value);
    }

    @ReactProp(name = PROP_LOGO_IS_HIDDEN)
    public void setLogoIsHidden(MapView view, Boolean value) {
        int visibility = (value ? android.view.View.INVISIBLE : android.view.View.VISIBLE);
        view.setLogoVisibility(visibility);
    }

    @ReactProp(name = PROP_ATTRIBUTION_BUTTON_IS_HIDDEN)
    public void setAttributionButtonIsHidden(MapView view, Boolean value) {
        int visibility = (value ? android.view.View.INVISIBLE : android.view.View.VISIBLE);
        view.setAttributionVisibility(visibility);
    }

    public void setCenterCoordinateZoomLevel(MapView view, @Nullable ReadableMap center) {
        if (center != null) {
            double latitude = center.getDouble("latitude");
            double longitude = center.getDouble("longitude");
            float zoom = (float)center.getDouble("zoom");
            CameraPosition cameraPosition = new CameraPosition.Builder()
                    .target(new LatLng(latitude, longitude))
                    .zoom(zoom)
                    .build();
            view.moveCamera(CameraUpdateFactory.newCameraPosition(cameraPosition));
        }else{
            Log.w(REACT_CLASS, "No CenterCoordinate provided");
        }
    }

    public void setVisibleCoordinateBounds(MapView view, @Nullable ReadableMap info) {
        final LatLng sw = new LatLng(info.getDouble("latSW"), info.getDouble("lngSW"));
        final LatLng ne = new LatLng(info.getDouble("latNE"), info.getDouble("lngNE"));
        view.setVisibleCoordinateBounds(new CoordinateBounds(sw, ne), new RectF((float) info.getDouble("paddingLeft"), (float) info.getDouble("paddingTop"), (float) info.getDouble("paddingRight"), (float) info.getDouble("paddingBottom")), true);
    }

    public void removeAllAnnotations(MapView view, @Nullable Boolean placeHolder) {
        view.removeAllAnnotations();
    }

    public WritableMap getDirection(MapView view) {
        WritableMap callbackDict = Arguments.createMap();
        callbackDict.putDouble("direction", view.getDirection());
        return callbackDict;
    }

    public WritableMap getCenterCoordinateZoomLevel(MapView view) {
        WritableMap callbackDict = Arguments.createMap();
        CameraPosition center = view.getCameraPosition();
        callbackDict.putDouble("latitude", center.target.getLatitude());
        callbackDict.putDouble("longitude", center.target.getLongitude());
        callbackDict.putDouble("zoomLevel", center.zoom);

        return callbackDict;
    }

    public WritableMap getBounds(MapView view) {
      WritableMap callbackDict = Arguments.createMap();
      int viewportWidth = view.getWidth();
      int viewportHeight = view.getHeight();
      if (viewportWidth > 0 && viewportHeight > 0) {
        LatLng ne = view.fromScreenLocation(new PointF(viewportWidth, 0));
        LatLng sw = view.fromScreenLocation(new PointF(0, viewportHeight));
        callbackDict.putDouble("latNE", ne.getLatitude());
        callbackDict.putDouble("lngNE", ne.getLongitude());
        callbackDict.putDouble("latSW", sw.getLatitude());
        callbackDict.putDouble("lngSW", sw.getLongitude());
      }
      return callbackDict;
    }

    public MapView getMapView() {
        return mapView;
    }
}
